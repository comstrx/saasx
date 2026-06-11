import { afterEach, describe, expect, it, vi } from "vitest";

const load = async () => {

    vi.resetModules();
    return (await import("./default-locale")).defaultLocale;

};

afterEach(() => {

    vi.unstubAllEnvs();

});

describe("defaultLocale", () => {

    it("respects a valid configured locale", async () => {

        vi.stubEnv("DEFAULT_LOCALE", "ar");
        expect(await load()).toBe("ar");

    });

    it("falls back to en when missing", async () => {

        vi.stubEnv("DEFAULT_LOCALE", undefined);
        expect(await load()).toBe("en");

    });

    it("falls back to en on empty string", async () => {

        vi.stubEnv("DEFAULT_LOCALE", "");
        expect(await load()).toBe("en");

    });

    it("falls back to en on an unsupported value", async () => {

        vi.stubEnv("DEFAULT_LOCALE", "er");
        expect(await load()).toBe("en");

    });

});
