import { describe, expect, test } from "bun:test";
import {
    allowed,
    browserConfig,
    connectionOrigins,
    createApi,
    del,
    feature,
    get,
    many,
    missing,
    need,
    post,
    requestContext,
    resolveApi,
} from "engine/api";
import { z } from "engine/validate";

const item = z.object({ id: z.number(), title: z.string() });
const catalogue = {
    products: feature(
        { permissions: ["user"] },
        {
            list: get("/products", { limit: z.number().optional() }, many(item), { cache: 30 }),
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
const api = {
    context: { spec: "site", currency: "USD", sessionCookie: null, proxies: 1, tenant: null },
    connections: { primary: { baseUrl: "https://api.example.test/v1" } },
};

describe("resolve", () => {

    test("the wire merges defaults, the endpoint layer and the spec overrides", () => {

        const { contract } = resolveApi(
            catalogue,
            api,
            { features: { products: { operations: { list: { cache: 5 } } } } },
            seeds,
        );
        const list = contract.features.products?.list;

        expect(list?.enabled && list.cache).toBe(5);
        expect(list?.enabled && list.request.headers.language?.name).toBe("Accept-Language");

    });
    test("a switched-off operation stays off and an unknown one is refused", () => {

        const { contract } = resolveApi(
            catalogue,
            api,
            { features: { products: { operations: { save: false } } } },
            seeds,
        );

        expect(contract.features.products?.save).toEqual({ enabled: false });
        expect(() =>
            resolveApi(catalogue, api, { features: { products: { operations: { drop: true } } } }, seeds),
        ).toThrow("drop");

    });
    test("the browser projection drops server-only operations and the session cookie", () => {

        const { api: resolved, contract } = resolveApi(
            catalogue,
            { ...api, context: { ...api.context, sessionCookie: "s" } },
            {},
            seeds,
        );
        const browser = browserConfig(resolved, contract);

        expect(browser.api.context.sessionCookie).toBeNull();
        expect(browser.contract.features.products?.save?.enabled).toBe(true);

    });

});
describe("wire precedence and the backend's dialect", () => {

    const core = {
        request: { headers: { tenant: "X-Tenant-Domain", language: "Locale" } },
        response: { success: { path: "status", equals: true } },
    };

    test("the part's core layer sits above the engine defaults and below the spec", () => {

        const { contract } = resolveApi(
            catalogue,
            api,
            { request: { headers: { language: "Accept-Language" } } },
            seeds,
            core,
        );
        const list = contract.features.products?.list;

        expect(list?.enabled && list.request.headers.tenant?.name).toBe("X-Tenant-Domain");
        expect(list?.enabled && list.request.headers.language?.name).toBe("Accept-Language");
        expect(list?.enabled && list.response.success).toEqual({ path: "status", equals: true });

    });
    test("the declared tenant beats the host and the caller beats both", () => {

        const settings = { currency: "USD", tenant: "www.shop.test" };

        expect(requestContext(settings, { language: "en", host: "localhost:3001" }).tenant).toBe("www.shop.test");
        expect(requestContext(settings, { language: "en", host: "localhost:3001", tenant: "a.shop.test" }).tenant).toBe(
            "a.shop.test",
        );
        expect(
            requestContext({ currency: "USD", tenant: null }, { language: "en", host: "shop.test:443" }).tenant,
        ).toBe("shop.test");

    });

});
describe("the client over a fake backend", () => {

    const envelope = ( data: unknown, extra: Record<string, unknown> = {} ) =>
        JSON.stringify({
            status: true,
            code: "ok",
            message: "done",
            data,
            errors: null,
            meta: { request_id: "r1", ...extra },
        });
    const refusal = ( status: number, body: Record<string, unknown> ) =>
        new Response(JSON.stringify({ status: false, ...body, meta: { request_id: "r2" } }), {
            status,
            headers: { "content-type": "application/json" },
        });
    const setup = ( transport: ( url: string, init: RequestInit ) => Promise<Response>, share = true ) => {

        const { api: resolved, contract } = resolveApi(
            catalogue,
            { ...api, context: { ...api.context, tenant: "www.shop.test" } },
            {},
            seeds,
            {
                response: { success: { path: "status", equals: true } },
            },
        );

        return createApi(
            catalogue,
            resolved,
            contract,
            () => requestContext(resolved.context, { language: "en", auth: "t" }),
            {
                execution: "client",
                transport,
                share,
            },
        );

    };

    test("a list decodes rows, pagination and the request id; the tenant header rides along", async () => {

        const seen: Headers[] = [];
        const client = setup(async ( _url, init ) => {

            seen.push(new Headers(init.headers));

            return new Response(envelope([{ id: 1, title: "A" }], { page: 1, limit: 20, total: 1, pages: 1 }));

        });
        const result = await client.products.list({ limit: 20 });

        expect(result.resource).toEqual([{ id: 1, title: "A" }]);
        expect(result.meta.pagination?.total).toBe(1);
        expect(result.meta.requestId).toBe("r1");
        expect(seen[0]?.get("X-Tenant")).toBe("www.shop.test");
        expect(seen[0]?.get("Authorization")).toBe("Bearer t");

    });
    test("refusals become failures of the right kind with semantic field errors", async () => {

        const client = setup(async () =>
            refusal(422, {
                code: "validation",
                reason: "invalid_input",
                message: "invalid input",
                errors: { title: ["required"] },
            }),
        );

        await expect(client.products.save({ title: "" })).rejects.toMatchObject({
            kind: "input",
            reason: "invalid_input",
            errors: { title: ["required"] },
        });

        const denied = setup(async () =>
            refusal(401, { code: "unauthorized", reason: "unauthenticated", message: "sign in" }),
        );

        await expect(denied.products.list()).rejects.toMatchObject({ kind: "denied", status: 401 });

    });
    test("an input the catalogue refuses fails before the wire with field errors", async () => {

        let sent = 0;
        const client = setup(async () => {

            sent += 1;

            return new Response(envelope({ id: 1, title: "A" }));

        });

        await expect(client.products.save({ title: 5 as unknown as string })).rejects.toMatchObject({
            kind: "input",
            reason: "invalid_input",
            errors: { title: [expect.any(String)] },
            issues: { title: [{ rule: "type", params: { expected: "string" } }] },
        });
        expect(sent).toBe(0);

    });
    test("a success flag that says false is a refusal even on 200", async () => {

        const client = setup(
            async () =>
                new Response(
                    JSON.stringify({ status: false, code: "x", reason: "nope", message: "no", data: null, meta: {} }),
                    { status: 200 },
                ),
        );

        await expect(client.products.list()).rejects.toMatchObject({ kind: "http", reason: "nope" });

    });
    test("concurrent identical reads share one request; mutations never do", async () => {

        let calls = 0;
        const client = setup(async ( _url, init ) => {

            calls += 1;

            return new Response(init.method === "GET" ? envelope([]) : envelope({ id: 9, title: "x" }));

        });

        await Promise.all([client.products.list(), client.products.list()]);
        expect(calls).toBe(1);
        await Promise.all([client.products.save({ title: "a" }), client.products.save({ title: "b" })]);
        expect(calls).toBe(3);

    });
    test("a mutation carrying an idempotency key is retried on a transient status", async () => {

        let calls = 0;
        const client = setup(async () => {

            calls += 1;

            return calls === 1 ? new Response("", { status: 503 }) : new Response(envelope({ id: 1, title: "A" }));

        });
        const result = await client.products.save({ title: "A" });

        expect(result.resource).toEqual({ id: 1, title: "A" });
        expect(calls).toBe(2);

    });

});
describe("permissions", () => {

    test("an operation names what it needs, the group adds its own, and a holder is checked against both", () => {

        const group = feature(
            { permissions: ["user"] },
            {
                remove: need(["delete_items"], del("/items/{id}", { id: z.number() }, z.unknown())),
                list: get("/items", {}, many(z.object({ id: z.number() }))),
            },
        );

        expect(group.remove.permissions).toEqual(["user", "delete_items"]);
        expect(group.list.permissions).toEqual(["user"]);
        expect(allowed({ permissions: ["delete_items"] }, group.remove.permissions)).toBe(true);
        expect(allowed({ permissions: [] }, group.remove.permissions)).toBe(false);
        expect(allowed(null, ["user"])).toBe(false);
        expect(missing({ permissions: [] }, group.remove.permissions)).toEqual(["delete_items"]);

    });

});
describe("failure hook", () => {

    test("every failure the client raises also reaches the hook, so a surface can end a session on 401", async () => {

        const seen: number[] = [];
        const { api: resolved, contract } = resolveApi(
            catalogue,
            { ...api, context: { ...api.context, tenant: "t" } },
            {},
            seeds,
            {},
        );
        const client = createApi(
            catalogue,
            resolved,
            contract,
            () => requestContext(resolved.context, { language: "en", auth: "t" }),
            {
                execution: "client",
                transport: async () =>
                    new Response(JSON.stringify({ status: false, code: "unauthenticated", message: "sign in" }), {
                        status: 401,
                        headers: { "content-type": "application/json" },
                    }),
                onFailure: ( failure ) => seen.push(failure.status),
            },
        );

        await expect(client.products.list()).rejects.toMatchObject({ kind: "denied", status: 401 });
        expect(seen).toEqual([401]);

    });

});
describe("connection origins", () => {

    test("every connection with an address names its origin once, and a part without a backend has none", () => {

        const api = {
            connections: {
                primary: { baseUrl: "https://api.example.test/v1" },
                files: { baseUrl: "https://api.example.test/files" },
                idle: { baseUrl: null },
            },
        };

        expect(connectionOrigins(api)).toEqual(["https://api.example.test"]);
        expect(connectionOrigins(null)).toEqual([]);

    });

});
