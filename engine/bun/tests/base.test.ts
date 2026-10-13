import { describe, expect, test } from "bun:test";
import { base64, compact, deepMerge, identifier, kindOf, pathGet, pathSet, safeKey, trace, uuid } from "@engine/base";

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
