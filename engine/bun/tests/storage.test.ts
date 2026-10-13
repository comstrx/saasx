import { describe, expect, test } from "bun:test";
import { driverStore, lazyStore, memoryStore, namespaced, typed } from "@engine/storage";

describe("storage", () => {

    test("namespaces isolate owners on one store", async () => {

        const store = memoryStore();
        const a = namespaced(store, "a");
        const b = namespaced(store, "b");

        await a.set("k", "1");
        await b.set("k", "2");
        expect(await a.get("k")).toBe("1");
        expect(await a.keys()).toEqual(["k"]);
        expect(await store.keys()).toEqual(["a.k", "b.k"]);

    });
    test("typed storage removes values it cannot decode", async () => {

        const store = memoryStore();
        const box = typed<{ n: number }>(store);

        await box.write("x", { n: 1 });
        await store.set("y", "{bad");
        expect(await box.read("x")).toEqual({ n: 1 });
        expect(await box.read("y")).toBeUndefined();
        expect(await store.get("y")).toBeNull();

    });
    test("a lazy store opens once on first use", async () => {

        let opened = 0;
        const store = lazyStore(() => {

            opened += 1;

            return memoryStore();

        });

        expect(opened).toBe(0);
        await store.set("k", "v");
        expect(await store.get("k")).toBe("v");
        expect(opened).toBe(1);

    });
    test("any getItem/setItem driver becomes a store", async () => {

        const items = new Map<string, string>();
        const store = driverStore({
            getItem: async ( key ) => items.get(key) ?? null,
            setItem: async ( key, value ) => void items.set(key, value),
            removeItem: async ( key ) => void items.delete(key),
            getAllKeys: async () => [...items.keys()],
        });

        await store.set("k", "v");
        expect(await store.get("k")).toBe("v");
        expect(await store.keys()).toEqual(["k"]);

    });

});
