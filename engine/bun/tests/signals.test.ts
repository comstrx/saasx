import { describe, expect, test } from "bun:test";
import { applyPatch, createSignals, forgetPorts, onTouched, portKey, portMemory, touched } from "engine/client";
import { memoryStore, typed } from "engine/storage";

describe("signals and port memory", () => {

    test("signals emit by name and clear together", () => {

        const store = createSignals();

        store.getState().emit("search", "tea");
        expect(store.getState().values).toEqual({ search: "tea" });
        store.getState().clear();
        expect(store.getState().values).toEqual({});

    });
    test("a remembered port answer seeds the next read while fresh and vanishes past its ttl", async () => {

        const store = memoryStore();
        const box = portMemory({ store, ttl: 50 }, "k");

        expect(await box.seed()).toBeUndefined();
        box.keep([1]);
        expect(box.seed()).toEqual([1]);
        await new Promise(( resolve ) => setTimeout(resolve, 60));
        expect(box.seed()).toBeUndefined();
        expect(portMemory(undefined, "k").seed()).toBeUndefined();

    });
    test("a cold start seeds from the store asynchronously, then from memory at once", async () => {

        const store = memoryStore();

        await typed<{ at: number; value: unknown }>(store).write("port:cold", { at: Date.now(), value: [7] });

        const box = portMemory({ store, ttl: 1000 }, "cold");
        const first = box.seed();

        expect(first).toBeInstanceOf(Promise);
        expect(await first).toEqual([7]);
        expect(box.seed()).toEqual([7]);

    });

});
describe("patch by payload", () => {

    const patch = { path: "catalog", key: "id", version: "updated_at" };
    const list = [
        { id: 1, name: "a", updated_at: "2026-10-12T05:00:00Z" },
        { id: 2, name: "b", updated_at: "2026-10-12T05:00:00Z" },
    ];

    test("a held row is replaced in place and the list identity changes", () => {

        const result = applyPatch(
            list,
            true,
            "catalog.event",
            { catalog: { id: 2, name: "B", updated_at: "2026-10-12T06:00:00Z" } },
            patch,
        );

        expect(result.applied).toBe(true);
        expect(result.value).toEqual([list[0], { id: 2, name: "B", updated_at: "2026-10-12T06:00:00Z" }]);
        expect(list[1]?.name).toBe("b");

    });
    test("a stranger is never inserted, an older row never wins, a malformed payload is ignored", () => {

        expect(applyPatch(list, true, "catalog.event", { catalog: { id: 9, name: "z" } }, patch).applied).toBe(false);
        expect(
            applyPatch(
                list,
                true,
                "catalog.event",
                { catalog: { id: 1, name: "old", updated_at: "2026-10-12T04:00:00Z" } },
                patch,
            ).applied,
        ).toBe(false);
        expect(applyPatch(list, true, "catalog.event", { catalog: { name: "no id" } }, patch).applied).toBe(false);
        expect(applyPatch(list, true, "catalog.event", "text", patch).applied).toBe(false);
        expect(applyPatch(undefined, true, "catalog.event", { catalog: { id: 1 } }, patch).applied).toBe(false);

    });
    test("deletions remove by key and a one-row port patches only its own row", () => {

        expect(applyPatch(list, true, "catalog.deleted", { catalog: { id: 1 } }, patch)).toEqual({
            value: [list[1]],
            applied: true,
        });
        expect(applyPatch(list, true, "catalog.event", { catalog: { id: 1, deleted: true } }, patch).value).toEqual([
            list[1],
        ]);
        expect(applyPatch(list[0], false, "catalog.event", { catalog: { id: 1, name: "A" } }, patch)).toEqual({
            value: { ...list[0], name: "A" },
            applied: true,
        });
        expect(applyPatch(list[0], false, "catalog.event", { catalog: { id: 2, name: "B" } }, patch).applied).toBe(
            false,
        );
        expect(applyPatch(list[0], false, "catalog.deleted", { catalog: { id: 1 } }, patch).applied).toBe(false);

    });

});
describe("touches", () => {

    test("a write that touches a feature wakes every listener of that feature once", () => {

        const seen: string[] = [];
        const off = onTouched("products", () => seen.push("a"));
        const other = onTouched("orders", () => seen.push("b"));

        touched(["products"]);
        off();
        touched(["products", "orders"]);
        other();
        expect(seen).toEqual(["a", "b"]);

    });

});
describe("port keys", () => {

    test("a read port's key follows only the route values its inputs reference", () => {

        const port = {
            kind: "read" as const,
            feature: "p",
            operation: "list",
            input: { q: { signal: "search" } },
            many: true,
        };
        const base = { parameters: {}, query: {}, signals: { search: "tea", selected: 1 } };

        expect(portKey(port, base, [])).toBe(portKey(port, { ...base, signals: { search: "tea", selected: 2 } }, []));
        expect(portKey(port, base, [])).not.toBe(portKey(port, { ...base, signals: { search: "milk" } }, []));
        expect(portKey(port, base, ["en"])).not.toBe(portKey(port, base, ["ar"]));

    });
    test("two ports reading one operation with one input share a key, whatever else the ports carry", () => {

        const route = { parameters: {}, query: {}, signals: { search: "tea" } };
        const list = { kind: "read" as const, feature: "p", operation: "list", input: { q: { signal: "search" } }, many: true };
        const live = { ...list, live: { channel: "c", events: ["e"] }, fields: ["name", "price"] };

        expect(portKey(live, route, ["en"])).toBe(portKey(list, route, ["en"]));
        expect(portKey(list, route, ["en"])).not.toBe(portKey({ ...list, operation: "view" }, route, ["en"]));

    });

});
describe("bounded port memory", () => {

    test("the store keeps at most the cache's limit of answers and forgets the oldest first", async () => {

        const store = memoryStore();
        const cache = { store, ttl: 60_000, prefix: "bounded", limit: 3 };

        for ( const key of ["a", "b", "c", "d", "e"] ) portMemory(cache, key).keep([key]);

        await new Promise(( resolve ) => setTimeout(resolve, 10));

        const kept = (await store.keys()).filter(( key ) => key.startsWith("bounded:") && key !== "bounded:index");

        expect(kept.sort()).toEqual(["bounded:c", "bounded:d", "bounded:e"]);

    });
    test("thousands of distinct answers never grow the memory past its ceiling", () => {

        for ( let index = 0; index < 5000; index += 1 ) {

            portMemory({ store: memoryStore(), ttl: 60_000, prefix: "flood" }, `k${index}`).keep(index);

        }

        expect(portMemory({ store: memoryStore(), ttl: 60_000, prefix: "flood" }, "k4999").seed()).toBe(4999);
        expect(portMemory({ store: memoryStore(), ttl: 60_000, prefix: "flood" }, "k0").seed()).toBeInstanceOf(Promise);

    });

    test("forgetting a cache wipes its answers from memory and store, old orphans included, and spares other prefixes", async () => {

        const store = memoryStore();
        const mine = { store, ttl: 60_000, prefix: "mine" };
        const theirs = { store, ttl: 60_000, prefix: "theirs" };

        await store.set("mine:legacy-key", "{\"at\":1,\"value\":1}");
        portMemory(mine, "a").keep(["a"]);
        portMemory(theirs, "b").keep(["b"]);
        await forgetPorts(mine);

        expect((await store.keys()).filter(( key ) => key.startsWith("mine:"))).toEqual([]);
        expect(portMemory(mine, "a").seed()).toBeInstanceOf(Promise);
        expect(portMemory(theirs, "b").seed()).toEqual(["b"]);

    });
    test("the first write under a prefix sweeps keys an older layout left behind", async () => {

        const store = memoryStore();

        await store.set("swept:{\"kind\":\"read\"}", "{\"at\":1,\"value\":1}");
        portMemory({ store, ttl: 60_000, prefix: "swept" }, "fresh").keep(1);
        await new Promise(( resolve ) => setTimeout(resolve, 10));

        expect((await store.keys()).filter(( key ) => key.startsWith("swept:")).sort()).toEqual(["swept:fresh", "swept:index"]);

    });

});
