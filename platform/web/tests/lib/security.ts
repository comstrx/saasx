import assert from "node:assert/strict";
import { test } from "node:test";
import { dictionary } from "../../src/lib/std/messages.ts";
import { pathGet, pathSet } from "../../src/lib/std/object.ts";
import { expandPath } from "../../src/lib/std/route.ts";
import { fingerprint, uuid } from "../../src/lib/std/security.ts";
import { forwardedFor, hostname, isOrigin, joinUrl, originOf, safeReturn } from "../../src/lib/std/url.ts";

test("object paths never reach the prototype chain", () => {

    assert.throws(() => pathSet({}, "__proto__.polluted", true), TypeError);
    assert.throws(() => pathSet({}, "a.constructor.prototype.polluted", true), TypeError);
    assert.throws(() => pathSet({ a: 1 }, "a.b", true), TypeError);
    assert.equal(pathGet({}, "toString"), undefined);
    assert.equal(pathGet({ a: { b: 1 } }, "a.b"), 1);
    assert.equal(({} as { polluted?: boolean }).polluted, undefined);

});
test("path templates refuse traversal and separators and encode everything else", () => {

    assert.throws(() => expandPath("/x/{id}", { id: ".." }), TypeError);
    assert.throws(() => expandPath("/x/{id}", { id: "a/b" }), TypeError);
    assert.throws(() => expandPath("/x/{id}", { id: "a%2fb" }), TypeError);
    assert.throws(() => expandPath("/x/{id}", {}), TypeError);
    assert.equal(expandPath("/x/{id}", { id: "hello world" }), "/x/hello%20world");

});
test("urls stay on their base and origins are strict", () => {

    assert.throws(() => joinUrl("https://api.test/v1", "/../admin"), TypeError);
    assert.equal(
        joinUrl("https://api.test/v1", "/catalogs", { ids: [1, 2], filters: { type: "hotel" } }).href,
        "https://api.test/v1/catalogs?ids%5B%5D=1&ids%5B%5D=2&filters%5Btype%5D=hotel",
    );
    assert.equal(isOrigin("https://a.test"), true);
    assert.equal(isOrigin("https://a.test/path"), false);
    assert.equal(isOrigin("https://user:pass@a.test"), false);
    assert.equal(isOrigin("javascript:alert(1)"), false);

});
test("return paths cannot leave the site or re-enter excluded areas", () => {

    assert.equal(safeReturn("//evil.test/x", "/"), "/");
    assert.equal(safeReturn("https://evil.test", "/"), "/");
    assert.equal(safeReturn("/account?tab=1", "/"), "/account?tab=1");
    assert.equal(safeReturn("/auth/login", "/", ["/auth"]), "/");
    assert.equal(safeReturn("/authors", "/", ["/auth"]), "/authors");

});
test("hosts normalise and wildcards never match the bare apex", () => {

    assert.equal(hostname("Shop.Example.test:443"), "shop.example.test");
    assert.equal(hostname("a..b"), undefined);
    assert.equal(hostname("evil.com/x"), undefined);
    assert.equal(originOf("Shop.Example.test:8443", true), "https://shop.example.test:8443");
    assert.equal(originOf("..evil.test", true), undefined);
    assert.equal(originOf(".evil.test", false), undefined);

});
test("message dictionaries reject unsafe keys, dotted keys, empty text and empty groups", () => {

    assert.throws(() => dictionary(JSON.parse('{"__proto__":"x"}')), /invalid key/);
    assert.throws(() => dictionary({ "a.b": "x" }), /invalid key/);
    assert.throws(() => dictionary({ a: "  " }), /non-empty text/);
    assert.throws(() => dictionary({ a: {} }), /empty message group/);
    assert.deepEqual(dictionary({ a: { b: "c" } }), { a: { b: "c" } });

});
test("a forwarded client chain keeps only real addresses, nearest last", () => {

    assert.equal(forwardedFor("203.0.113.7, 2001:db8::1, 10.0.0.1", 1), "10.0.0.1");
    assert.equal(forwardedFor("203.0.113.7, 2001:db8::1, 10.0.0.1", 2), "2001:db8::1");
    assert.equal(forwardedFor("203.0.113.7, 2001:db8::1, 10.0.0.1", 4), undefined);
    assert.equal(forwardedFor("::ffff:127.0.0.1", 1), "::ffff:127.0.0.1");
    assert.equal(forwardedFor("203.0.113.7, <script>", 1), undefined);
    assert.equal(forwardedFor("1.1.1.1, evil\r\nx: y", 2), "1.1.1.1");
    assert.equal(forwardedFor("1.1.1.1", 0), undefined);
    assert.equal(forwardedFor(null, 1), undefined);

});
test("fingerprints and ids never need a secure context", () => {

    assert.equal(fingerprint("a"), fingerprint("a"));
    assert.notEqual(fingerprint("a"), fingerprint("b"));
    assert.notEqual(fingerprint("ab"), fingerprint("ba"));
    assert.match(fingerprint("عربي"), /^[0-9a-f]{16}$/);
    assert.match(uuid(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.notEqual(uuid(), uuid());

});
