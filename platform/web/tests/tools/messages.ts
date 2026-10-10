import assert from "node:assert/strict";
import { test } from "node:test";
import { composeMessages } from "../../tools/messages/index.ts";
import { scratch } from "../core/scratch.ts";

function brand ( files: Record<string, string> ): string[] | Record<string, unknown> {

    const { root, dispose } = scratch(files);

    try {

        return composeMessages(root);

    }
    catch ( error ) {

        return [error instanceof Error ? error.message : String(error)];

    }
    finally {

        dispose();

    }

}
test("brand dictionaries extend the core only when every language carries the same keys", () => {

    const core = composeMessages();

    assert.deepEqual(Object.keys(core).sort(), ["ar", "en"]);
    assert.deepEqual(brand({ "en.json": '{"greeting":"Hi"}', "ar.json": '{"greeting":"أهلاً"}' }), { en: { ...core.en, greeting: "Hi" }, ar: { ...core.ar, greeting: "أهلاً" } });
    assert.match(String(brand({ "en.json": '{"greeting":"Hi"}' })), /ar\.json: composed message keys must match every language/);
    assert.match(String(brand({ "fr.json": "{}" })), /register this language before adding its dictionary/);
    assert.match(String(brand({ "en.json": '{"a.b":"x"}', "ar.json": "{}" })), /invalid key "a\.b"/);

});
