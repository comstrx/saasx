import { createApi, feature, get, many, post, requestContext, resolveApi } from "engine/api";
import { bench, do_not_optimize, run } from "engine/tooling";
import { z } from "engine/validate";

const item = z.object({ id: z.number(), title: z.string(), price: z.string().nullish() });
const endpoints = {
    products: feature(
        { cache: 30 },
        {
            list: get("/products", { limit: z.number().optional(), search: z.string().optional() }, many(item)),
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
const input = {
    context: { spec: "site", currency: "USD", sessionCookie: null, proxies: 0, tenant: "www.shop.test" },
    connections: { primary: { baseUrl: "https://api.shop.test/v1" } },
};
const core = {
    request: { headers: { tenant: "X-Tenant-Domain" } },
    response: { success: { path: "status", equals: true } },
};
const { api, contract } = resolveApi(endpoints, input, {}, seeds, core);
const rows = Array.from({ length: 50 }, ( _, index ) => ({ id: index, title: `Item ${index}`, price: "10.00" }));
const body = JSON.stringify({
    status: true,
    code: "ok",
    message: "done",
    data: rows,
    errors: null,
    meta: { request_id: "r", page: 1, limit: 50, total: 50, pages: 1 },
});
const transport = async () => new Response(body, { status: 200 });
const client = createApi(
    endpoints,
    api,
    contract,
    () => requestContext(api.context, { language: "en", requestId: "r" }),
    { execution: "client", transport, share: false },
);

bench("resolveApi (2 operations)", () => do_not_optimize(resolveApi(endpoints, input, {}, seeds, core)));
bench("requestContext", () => do_not_optimize(requestContext(api.context, { language: "en", host: "shop.test" })));
bench("client round trip, 50 rows decoded", async () => do_not_optimize(await client.products.list({ limit: 50 })));

await run();
