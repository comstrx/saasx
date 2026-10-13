import { describe, expect, test } from "bun:test";
import { applyPatch, createSignals, onTouched, portKey, portMemory, touched } from "@engine/context";
import { memoryStore, typed } from "@engine/storage";

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
        await new Promise((resolve) => setTimeout(resolve, 60));
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
});
