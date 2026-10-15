import { describe, expect, test } from "bun:test";
import { chunk, groupBy, indexBy, move, partition, range, removeBy, sortBy, sumBy, uniqueBy, upsertBy, zip } from "engine/array";

const rows = [
    { id: 3, name: "c", price: 3 },
    { id: 1, name: "a", price: 1 },
    { id: 2, name: "b", price: 2 },
];

describe("array", () => {

    test("keyed helpers accept a field or a picker", () => {

        expect(uniqueBy([...rows, { id: 1, name: "dup", price: 9 }], "id")).toHaveLength(3);
        expect([...groupBy(rows, ( row ) => row.price > 1).keys()]).toEqual([true, false]);
        expect(indexBy(rows, "id").get(2)?.name).toBe("b");
        expect(sortBy(rows, "name").map(( row ) => row.id)).toEqual([1, 2, 3]);
        expect(sortBy(rows, "price", "desc").map(( row ) => row.id)).toEqual([3, 2, 1]);
        expect(sumBy(rows, "price")).toBe(6);

    });
    test("sort is stable and puts missing values last", () => {

        const mixed = [
            { v: 2, n: 1 },
            { v: undefined, n: 2 },
            { v: 1, n: 3 },
            { v: 2, n: 4 },
        ];

        expect(sortBy(mixed, "v").map(( item ) => item.n)).toEqual([3, 1, 4, 2]);

    });
    test("upsert reports what happened and never inserts when told not to", () => {

        expect(upsertBy(rows, { id: 2, name: "B", price: 20 }, "id")).toMatchObject({ outcome: "updated" });
        expect(upsertBy(rows, { id: 9, name: "z", price: 0 }, "id", false)).toMatchObject({
            outcome: "unchanged",
            items: rows,
        });
        expect(upsertBy(rows, { id: 9, name: "z", price: 0 }, "id").outcome).toBe("inserted");
        expect(removeBy(rows, "id", 1).map(( row ) => row.id)).toEqual([3, 2]);
        expect(rows).toHaveLength(3);

    });
    test("shape helpers", () => {

        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        expect(chunk([1], 0)).toEqual([]);
        expect(partition([1, 2, 3, 4], ( n ) => n % 2 === 0)).toEqual([
            [2, 4],
            [1, 3],
        ]);
        expect(move([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
        expect(move([1, 2, 3], 5, 0)).toEqual([1, 2, 3]);
        expect(range(3, 1)).toEqual([1, 2, 3]);
        expect(zip([1, 2, 3], ["a", "b"])).toEqual([
            [1, "a"],
            [2, "b"],
        ]);

    });

});
describe("edges", () => {

    test("move copies on an out-of-range index and reorders otherwise", () => {

        expect(move([1, 2, 3], 5, 0)).toEqual([1, 2, 3]);
        expect(move([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
        expect(move([1, 2, 3], 2, 0)).toEqual([3, 1, 2]);

    });
    test("chunk refuses a size below one and keeps the tail short", () => {

        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        expect(chunk([1, 2], 0)).toEqual([]);

    });
    test("zip stops at the shorter side and range never goes negative", () => {

        expect(zip([1, 2, 3], ["a", "b"])).toEqual([[1, "a"], [2, "b"]]);
        expect(range(-2)).toEqual([]);
        expect(range(3, 5)).toEqual([5, 6, 7]);

    });
    test("sumBy reads numbers out of strings and treats missing as zero", () => {

        expect(sumBy([{ n: "2.5" }, { n: undefined }, { n: 1 }], "n")).toBe(3.5);
        expect(sumBy([], "n")).toBe(0);

    });
    test("groupBy keeps first-seen order of groups and of members", () => {

        const groups = groupBy([{ k: "b", v: 1 }, { k: "a", v: 2 }, { k: "b", v: 3 }], "k");

        expect([...groups.keys()]).toEqual(["b", "a"]);
        expect(groups.get("b")?.map(( item ) => item.v)).toEqual([1, 3]);

    });

});
