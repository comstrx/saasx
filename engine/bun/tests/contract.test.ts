import { describe, expect, test } from "bun:test";
import {
    backendOptionFields,
    baseSettings,
    brandImage,
    configShapes,
    connectionShape,
    contentShape,
    fontFaceShape,
    fontsShape,
    settingsInput,
    sharedSettingsDefaults,
} from "engine/spec";
import { z } from "engine/validate";

const locale = z.enum(["en", "ar"]);
const image = brandImage("/assets/images/brand", ["png", "webp"]);
const settings = z.strictObject({
    app: z.strictObject({ slug: z.string() }),
    ...baseSettings(locale, fontsShape(locale, fontFaceShape(["ttf"], /^[1-9]00$/))),
});

describe("contract", () => {

    test("brand images and fonts follow the surface's roots and formats", () => {

        expect(image.safeParse("/assets/images/brand/logo.webp").success).toBe(true);
        expect(image.safeParse("/images/logo.webp").success).toBe(false);
        expect(fontFaceShape(["ttf"], /^[1-9]00$/).safeParse({ file: "a.woff2", weight: "400" }).success).toBe(false);

    });
    test("settings input loosens records one level and keeps required names", () => {

        const loose = settingsInput(settings, ["app"]);

        expect(loose.safeParse({ app: { slug: "x" }, locale: { default: "ar" } }).success).toBe(true);
        expect(loose.safeParse({ locale: { default: "ar" } }).success).toBe(false);
        expect(settingsInput(z.strictObject({ ...baseSettings(locale, z.object({})) })).parse(undefined)).toEqual({});

    });
    test("config shapes assemble and the backend options drop derived addresses", () => {

        const { configInputShape } = configShapes(
            contentShape(image),
            settings,
            settingsInput(settings, ["app"]),
            z.strictObject({}),
        );
        const parsed = configInputShape.parse({ contents: { name: "Site" }, settings: { app: { slug: "x" } } });

        expect(parsed.contracts).toBeNull();
        expect(parsed.themes).toEqual({});

        const options = connectionShape.omit({ baseUrl: true, development: true }).extend(backendOptionFields);

        expect(Object.keys(options.shape)).toContain("prefix");
        expect(Object.keys(options.shape)).not.toContain("baseUrl");
        expect(sharedSettingsDefaults.theme.default).toBe("system");

    });

});
