import { describe, expect, it } from "vitest";
import { isLocale } from "./is-locale";

describe("isLocale", () => {

    it("accepts every supported locale", () => {

        expect(isLocale("en")).toBe(true);
        expect(isLocale("ar")).toBe(true);

    });

    it("rejects unsupported values", () => {

        expect(isLocale("fr")).toBe(false);
        expect(isLocale("")).toBe(false);
        expect(isLocale(undefined)).toBe(false);

    });

});
