import { describe, expect, test } from "bun:test";
import {
    directionOf,
    formatDate,
    formatMoney,
    formatNumber,
    languageFacts,
    languageName,
    mergeMessages,
    missingKeys,
    negotiate,
    plural,
    splitLocale,
    translator,
} from "@engine/translate";

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
        const t = translator({ hello: "Hi {name}" }, (key) => missing.push(key));

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
