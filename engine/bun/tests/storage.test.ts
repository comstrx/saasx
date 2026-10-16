import { describe, expect, test } from "bun:test";
import { Failure } from "engine/error";
import { driverStore, lazyStore, memoryStore, namespaced, typed, webStore } from "engine/storage";

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
describe("edges", () => {

    test("a throwing web storage surfaces as a configuration failure, never a raw error", () => {

        const broken = {
            getItem: () => {

                throw new Error("QuotaExceeded");

            },
            setItem: () => undefined,
            removeItem: () => undefined,
            key: () => null,
            length: 0,
        };
        const store = webStore(broken);

        expect(() => store.get("x")).toThrow(Failure);
        expect(store.keys()).toEqual([]);

    });
    test("web storage keys skip holes and a custom codec round-trips its own shape", async () => {

        const items = new Map<string, string>([["a", "1"], ["b", "2"]]);
        const storage = {
            getItem: ( key: string ) => items.get(key) ?? null,
            setItem: ( key: string, value: string ) => void items.set(key, value),
            removeItem: ( key: string ) => void items.delete(key),
            key: ( index: number ) => [...items.keys()][index] ?? null,
            get length () {

                return items.size;

            },
        };
        const store = webStore(storage);
        const numbers = typed<number>(store, {
            encode: ( value ) => `n:${value}`,
            decode: ( text ) => (text.startsWith("n:") ? Number(text.slice(2)) : undefined),
        });

        expect(store.keys()).toEqual(["a", "b"]);
        await numbers.write("n", 7);
        expect(await numbers.read("n")).toBe(7);
        expect(await numbers.read("a")).toBeUndefined();
        expect(store.get("a")).toBeNull();

    });

});
