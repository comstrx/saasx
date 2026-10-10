import assert from "node:assert/strict";
import { before, test } from "node:test";
import { runtime } from "../core/site.ts";

type Proxy = typeof import("../../src/proxy.ts");
type Server = typeof import("next/server");
type Cookies = typeof import("../../src/lib/spec/config.ts")["preferences"]["cookies"];

let proxy: Proxy;
let server: Server;
let cookies: Cookies;

function visit ( path: string, headers: Record<string, string> = {}, method = "GET" ) {

    const request = new server.NextRequest(`https://shop.example.test${path}`, { method, headers: { "x-request-id": "trace-p", ...headers } });
    const response = proxy.proxy(request);
    const forwarded = Object.fromEntries([...response.headers].flatMap(( [name, value] ) => {

        return name.startsWith("x-middleware-request-") ? [[name.slice("x-middleware-request-".length), value]] : [];

    }));

    const jar = response.cookies.getAll();

    return { status: response.status, headers: response.headers, forwarded, jar, cookies: jar.map(( item ) => `${item.name}=${item.value}`) };

}
before(async () => {

    await runtime();

    const config = await import("../../src/lib/spec/config.ts");

    proxy = await import("../../src/proxy.ts");
    server = await import("next/server");
    cookies = config.preferences.cookies;

});
test("a bare path renders under the default locale with a nonce, a strict CSP and its request id", () => {

    const seen = visit("/");
    const nonce = seen.forwarded["x-nonce"] ?? "";
    const csp = seen.headers.get("content-security-policy") ?? "";

    assert.equal(seen.status, 200);
    assert.equal(seen.headers.get("x-middleware-rewrite"), "https://shop.example.test/en");
    assert.equal(seen.forwarded["x-locale"], "en");
    assert.equal(seen.forwarded["x-request-id"], "trace-p");
    assert.equal(seen.headers.get("x-request-id"), "trace-p");
    assert.ok(nonce.length >= 22);
    assert.equal(seen.forwarded["content-security-policy"], csp);
    assert.ok(csp.includes(`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; `));
    assert.match(csp, /style-src-elem 'self' 'nonce-/);
    assert.match(csp, /connect-src 'self' https:\/\/api\.example\.test wss:\/\/api\.example\.test:\*; /);
    assert.match(csp, /frame-ancestors 'none'$/);
    assert.doesNotMatch(csp, /unsafe-eval|ws:/);

});
test("an unusable request id is replaced by a minted one", () => {

    const seen = visit("/en/about", { "x-request-id": "bad id!" });

    assert.match(seen.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/);
    assert.equal(seen.forwarded["x-request-id"], seen.headers.get("x-request-id"));

});
test("a first visit follows the browser language and remembers what it detected", () => {

    const seen = visit("/about?x=1", { "accept-language": "ar-SA,ar;q=0.9,en;q=0.8" });

    assert.equal(seen.status, 307);
    assert.equal(seen.headers.get("location"), "https://shop.example.test/ar/about?x=1");
    assert.deepEqual(seen.cookies.sort(), [`${cookies.country}=SA`, `${cookies.currency}=SAR`, `${cookies.language}=ar`]);

    for ( const cookie of seen.jar ) {

        assert.deepEqual([cookie.httpOnly, cookie.sameSite, cookie.secure, cookie.path], [true, "lax", true, "/"]);
        assert.ok((cookie.maxAge ?? 0) >= 60 * 60 * 24 * 365);

    }

});
test("an explicit locale, a saved language and a mutation never redirect", () => {

    const prefixed = visit("/ar/about", { cookie: `${cookies.language}=en` });
    const saved = visit("/about", { cookie: `${cookies.language}=ar; ${cookies.currency}=SAR` });
    const posted = visit("/about", { cookie: `${cookies.language}=ar` }, "POST");

    assert.equal(prefixed.headers.get("x-middleware-rewrite"), "https://shop.example.test/ar/about");
    assert.equal(prefixed.forwarded["x-locale"], "ar");
    assert.equal(saved.status, 307);
    assert.equal(saved.headers.get("location"), "https://shop.example.test/ar/about");
    assert.equal(posted.status, 200);
    assert.equal(posted.headers.get("x-middleware-rewrite"), "https://shop.example.test/en/about");

});
test("the edge country sets the currency once and foreign values are dropped", () => {

    const edge = visit("/", { "cf-ipcountry": "eg", "accept-language": "fr-FR" });
    const foreign = visit("/", { cookie: `${cookies.currency}=JPY; ${cookies.country}=ZZ; ${cookies.location}=denied` });

    assert.equal(edge.status, 200);
    assert.deepEqual(edge.cookies.sort(), [`${cookies.country}=EG`, `${cookies.currency}=EGP`]);
    assert.deepEqual(foreign.cookies, []);

});
test("the matcher skips every asset and machine route and matches every page", () => {

    const [pattern = ""] = proxy.config.matcher;
    const matcher = new RegExp(`^${pattern}$`);
    const skipped = ["/api/signals", "/_next/static/a.js", "/assets/x.png", "/_generated/x.css", "/.well-known/x", "/robots.txt", "/sitemap/pages.xml", "/favicon.ico"];

    assert.deepEqual(skipped.filter(( path ) => matcher.test(path)), []);
    assert.deepEqual(["/", "/about", "/ar/about/team", "/apix"].filter(( path ) => !matcher.test(path)), []);

});
