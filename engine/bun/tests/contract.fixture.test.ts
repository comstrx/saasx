import { describe, expect, test } from "bun:test";
import process from "node:process";
import { browserConfig, feature, get, many, post, resolveApi } from "engine/api";
import { catalogueFacts, compileApi } from "engine/spec";
import { z } from "engine/validate";

const item = z.object({ id: z.number(), title: z.string() });
const endpoints = {
    products: feature(
        { cache: 30 },
        {
            list: get("/products", { limit: z.number().optional(), type: z.string().optional() }, many(item), {
                request: { fields: { type: "query:filters[type]" } },
            }),
            save: post("/products", { title: z.string() }, item, { execution: "client" }),
        },
    ),
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
const core = {
    request: { headers: { tenant: "X-Tenant-Domain" } },
    response: { success: { path: "status", equals: true } },
};
const api = {
    context: { spec: "site", currency: "USD", sessionCookie: null, proxies: 0, tenant: "www.shop.test" },
    connections: { primary: { baseUrl: "https://api.shop.test/v1" } },
};
const fixture = `${import.meta.dir}/fixtures.json`;

async function frozen (): Promise<unknown> {

    const file = Bun.file(fixture);

    return (await file.exists()) ? file.json() : undefined;

}
describe("the frozen wire contract", () => {

    test("resolving the sample catalogue yields exactly the frozen contract; a change is a deliberate act", async () => {

        const resolved = resolveApi(endpoints, api, { request: { headers: { language: "Locale" } } }, seeds, core);
        const browser = browserConfig(resolved.api, resolved.contract);
        const facts = catalogueFacts(endpoints);
        const plain = JSON.parse(JSON.stringify({ resolved, browser, facts }));
        const saved = await frozen();

        if ( saved === undefined || process.env.FREEZE_CONTRACT ) {

            await Bun.write(fixture, `${JSON.stringify(plain, null, 2)}\n`);

            return;

        }

        expect(plain).toEqual(saved);

    });
    test("a spec without contracts compiles every operation off, with the same values", () => {

        const { api: none, contract } = compileApi({
            identity: "site",
            endpoints,
            seeds,
            currency: "USD",
            backend: null,
            switches: {},
            core,
        });

        expect(none).toBeNull();
        expect(Object.values(contract.features.products ?? {}).every(( wire ) => wire.enabled === false)).toBe(true);
        expect(contract.values.settings).toMatchObject({ currency: "USD" });

    });

});
