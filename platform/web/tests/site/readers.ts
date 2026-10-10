import assert from "node:assert/strict";
import { before, test } from "node:test";
import { ApiError } from "../../src/api/core/error.ts";
import { resourceDefaults } from "../../src/api/core/resource.ts";
import { answer, backend, concurrently, refusal, runtime, visit } from "../core/site.ts";

type Server = typeof import("../../src/api/workflow/server.ts");
type Sent = ReturnType<typeof visit>;

const stay = { "/v1/catalogs/7": answer({ id: 7, name: "Stay", type: "hotel" }) };

let server: Server;

function views ( sent: Sent ): Sent {

    return sent.filter(( item ) => item.url === "/v1/catalogs/7");

}

before(async () => {

    server = (await runtime()).server;

});
test("a shared read goes to the data cache without the visitor and is remembered for ten seconds", async () => {

    backend(stay);

    const sent = visit();

    assert.equal((await server.readEntity("product", 7)).id, 7);
    assert.equal((await server.readEntity("product", 7)).id, 7);

    const [seen, ...more] = views(sent);

    assert.deepEqual(more, []);
    assert.equal(seen?.cache, "force-cache");
    assert.deepEqual(seen?.next, { revalidate: 30 });
    assert.equal(seen?.headers["x-request-id"], undefined);
    assert.equal(seen?.headers["x-front-visitor"], undefined);
    assert.equal(seen?.headers["x-currency"], "USD");

    for ( const later of [0, 9000] ) {

        const soon = visit({ later });

        await server.readEntity("product", 7);

        assert.deepEqual(views(soon), []);

    }

    const again = visit({ later: 1001 });

    await server.readEntity("product", 7);

    assert.equal(views(again).length, 1);

});
test("a signed-in read carries the session and skips every cache", async () => {

    backend(stay);

    for ( const later of [60000, 0] ) {

        const sent = visit({ later, cookies: { session: "tok-1" }, headers: { "x-forwarded-for": "203.0.113.5" } });

        await server.readEntity("product", 7);

        const [seen, ...more] = views(sent);

        assert.deepEqual(more, []);
        assert.equal(seen?.cache, "no-store");
        assert.equal(seen?.headers.authorization, "Bearer tok-1");
        assert.equal(seen?.headers["x-front-visitor"], "203.0.113.5");

    }

});
test("any operation reads once per request by value, shared across guests and private to a session", async () => {

    const rows = [{ id: 1, name: "A", type: "hotel" }, { id: 2, name: "B", type: "hotel" }];

    backend({ "/v1/catalogs": answer(rows, { page: 1, limit: 2, total: 2, pages: 1 }), ...stay });

    const sent = visit();
    const lists = ( seen: Sent ) => seen.filter(( item ) => item.url.startsWith("/v1/catalogs?"));
    const [first, second, single] = await Promise.all([
        server.read("products", "list", { limit: 2, page: 1 }),
        server.read("products", "list", { page: 1, limit: 2 }),
        server.read("products", "view", { productId: 7 }),
    ]);

    assert.equal(first.resource.length, 2);
    assert.equal(first.meta.pagination?.total, 2);
    assert.equal(second.resource[1]?.name, "B");
    assert.equal(single.resource.id, 7);
    assert.equal(lists(sent).length, 1);
    assert.equal(views(sent).length, 1);

    const soon = visit({ later: 0 });

    await server.read("products", "list", { limit: 2, page: 1 });

    assert.deepEqual(lists(soon), []);

    const personal = visit({ later: 0, cookies: { session: "tok-9" } });

    await server.read("products", "list", { limit: 2, page: 1 });
    await server.read("products", "list", { limit: 2, page: 1 });

    assert.equal(lists(personal).length, 1);
    assert.equal(lists(personal)[0]?.headers.authorization, "Bearer tok-9");
    assert.equal(lists(personal)[0]?.cache, "no-store");

});
test("with the backend down, documents fall back to the spec and the fallback is remembered", async () => {

    backend({});

    const sent = visit();
    const content = await server.readContent();

    assert.deepEqual(content, resourceDefaults("content"));
    assert.deepEqual(await server.readPolicy(), resourceDefaults("policy"));
    assert.ok(sent.some(( item ) => item.url === "/v1/content/site-info"));

    await assert.rejects(server.readPageSeo("about"), ( error: unknown ) => error instanceof ApiError && error.kind === "network");

    const later = visit({ later: 0 });

    await server.readContent();

    assert.equal(later.length, 0);

});
test("a document the backend does not have is asked for once per lifetime, not per render", async () => {

    backend({ "/v1/content/seo/about": refusal(404) });

    const sent = visit();

    await assert.rejects(server.readPageSeo("about"), ( error: unknown ) => error instanceof ApiError && error.status === 404);
    await assert.rejects(server.readPageSeo("about"), ( error: unknown ) => error instanceof ApiError && error.status === 404);

    const soon = visit({ later: 0 });

    await assert.rejects(server.readPageSeo("about"));

    assert.equal(sent.filter(( item ) => item.url === "/v1/content/seo/about").length, 1);
    assert.deepEqual(soon, []);

});
test("one deployment serves every host as its own tenant, with its own cache", async () => {

    backend({ "/v1/catalogs/7": answer({ id: 7, name: "Stay", type: "hotel" }) });

    const first = visit({ headers: { host: "a.example.test" } });

    await server.readEntity("product", 7);

    const second = visit({ later: 0, headers: { host: "B.Example.test:443" } });

    await server.readEntity("product", 7);

    const again = visit({ later: 0, headers: { host: "a.example.test" } });

    await server.readEntity("product", 7);

    assert.equal(views(first)[0]?.headers["x-tenant-domain"], "a.example.test");
    assert.equal(views(second)[0]?.headers["x-tenant-domain"], "b.example.test");
    assert.deepEqual(views(again), []);

});
test("behind a proxy the forwarded host, address and scheme are the request's", async () => {

    const request = await import("../../src/lib/site/request.ts");

    visit({ headers: { host: "10.0.0.5:3000", "x-forwarded-host": "shop.example.test, inner", "x-forwarded-for": "198.51.100.7, 203.0.113.9", "x-forwarded-proto": "https, http" } });

    assert.equal(await request.requestHost(), "shop.example.test");
    assert.equal(await request.requestClient(), "203.0.113.9");
    assert.equal(await request.requestOrigin(), "https://shop.example.test");

});
test("two tenants in flight at once never share a context, a request or a cache entry", async () => {

    backend({ "/v1/catalogs/7": answer({ id: 7, name: "Stay", type: "hotel" }), "/v1/content/site-info": answer({ name: "Shared" }) });
    visit();

    const a = concurrently({ headers: { host: "a.example.test", "x-forwarded-for": "203.0.113.1" }, cookies: { session: "tok-a", "r.currency": "USD" } }, 20);
    const b = concurrently({ headers: { host: "b.example.test", "x-forwarded-for": "203.0.113.2" }, cookies: { "r.currency": "SAR" } }, 20);
    const reads = () => Promise.all([server.readEntity("product", 7), server.readContent(), server.siteCurrency()]);
    const [[, , currencyA], [, , currencyB]] = await Promise.all([a.run(reads), b.run(reads)]);
    const view = ( sent: Sent ) => views(sent)[0]?.headers;
    const documents = ( sent: Sent ) => sent.filter(( item ) => item.url === "/v1/content/site-info").map(( item ) => `${item.headers["x-tenant-domain"]} ${item.headers["x-currency"]}`).sort();

    assert.equal(currencyA, "USD");
    assert.equal(currencyB, "SAR");
    assert.equal(view(a.sent)?.["x-tenant-domain"], "a.example.test");
    assert.equal(view(a.sent)?.authorization, "Bearer tok-a");
    assert.equal(view(a.sent)?.["x-front-visitor"], "203.0.113.1");
    assert.equal(view(b.sent)?.["x-tenant-domain"], "b.example.test");
    assert.equal(view(b.sent)?.authorization, undefined);
    assert.deepEqual(documents(a.sent), ["a.example.test USD"]);
    assert.deepEqual(documents(b.sent), ["b.example.test SAR", "b.example.test USD"]);

});
test("a document the backend has not written yet is the spec's document, silently", async () => {

    backend({ "/v1/content/site-info": answer(null) });

    const sent = visit();
    const logged: string[] = [];
    const { error } = console;

    console.error = ( line: string ) => { logged.push(line); };

    const content = await server.readContent().finally(() => { console.error = error; });

    assert.deepEqual(content, resourceDefaults("content"));
    assert.ok(sent.some(( item ) => item.url === "/v1/content/site-info"));
    assert.deepEqual(logged, []);

});
