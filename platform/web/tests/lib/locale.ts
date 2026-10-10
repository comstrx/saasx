import assert from "node:assert/strict";
import { test } from "node:test";
import { localePath, negotiate, preferredPath, regionOf, splitLocale } from "../../src/lib/std/locale.ts";

const routing = { locales: ["en", "ar"], defaultLocale: "en" };

test("a locale prefix is explicit and every other path belongs to the default locale", () => {

    assert.deepEqual(splitLocale("/", routing), { locale: "en", path: "/", explicit: false });
    assert.deepEqual(splitLocale("/about/team", routing), { locale: "en", path: "/about/team", explicit: false });
    assert.deepEqual(splitLocale("/ar", routing), { locale: "ar", path: "/", explicit: true });
    assert.deepEqual(splitLocale("/ar/", routing), { locale: "ar", path: "/", explicit: true });
    assert.deepEqual(splitLocale("/ar/about", routing), { locale: "ar", path: "/about", explicit: true });
    assert.deepEqual(splitLocale("/en/about", routing), { locale: "en", path: "/about", explicit: true });
    assert.deepEqual(splitLocale("/fr/about", routing), { locale: "en", path: "/fr/about", explicit: false });
    assert.deepEqual(splitLocale("/arabic", routing), { locale: "en", path: "/arabic", explicit: false });

});
test("a saved locale steers bare paths only, and only toward another routed locale", () => {

    const bare = splitLocale("/about", routing);

    assert.equal(preferredPath(bare, "ar", routing), "/ar/about");
    assert.equal(preferredPath(splitLocale("/", routing), "ar", routing), "/ar");
    assert.equal(preferredPath(bare, "en", routing), undefined);
    assert.equal(preferredPath(bare, undefined, routing), undefined);
    assert.equal(preferredPath(bare, "fr", routing), undefined);
    assert.equal(preferredPath(bare, "../ar", routing), undefined);
    assert.equal(preferredPath(splitLocale("/en/about", routing), "ar", routing), undefined);
    assert.equal(preferredPath(splitLocale("/ar/about", routing), "en", routing), undefined);

});
test("links drop the default prefix and split back into their locale and path", () => {

    assert.equal(localePath("en", "/about", routing), "/about");
    assert.equal(localePath("ar", "/", routing), "/ar");
    assert.equal(localePath("ar", "/about", routing), "/ar/about");

    for ( const locale of routing.locales ) {

        const explicit = locale !== routing.defaultLocale;

        for ( const path of ["/", "/about", "/a/b"] ) {

            assert.deepEqual(splitLocale(localePath(locale, path, routing), routing), { locale, path, explicit });

        }

    }

});
test("the accept-language header yields the best routed locale and the first stated country", () => {

    const header = "fr-CA;q=0.9, ar-SA, en;q=0.8, *;q=0.1";

    assert.equal(negotiate(header, routing.locales), "ar");
    assert.equal(negotiate("fr, de;q=0.5", routing.locales), undefined);
    assert.equal(negotiate("EN-us", routing.locales), "en");
    assert.equal(negotiate("ar;q=0, en;q=0.2", routing.locales), "en");
    assert.equal(negotiate("ar;q=abc, en", routing.locales), "en");
    assert.equal(negotiate(null, routing.locales), undefined);
    assert.equal(regionOf(header), "SA");
    assert.equal(regionOf("zh-Hant-TW"), "TW");
    assert.equal(regionOf("es-419, en"), undefined);
    assert.equal(regionOf("<script>-sa"), undefined);

});
