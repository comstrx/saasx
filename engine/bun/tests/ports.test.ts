import { describe, expect, test } from "bun:test";
import { field, fillInput, moneyText, portAnswer, portValue, row, rows } from "engine/client";
import { formatMoney } from "engine/translate";

const route = { parameters: { id: "7" }, query: { q: "tea", tags: ["a", "b"] } };

describe("ports", () => {

    test("references fill from the route and scalars pass through", () => {

        expect(fillInput({ id: { param: "id" }, q: { query: "q" }, limit: 5 }, route)).toEqual({
            id: "7",
            q: "tea",
            limit: 5,
        });

    });
    test("each port kind resolves through its source", async () => {

        const calls: unknown[] = [];
        const source = {
            read: ( ...args: unknown[] ) => {

                calls.push(args);

                return { value: [{ id: 1 }] };

            },
            site: ( path: string ) => ({ path }),
        };

        expect(await portValue({ kind: "data", value: [{ id: 2 }] }, route, source)).toEqual([{ id: 2 }]);
        expect(await portValue({ kind: "site", path: "name" }, route, source)).toEqual({ path: "name" });
        expect(
            await portValue(
                { kind: "read", feature: "products", operation: "list", input: { id: { param: "id" } }, many: true },
                route,
                source,
            ),
        ).toEqual([{ id: 1 }]);
        expect(calls).toEqual([["products", "list", { id: "7" }, true]]);
        expect(
            await portValue(
                {
                    kind: "write",
                    feature: "products",
                    operation: "save",
                    input: {},
                    fields: [],
                    touches: [],
                    permissions: [],
                },
                route,
                source,
            ),
        ).toBeUndefined();
        expect(await portValue(undefined, route, source)).toBeUndefined();

    });
    test("rows, row and field read defensively", () => {

        expect(rows([{ a: 1 }, 2, null])).toEqual([{ a: 1 }]);
        expect(rows("x")).toEqual([]);
        expect(row([{ a: 1 }])).toEqual({ a: 1 });
        expect(field({ meta: { count: 3 } }, "meta.count")).toBe("3");
        expect(field({ meta: {} }, "meta.count")).toBeUndefined();

    });
    test("money speaks from the first field that holds an amount and a currency", () => {

        const item = { sale_price: { amount: "0.00", currency: "USD" }, min_price: { amount: "12.50", currency: "EGP" } };

        expect(moneyText("en", item, "sale_price", "min_price")).toBe(formatMoney("en", 12.5, "EGP").text);
        expect(moneyText("en", item, "sale_price")).toBeUndefined();
        expect(moneyText("en", { price: { amount: "5" } }, "price")).toBeUndefined();
        expect(moneyText("en", null, "price")).toBeUndefined();

    });

});
describe("abort and slugs", () => {

    test("the signal reaches the reader", async () => {

        const controller = new AbortController();
        let seen: AbortSignal | undefined;

        await portValue(
            { kind: "read", feature: "p", operation: "list", input: {}, many: true },
            route,
            {
                read: ( _f, _o, _i, _m, signal ) => {

                    seen = signal;

                    return { value: [] };

                },
                site: () => undefined,
            },
            controller.signal,
        );
        expect(seen).toBe(controller.signal);

    });

});
describe("signals", () => {

    test("a signal reference fills from the route's live signals", () => {

        expect(fillInput({ q: { signal: "search" } }, { ...route, signals: { search: "tea" } })).toEqual({ q: "tea" });
        expect(fillInput({ q: { signal: "search" } }, route)).toEqual({ q: undefined });

    });

});
describe("port answers", () => {

    test("a read answers its value with the pagination the source knows", async () => {

        const source = {
            read: () => ({ value: [{ id: 1 }], pagination: { page: 2, limit: 10, total: 30, pages: 3 } }),
            site: () => undefined,
        };
        const port = { kind: "read" as const, feature: "products", operation: "list", input: {}, many: true };

        expect(await portAnswer(port, route, source)).toEqual({
            value: [{ id: 1 }],
            pagination: { page: 2, limit: 10, total: 30, pages: 3 },
        });
        expect(await portAnswer({ kind: "data", value: [1] }, route, source)).toEqual({ value: [1] });

    });

});
