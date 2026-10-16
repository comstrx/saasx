import { describe, expect, test } from "bun:test";
import { Failure } from "engine/error";
import {
    entityId,
    entityParam,
    expandTemplate,
    fillPattern,
    formatBytes,
    interpolate,
    matchPattern,
    parseBoolean,
    parseBytes,
    parseDuration,
    parseInteger,
    parseJson,
    parseNumber,
    parseQuery,
    patternKeys,
    placeholders,
    queryEntries,
    queryString,
    segmentsOf,
    textOf,
} from "engine/parse";

describe("patterns", () => {

    test("route patterns match and fill", () => {

        expect(matchPattern("/items/:id", ["items", "7"])).toEqual({ id: "7" });
        expect(fillPattern("/items/:id", { id: "7-slug" })).toBe("/items/7-slug");
        expect(() => fillPattern("/items/:id", { id: "a/b" })).toThrow(Failure);

    });
    test("templates expand with encoding and refuse traversal", () => {

        expect(expandTemplate("/users/{id}", { id: "a b" })).toBe("/users/a%20b");
        expect(() => expandTemplate("/users/{id}", { id: ".." })).toThrow(Failure);
        expect(entityId("42-some-slug")).toBe(42);

    });

});
describe("query and scalars", () => {

    test("nested queries flatten and parse back", () => {

        expect(queryEntries({ filters: { type: "hotel", tags: ["a", "b"] }, page: 2 })).toEqual([
            ["filters[type]", "hotel"],
            ["filters[tags][]", "a"],
            ["filters[tags][]", "b"],
            ["page", "2"],
        ]);
        expect(queryString({ a: 1, b: "" })).toBe("?a=1");

        const query = ["page=2", "tag[]=red", "tag[]=blue"].join("&");

        expect(parseQuery(`?${query}`)).toEqual({ page: "2", tag: ["red", "blue"] });

    });
    test("durations and sizes read and print", () => {

        expect(parseDuration("1.5s")).toBe(1500);
        expect(parseDuration("2m")).toBe(120000);
        expect(parseBytes("1.5MB")).toBe(1572864);
        expect(formatBytes(1572864)).toBe("1.5 MB");

    });
    test("interpolation fills dotted paths and leaves missing values empty", () => {

        expect(interpolate("/go/{item.id}-{item.slug}", { item: { id: 3 } })).toBe("/go/3-");

    });

});
describe("edges", () => {

    test("entity params carry a slug only when it is clean, and ids read back without it", () => {

        expect(entityParam(42, "walk-hotel")).toBe("42-walk-hotel");
        expect(entityParam(42, "Walk Hotel")).toBe("42");
        expect(entityParam(42, null)).toBe("42");
        expect(entityId("42-walk-hotel")).toBe(42);
        expect(entityId("42")).toBe(42);
        expect(entityId("042")).toBeUndefined();
        expect(entityId("x")).toBeUndefined();
        expect(entityId(undefined)).toBeUndefined();

    });
    test("patterns refuse a different depth or a different literal, and filling refuses unsafe segments", () => {

        expect(matchPattern("/items/:id", ["items", "7"])).toEqual({ id: "7" });
        expect(matchPattern("/items/:id", ["items"])).toBeUndefined();
        expect(matchPattern("/items/:id", ["users", "7"])).toBeUndefined();
        expect(patternKeys("/a/:b/c/:d")).toEqual(["b", "d"]);
        expect(fillPattern("/items/:id", { id: "7" })).toBe("/items/7");
        expect(() => fillPattern("/items/:id", { id: "a/b" })).toThrow(Failure);
        expect(() => fillPattern("/items/:id", {})).toThrow(Failure);
        expect(segmentsOf("//a//b/")).toEqual(["a", "b"]);

    });
    test("scalars parse strictly: booleans from known spellings, numbers finite, integers safe", () => {

        expect(parseBoolean("1")).toBe(true);
        expect(parseBoolean(0)).toBe(false);
        expect(parseBoolean("yes")).toBeUndefined();
        expect(parseNumber(" 2.5 ")).toBe(2.5);
        expect(parseNumber("")).toBeUndefined();
        expect(parseNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
        expect(parseInteger("3")).toBe(3);
        expect(parseInteger("3.5")).toBeUndefined();
        expect(parseInteger(2 ** 60)).toBeUndefined();
        expect(parseJson("{bad")).toBeUndefined();
        expect(parseJson(null)).toBeUndefined();

    });
    test("durations and sizes refuse unknown units and round to whole units", () => {

        expect(parseDuration("1.5s")).toBe(1500);
        expect(parseDuration("2 m")).toBe(120_000);
        expect(parseDuration(250)).toBe(250);
        expect(() => parseDuration("1 week")).toThrow(Failure);
        expect(parseBytes("1.5 MB")).toBe(1_572_864);
        expect(() => parseBytes("1 tb")).toThrow(Failure);
        expect(formatBytes(0)).toBe("0 B");
        expect(formatBytes(1536)).toBe("1.5 KB");
        expect(formatBytes(1024 ** 5)).toBe("1024.0 TB");

    });
    test("interpolation encodes through the given function and lists its placeholders", () => {

        expect(interpolate("/s?q={q}", { q: "a b" }, encodeURIComponent)).toBe("/s?q=a%20b");
        expect(interpolate("{a.b} {c} {d}", { a: { b: 1 }, c: true })).toBe("1 true ");
        expect(placeholders("{x} and {y.z}")).toEqual(["x", "y.z"]);
        expect(textOf({})).toBe("");

    });

});
