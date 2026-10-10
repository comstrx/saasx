import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { languages, supportedLocales } from "../../src/lib/spec/languages.ts";
import { dictionary, messageKeys } from "../../src/lib/std/messages.ts";
import { root } from "../../tools/core/index.ts";

const folder = resolve(root, "messages");

test("the core ships one valid dictionary per supported locale and nothing else", () => {

    assert.deepEqual(readdirSync(folder).sort(), supportedLocales.map(( locale ) => `${locale}.json`).sort());

    const keys = supportedLocales.map(( locale ) => messageKeys(dictionary(JSON.parse(readFileSync(resolve(folder, `${locale}.json`), "utf8")))));

    for ( const other of keys.slice(1) ) {

        assert.deepEqual(other, keys[0]);

    }

});
test("every supported locale is fully described", () => {

    for ( const locale of supportedLocales ) {

        const language = languages[locale];

        assert.ok(language.label.length > 0);
        assert.ok(["ltr", "rtl"].includes(language.direction));
        assert.match(language.openGraph, /^[a-z]{2}_[A-Z]{2}$/);
        assert.doesNotThrow(() => new Intl.Locale(locale));

    }

});
