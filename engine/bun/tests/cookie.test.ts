import { describe, expect, test } from "bun:test";
import { acceptPreferences, documentJar, headerJar, parseCookies, preferenceJar, serializeCookie, storageJar } from "engine/cookie";
import { memoryStore } from "engine/storage";

describe("cookie", () => {

    test("parse and serialize round-trip with options", () => {

        expect(parseCookies("a=1; b=x%20y")).toEqual({ a: "1", b: "x y" });
        expect(serializeCookie("s", "v", { maxAge: 60, httpOnly: true, secure: true, sameSite: "lax" })).toBe(
            "s=v; Max-Age=60; Path=/; HttpOnly; Secure; SameSite=Lax",
        );

    });
    test("the three jars answer the same contract", async () => {

        const written: string[] = [];
        const header = headerJar("a=1", ( line ) => written.push(line));
        const page = { cookie: "" };
        const browser = documentJar(page);
        const native = storageJar(memoryStore());

        header.set("b", "2", { maxAge: 10 });
        browser.set("b", "2", { httpOnly: true });
        await native.set("b", "2", { maxAge: 10 });

        expect(header.get("b")).toBe("2");
        expect(written[0]).toContain("b=2");
        expect(browser.get("b")).toBe("2");
        expect(page.cookie).not.toContain("HttpOnly");
        expect(await native.get("b")).toBe("2");
        expect(await native.all()).toEqual({ b: "2" });

        await native.set("c", "3", { maxAge: -1 });
        expect(await native.get("c")).toBeUndefined();

    });

});
describe("preferences", () => {

    const jar = preferenceJar({ language: "site.locale", currency: "site.currency" }, { languages: ["en", "ar"] });
    const themed = preferenceJar(
        { language: "site.locale", currency: "site.currency", theme: "site.theme" },
        { languages: ["en", "ar"], themes: ["light", "dark", "system"] },
    );

    test("saved preferences come back only when valid, a first language is negotiated, changes list cookie writes", () => {

        expect(jar.read(( name ) => ({ "site.locale": "ar", "site.currency": "usd" })[name])).toEqual({ language: "ar" });
        expect(jar.read(( name ) => ({ "site.locale": "fr", "site.currency": "USD" })[name])).toEqual({
            currency: "USD",
        });
        expect(jar.detect("ar-EG,ar;q=0.9,en;q=0.5", {})).toEqual({ language: "ar" });
        expect(jar.detect("ar", { language: "en" })).toEqual({});
        expect(jar.changes({ language: "ar" })).toEqual([["site.locale", "ar"]]);

    });
    test("a theme preference is read, written and accepted only among the enabled themes", () => {

        expect(themed.read(( name ) => ({ "site.theme": "dark" })[name])).toEqual({ theme: "dark" });
        expect(themed.read(( name ) => ({ "site.theme": "neon" })[name])).toEqual({});
        expect(jar.read(( name ) => ({ "site.theme": "dark" })[name])).toEqual({});
        expect(themed.changes({ theme: "system", currency: "USD" })).toEqual([
            ["site.currency", "USD"],
            ["site.theme", "system"],
        ]);
        expect(jar.changes({ theme: "dark" })).toEqual([]);

    });
    test("accept keeps only the valid preferences of an untrusted input", () => {

        expect(themed.accept({ language: "ar", currency: "usd", theme: "dark", extra: 1 })).toEqual({
            language: "ar",
            theme: "dark",
        });
        expect(themed.accept({ language: "fr", currency: "EUR" })).toEqual({ currency: "EUR" });
        expect(themed.accept("nonsense")).toEqual({});
        expect(jar.accept({ theme: "dark" })).toEqual({});

    });
    test("an enabled currency list narrows the currencies a preference may name, with or without a jar", () => {

        const choices = { languages: ["en", "ar"], currencies: ["USD", "SAR"], themes: ["light"] };

        expect(acceptPreferences({ language: "ar", currency: "EUR", theme: "light" }, choices)).toEqual({ language: "ar", theme: "light" });
        expect(acceptPreferences({ currency: "SAR", theme: "dark" }, choices)).toEqual({ currency: "SAR" });
        expect(acceptPreferences(null, choices)).toEqual({});
        expect(preferenceJar({ language: "l", currency: "c" }, choices).read(( name ) => ({ c: "EUR" })[name])).toEqual({});

    });

});
