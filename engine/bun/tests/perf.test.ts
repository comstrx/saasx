import { describe, expect, test } from "bun:test";
import { createApi, feature, get, many, requestContext, resolveApi } from "engine/api";
import { matchScreen } from "engine/screen";
import { catalogueFacts, compileBlock, createWalk } from "engine/spec";
import { formatDate, formatMoney, formatNumber, languageName, localizeTree, plural } from "engine/translate";
import { z } from "engine/validate";

const item = z.object({ id: z.number(), title: z.string() });
const endpoints = {
    products: feature({ cache: 30 }, { list: get("/products", { limit: z.number().optional() }, many(item)) }),
};
const seeds = {
    content: { name: "Site" },
    settings: {
        language: "en",
        languages: ["en"],
        currency: "USD",
        currencies: ["USD"],
        theme: "light",
        themes: ["light"],
    },
};
const input = {
    context: { spec: "site", currency: "USD", sessionCookie: null, proxies: 0, tenant: "www.shop.test" },
    connections: { primary: { baseUrl: "https://api.shop.test/v1" } },
};
const { api, contract } = resolveApi(endpoints, input, {}, seeds);
const rows = Array.from({ length: 50 }, ( _, index ) => ({ id: index, title: `Item ${index}` }));
const body = JSON.stringify({
    status: true,
    data: rows,
    meta: { request_id: "r", page: 1, limit: 50, total: 50, pages: 1 },
});
const client = createApi(
    endpoints,
    api,
    contract,
    () => requestContext(api.context, { language: "en", requestId: "r" }),
    { execution: "client", transport: async () => new Response(body), share: false },
);
const catalogue = catalogueFacts(endpoints);
const features = {
    cards: {
        owner: "client" as const,
        options: { title: "" },
        ports: { items: { kind: "list" as const, fields: ["title"] } },
        access: [],
        signals: [],
    },
};
const block = {
    options: {},
    features: Array.from({ length: 20 }, ( _, index ) => ({
        name: "cards",
        heading: index === 0,
        ports: { items: { read: "products.list", input: { limit: 12 } } },
    })),
    blocks: [],
};
const screens = Array.from({ length: 200 }, ( _, index ) => ({
    name: `s${index}`,
    path: index % 2 ? `/items/${index}/:id` : `/items/${index}`,
}));
const tree = {
    blocks: Array.from({ length: 50 }, () => ({
        options: { title: { key: "nav.home" } },
        list: [{ key: "nav.home" }, 1],
    })),
};

async function median ( work: () => unknown | Promise<unknown>, rounds = 40 ): Promise<number> {

    const samples: number[] = [];

    for ( let index = 0; index < rounds; index += 1 ) {

        const started = performance.now();

        await work();
        samples.push(performance.now() - started);

    }

    return samples.sort(( a, b ) => a - b)[Math.floor(rounds / 2)] ?? 0;

}
describe("performance budgets (median of 40, generous ceilings so only a regression trips them)", () => {

    test("resolving a catalogue stays under 2 ms", async () => {

        expect(await median(() => resolveApi(endpoints, input, {}, seeds))).toBeLessThan(2);

    });
    test("a client round trip decoding 50 rows stays under 2 ms", async () => {

        expect(await median(() => client.products.list({ limit: 50 }))).toBeLessThan(2);

    });
    test("compiling a block of 20 bound features stays under 2 ms", async () => {

        expect(
            await median(() =>
                compileBlock(
                    block,
                    createWalk({
                        params: [],
                        client: true,
                        session: true,
                        backend: true,
                        block: {},
                        site: {},
                        features,
                        catalogue,
                    }),
                    "b",
                ),
            ),
        ).toBeLessThan(2);

    });
    test("formatting the money, date, count and plural of a 50-row table stays under 3 ms", async () => {

        const table = () => {

            for ( let index = 0; index < 50; index += 1 ) {

                formatMoney("ar", index * 12.5, "SAR");
                formatDate("en", 1_760_000_000_000 + index * 86_400_000, "day", "UTC");
                formatNumber("en", index * 1000);
                plural("ar", index, { one: "{n} item", other: "{n} items" });
                languageName("ar", "en");

            }

        };

        expect(await median(table)).toBeLessThan(3);

    });
    test("matching the last of 200 screens stays under 1 ms and localizing 50 blocks under 3 ms", async () => {

        expect(await median(() => matchScreen(screens, ["items", "199", "7"]))).toBeLessThan(1);
        expect(await median(() => localizeTree(tree, { nav: { home: "Home" } }, "en"))).toBeLessThan(3);

    });

});
