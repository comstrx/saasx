import { describe, expect, test } from "bun:test";
import {
    base64,
    choose,
    compact,
    deepMerge,
    identifier,
    includes,
    kindOf,
    lanes,
    mapValues,
    pathGet,
    pathSet,
    pick,
    safeKey,
    sleep,
    trace,
    uuid,
} from "engine/base";

describe("object", () => {

    test("a dotted path reads and writes nested values and never walks the prototype", () => {

        expect(pathGet({ meta: { page: 2 } }, "meta.page")).toBe(2);
        expect(pathGet({}, "constructor.name")).toBeUndefined();

        const target: Record<string, unknown> = {};

        pathSet(target, "a.b", 1);
        expect(target).toEqual({ a: { b: 1 } });
        expect(() => pathSet(target, "__proto__.x", 1)).toThrow(TypeError);
        expect(safeKey("__proto__")).toBe(false);

    });
    test("merge is deep for records and replaces everything else", () => {

        expect(deepMerge({ a: { x: 1, y: [1] } }, { a: { y: [2], z: 3 } })).toEqual({ a: { x: 1, y: [2], z: 3 } });
        expect(compact({ a: undefined, b: null, c: 0 })).toEqual({ b: null, c: 0 });
        expect(kindOf([])).toBe("array");

    });

});
describe("identity", () => {

    test("ids have their shapes and base64 round-trips", () => {

        expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(trace("abc-1")).toBe("abc-1");
        expect(trace("bad id")).toMatch(/^[0-9a-f-]{36}$/);
        expect(identifier.test("x.y_z-1")).toBe(true);
        expect(atob(base64(new Uint8Array([104, 105])))).toBe("hi");

    });

});
describe("values", () => {

    test("compact drops undefined but keeps null and false", () => {

        expect(compact({ a: undefined, b: null, c: false, d: 0 })).toEqual({ b: null, c: false, d: 0 });
        expect(compact(undefined)).toEqual({});

    });
    test("choose falls back for anything outside the list, including non-strings", () => {

        expect(choose(["en", "ar"], "ar", "en")).toBe("ar");
        expect(choose(["en", "ar"], "fr", "en")).toBe("en");
        expect(choose(["en", "ar"], 1, "en")).toBe("en");
        expect(includes(["a"], "a")).toBe(true);

    });
    test("kindOf tells null and arrays apart from objects", () => {

        expect(kindOf(null)).toBe("null");
        expect(kindOf([])).toBe("array");
        expect(kindOf({})).toBe("object");
        expect(kindOf(1n)).toBe("bigint");

    });
    test("a trace keeps a well-formed incoming id and replaces anything else with a fresh one", () => {

        expect(trace("req-1.a_b")).toBe("req-1.a_b");
        expect(trace("bad id")).toMatch(/^[0-9a-f-]{36}$/);
        expect(trace(null)).not.toBe(trace(null));
        expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

    });
    test("mapValues hands the key along and pathGet reads only own keys", () => {

        expect(mapValues({ a: 1, b: 2 }, ( value, key ) => `${key}${value}`)).toEqual({ a: "a1", b: "b2" });
        expect(pathGet({ a: { b: 1 } }, "a.b")).toBe(1);
        expect(pathGet({ a: 1 }, "a.b")).toBeUndefined();
        expect(pathGet({}, "toString")).toBeUndefined();
        expect(pathGet({ x: 1 }, "$")).toEqual({ x: 1 });

    });

});
describe("lanes", () => {

    test("work on one lane runs in order, one at a time, and a failure neither stops the lane nor reaches the next caller", async () => {

        const lane = lanes();
        const order: string[] = [];
        const slow = lane("box", async () => {

            await sleep(20);
            order.push("first");

            return 1;

        });
        const broken = lane("box", async () => {

            order.push("second");

            throw new Error("refused");

        });
        const last = lane("box", async () => {

            order.push("third");

            return 3;

        });

        expect(await slow).toBe(1);
        await expect(broken).rejects.toThrow("refused");
        expect(await last).toBe(3);
        expect(order).toEqual(["first", "second", "third"]);

    });
    test("separate lanes never wait for each other", async () => {

        const lane = lanes();
        const order: string[] = [];
        const held = lane("a", async () => {

            await sleep(20);
            order.push("a");

        });

        await lane("b", async () => { order.push("b"); });
        await held;

        expect(order).toEqual(["b", "a"]);

    });

});
describe("pick", () => {

    test("pick keeps only the named keys that the value holds", () => {

        expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
        expect(pick({ a: 1 } as { a: number; b?: number }, ["b"])).toEqual({});

    });

});
