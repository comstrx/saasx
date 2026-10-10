import assert from "node:assert/strict";
import { test } from "node:test";
import { entityId, entityParam, fillPattern, patternKeys } from "../../src/lib/std/route.ts";

test("an entity parameter carries the id and, when it is clean, the slug", () => {

    assert.equal(entityParam(12, "babylon-rotana"), "12-babylon-rotana");
    assert.equal(entityParam(12, null), "12");
    assert.equal(entityParam(12, "Bad Slug"), "12");
    assert.equal(entityParam(12, "../x"), "12");

});
test("the id reads back from any slug, stale or missing, and nothing else", () => {

    assert.equal(entityId("12-babylon-rotana"), 12);
    assert.equal(entityId("12-an-old-name"), 12);
    assert.equal(entityId("12"), 12);
    assert.equal(entityId("012"), undefined);
    assert.equal(entityId("12-"), undefined);
    assert.equal(entityId("12-Rotana"), undefined);
    assert.equal(entityId("abc"), undefined);
    assert.equal(entityId(undefined), undefined);

});
test("a page pattern names its parameters and fills them without escaping the path", () => {

    assert.deepEqual(patternKeys("/stays/:country/:stayId"), ["country", "stayId"]);
    assert.deepEqual(patternKeys("/about"), []);
    assert.equal(fillPattern("/stays/:stayId", { stayId: "12-babylon-rotana" }), "/stays/12-babylon-rotana");
    assert.equal(fillPattern("/", {}), "/");
    assert.throws(() => fillPattern("/stays/:stayId", {}), TypeError);
    assert.throws(() => fillPattern("/stays/:stayId", { stayId: "../admin" }), TypeError);
    assert.throws(() => fillPattern("/stays/:stayId", { stayId: "a?b" }), TypeError);

});
