import { describe, expect, test } from "bun:test";
import { Failure } from "engine/error";
import { dictionary, directionOf, failureMessages, formatDate, formatMoney, formatNumber, formatPercent, formatRange, isolate, isTimeZone, languageFacts, languageName, localePath, mergeMessages, messageTree, missingKeys, negotiate, plural, preferredPath, prefixed, regionOf, splitLocale, translator } from "engine/translate";

const routing = { locales: ["en", "ar"], defaultLocale: "en" };

describe("locale", () => {

    test("paths split, negotiation honors weights and direction follows the script", () => {

        expect(splitLocale("/ar/items", routing)).toEqual({ locale: "ar", path: "/items", explicit: true });
        expect(negotiate("fr;q=0.9, ar;q=0.8, en;q=0.7", routing.locales)).toBe("ar");
        expect(directionOf("ar-EG")).toBe("rtl");
        expect(directionOf("en")).toBe("ltr");

    });

});
describe("messages", () => {

    test("a translator interpolates and reports missing keys", () => {

        const missing: string[] = [];
        const t = translator({ hello: "Hi {name}" }, ( key ) => missing.push(key));

        expect(t("hello", { name: "A" })).toBe("Hi A");
        expect(t("nope")).toBe("nope");
        expect(missing).toEqual(["nope"]);
        expect(missingKeys({ a: "1", b: { c: "2" } }, { a: "1" })).toEqual(["b.c"]);
        expect(() => mergeMessages({ a: "1" }, { a: { b: "2" } })).toThrow();

    });

});
describe("format", () => {

    test("numbers pin latin numerals, money isolates its symbol and plurals pick a category", () => {

        expect(formatNumber("ar", 1234)).toBe("1,234");
        expect(formatMoney("en", 12.5, "USD").text).toContain("⁨$⁩");
        expect(formatMoney("en", 12.5, "USD").amount).toBe("12.50");
        expect(plural("en", 2, { one: "{n} item", other: "{n} items" })).toBe("2 items");
        expect(formatDate("en", new Date(2026, 10, 12), "day")).toMatch(/Nov 12|12 Nov/);

    });

});
describe("language facts", () => {

    test("a code alone yields label, direction and an Open Graph locale", () => {

        expect(languageFacts("ar")).toEqual({ label: "العربية", direction: "rtl", openGraph: "ar_EG" });
        expect(languageFacts("en-GB")).toMatchObject({ direction: "ltr", openGraph: "en_GB" });

    });

});
describe("language facts without Intl.Locale", () => {

    test("a runtime without Intl.Locale still yields a usable Open Graph locale", () => {

        const intl = globalThis.Intl as { Locale?: unknown };
        const saved = intl.Locale;

        intl.Locale = undefined;

        try {

            expect(languageFacts("ar").openGraph).toBe("ar_AR");
            expect(languageFacts("en-GB").openGraph).toBe("en_GB");

        } finally {

            intl.Locale = saved;

        }

    });

});
describe("language names without Intl.DisplayNames", () => {

    test("an autonym answers when the host cannot name the language", () => {

        const host = globalThis.Intl as unknown as Record<string, unknown>;
        const names = host.DisplayNames;

        host.DisplayNames = undefined;

        try {

            expect(languageName("ar", "ar")).toBe("العربية");
            expect(languageName("en", "ar")).toBe("English");
            expect(languageName("xx", "en")).toBe("xx");

        } finally {

            host.DisplayNames = names;

        }

    });

});
describe("failure messages", () => {

    const dictionary = {
        reasons: { invalid_input: "Check the form", key_reused: "Already sent" },
        rules: { min: "At least {minimum} characters", type: "Not a {expected}" },
        fields: { stock: "Stock must be a whole number" },
    };

    test("rules win, then the field's own message, then the backend text, then the fallback", () => {

        const refusal = new Failure("input", {
            reason: "invalid_input",
            message: "invalid input",
            errors: {
                title: ["The title is too short."],
                stock: ["The stock field must be an integer."],
                other: ["Nope"],
            },
            issues: { title: [{ rule: "min", params: { minimum: 2 } }] },
        });

        expect(failureMessages(refusal, dictionary, "Failed")).toEqual({
            title: "At least 2 characters",
            stock: "Stock must be a whole number",
            other: "Nope",
        });

    });
    test("a failure without field errors speaks through its reason, else its code, else its text", () => {

        expect(failureMessages(new Failure("conflict", { reason: "key_reused" }), dictionary, "Failed")).toEqual({
            _form: "Already sent",
        });
        expect(
            failureMessages(new Failure("http", { reason: "weird", message: "Backend said so" }), dictionary, "Failed"),
        ).toEqual({ _form: "Backend said so" });
        expect(failureMessages(new Error("boom"), dictionary, "Failed")).toEqual({ _form: "Failed" });

    });
    test("a failure the engine raised itself never shows its own text; the fallback speaks", () => {

        expect(failureMessages(new Failure("network", { status: 502 }), dictionary, "Failed")).toEqual({ _form: "Failed" });
        expect(failureMessages(new Failure("timeout"), dictionary, "Failed")).toEqual({ _form: "Failed" });

    });

});
describe("dictionaries", () => {

    test("a dictionary refuses dotted or unsafe keys, blank text and empty groups", () => {

        expect(() => dictionary({ "a.b": "x" })).toThrow('invalid key "a.b"');
        expect(() => dictionary(JSON.parse('{"__proto__":{"x":"y"}}'))).toThrow("invalid key");
        expect(() => dictionary({ a: "  " })).toThrow("non-empty");
        expect(() => dictionary({ a: {} })).toThrow("empty message group");
        expect(() => dictionary("no")).toThrow("expected a message object");
        expect(dictionary({ a: { b: "c" } })).toEqual({ a: { b: "c" } });

    });
    test("merging keeps the base shape: a leaf cannot become a tree and new keys are welcome", () => {

        const base = { nav: { home: "Home", back: "Back" }, title: "T" };

        expect(mergeMessages(base, { nav: { home: "Start" }, extra: "E" })).toEqual({ nav: { home: "Start", back: "Back" }, title: "T", extra: "E" });
        expect(() => mergeMessages(base, { nav: "flat" })).toThrow("change the message shape");
        expect(missingKeys(base, { nav: { home: "x" } })).toEqual(["nav.back", "title"]);
        expect(messageTree(base, "nav")).toEqual({ home: "Home", back: "Back" });
        expect(messageTree(base, "title")).toBeUndefined();

    });

});
describe("locales and paths", () => {

    const routing = { locales: ["en", "ar"], defaultLocale: "en" };

    test("a path splits into locale and rest, and prefixes only when the locale is not the default", () => {

        expect(splitLocale("/ar/account", routing)).toEqual({ locale: "ar", path: "/account", explicit: true });
        expect(splitLocale("/account", routing)).toEqual({ locale: "en", path: "/account", explicit: false });
        expect(splitLocale("", routing)).toEqual({ locale: "en", path: "/", explicit: false });
        expect(localePath("ar", "/", routing)).toBe("/ar");
        expect(localePath("en", "/x", routing)).toBe("/x");
        expect(prefixed("ar", "/x")).toBe("/ar/x");

    });
    test("a preferred locale redirects an implicit path only, and only to a supported non-default locale", () => {

        expect(preferredPath({ locale: "en", path: "/x", explicit: false }, "ar", routing)).toBe("/ar/x");
        expect(preferredPath({ locale: "ar", path: "/x", explicit: true }, "ar", routing)).toBeUndefined();
        expect(preferredPath({ locale: "en", path: "/x", explicit: false }, "fr", routing)).toBeUndefined();
        expect(preferredPath({ locale: "en", path: "/x", explicit: false }, "en", routing)).toBeUndefined();

    });
    test("regions come from the first tag that names one; time zones are checked by the host", () => {

        expect(regionOf("ar-EG,en;q=0.5")).toBe("EG");
        expect(regionOf("en;q=0.3, fr-ca;q=0.9")).toBe("CA");
        expect(regionOf("ar")).toBeUndefined();
        expect(regionOf("junk;;")).toBeUndefined();
        expect(isTimeZone("Africa/Cairo")).toBe(true);
        expect(isTimeZone("Mars/Olympus")).toBe(false);
        expect(negotiate("de, ar;q=0.8, en;q=0.9", ["en", "ar"])).toBe("en");
        expect(negotiate("fr", ["en", "ar"])).toBeUndefined();

    });
    test("dates follow the style and the zone; ranges and isolation are stable", () => {

        const at = new Date(Date.UTC(2026, 9, 13, 10, 30));

        expect(formatDate("en", at, "month", "UTC")).toBe("October 2026");
        expect(formatDate("en", at, "time", "UTC")).toBe("10:30 AM");
        expect(formatDate("en", "2020-01-05T00:00:00Z", "day", "UTC")).toBe("Jan 5, 2020");
        expect(formatRange("en", at, new Date(Date.UTC(2026, 9, 15)), "UTC")).toBe("Oct 13 – 15");
        expect(isolate("$")).toBe("⁨$⁩");
        expect(formatPercent("en", 0.256, 1)).toBe("25.6%");

    });

});
