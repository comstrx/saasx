import { describe, expect, test } from "bun:test";
import { Failure } from "@engine/error";
import {
    entityId,
    expandTemplate,
    fillPattern,
    formatBytes,
    interpolate,
    matchPattern,
    parseBytes,
    parseDuration,
    parseQuery,
    queryEntries,
    queryString,
} from "@engine/parse";

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
