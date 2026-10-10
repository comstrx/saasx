import assert from "node:assert/strict";
import { test } from "node:test";
import { limitsOf, toFormData } from "../../src/lib/std/form.ts";
import { mergeMessages, messageKeys } from "../../src/lib/std/messages.ts";
import { isQuery, queryEntries, searchHref } from "../../src/lib/std/route.ts";
import { contentSecurityPolicy } from "../../src/lib/std/security.ts";

function entries ( form: FormData ): [string, string][] {

    return [...form.entries()].map(( [key, value] ) => [key, typeof value === "string" ? value : `file:${value.name}`]);

}
test("queries encode brackets, drop empties and stop at four levels", () => {

    assert.deepEqual(queryEntries({ ids: [1, 2], filters: { type: "hotel", tags: ["a"] }, skip: null }), [
        ["ids[]", "1"],
        ["ids[]", "2"],
        ["filters[type]", "hotel"],
        ["filters[tags][]", "a"],
    ]);
    assert.equal(searchHref("/search", { q: "x", page: 2 }, { page: "" }), "/search?q=x");
    assert.equal(isQuery({ a: { b: { c: { d: 1 } } } }), true);
    assert.equal(isQuery({ a: { b: { c: { d: { e: 1 } } } } }), false);

});
test("form data mirrors the server's bracket notation, booleans and files", () => {

    const file = new File(["abc"], "x.png", { type: "image/png" });
    const form = toFormData({ name: "Ali", flag: true, off: false, n: 3, skip: null, list: [1, "two", { deep: file }], nested: { a: { b: "c" } } });

    assert.deepEqual(entries(form), [
        ["name", "Ali"],
        ["flag", "1"],
        ["off", "0"],
        ["n", "3"],
        ["list[0]", "1"],
        ["list[1]", "two"],
        ["list[2][deep]", "file:x.png"],
        ["nested[a][b]", "c"],
    ]);
    assert.throws(() => toFormData({ x: Symbol("s") }), TypeError);
    assert.throws(() => toFormData({ x: { a: { b: { c: 1 } } } }, undefined, 2), RangeError);
    assert.throws(() => toFormData({ f: [file, file] }, { fileBytes: 100, totalBytes: 5, count: 8 }), RangeError);

});
test("the content security policy drops absent sources", () => {

    assert.equal(contentSecurityPolicy({ "default-src": ["'self'"], "script-src": ["'self'", false, undefined, ""] }), "default-src 'self'; script-src 'self'");

});
test("message overrides merge key by key and can never change a message's shape", () => {

    const base = { a: "x", group: { b: "y" } };

    assert.deepEqual(mergeMessages(base, { group: { b: "z", c: "n" }, d: "new" }), { a: "x", group: { b: "z", c: "n" }, d: "new" });
    assert.throws(() => mergeMessages(base, { a: { k: "v" } }), /cannot change the message shape/);
    assert.deepEqual(messageKeys({ group: { b: "y", a: "x" }, z: "1" }), ["group.a", "group.b", "z"]);

});
test("upload limits keep room for the form fields and never let one file outgrow the request", () => {

    const mebibyte = 1024 * 1024;
    const reserve = 256 * 1024;

    assert.deepEqual(limitsOf(25 * mebibyte, 32 * mebibyte, 20), { fileBytes: 25 * mebibyte, totalBytes: 32 * mebibyte - reserve, count: 20 });
    assert.deepEqual(limitsOf(8 * mebibyte, 2 * mebibyte, 1), { fileBytes: 2 * mebibyte - reserve, totalBytes: 2 * mebibyte - reserve, count: 1 });
    assert.equal(limitsOf(1, 0, 1).totalBytes, 0);
    assert.throws(() => toFormData({ f: new File(["abcd"], "x.png") }, limitsOf(3, 10 * mebibyte, 1)), RangeError);

});
