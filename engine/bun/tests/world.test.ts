import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
    countries,
    createIcons,
    cssVariables,
    currencies,
    defineEmoji,
    defineMotion,
    defineTokens,
    defineWorld,
    emojiCode,
    emojiFolder,
    emojis,
    flagCode,
    flagEmoji,
    flagFolder,
    flagOf,
    fontFace,
    fontFaces,
    fontFolder,
    fontOf,
    fontStack,
    fonts,
    iconAliases,
    iconCodes,
    iconGlyph,
    iconMirrored,
    iconMirrors,
    iconNames,
    keys,
    languages,
    motionVariables,
    nativeTokens,
    plainEmoji,
    transition,
} from "engine/world";

const asset = resolve(import.meta.dir, "../packages/world/asset");
const scales = {
    space: { 0: 0, 4: 16 },
    radius: { full: 9999 },
    type: { lg: { size: 20, line: 28, weight: 600 as const }, md: { size: 16, line: 24, weight: 400 as const } },
};

describe("countries", () => {

    test("every country carries ISO codes, three names, a region, and only currencies and languages the tables know", () => {

        expect(countries.all.length).toBe(250);

        for ( const country of countries.all ) {

            expect(country.code).toMatch(/^[A-Z]{2}$/);
            expect(country.alpha3).toMatch(/^[A-Z]{3}$/);
            expect(country.numeric).toMatch(/^\d{3}$/);
            expect(country.name.en && country.name.ar && country.name.native).toBeTruthy();
            expect(country.currencies.every(( code ) => currencies.has(code))).toBe(true);
            expect(country.languages.every(( code ) => languages.has(code))).toBe(true);

        }

        expect(new Set(countries.all.map(( country ) => country.alpha3)).size).toBe(250);
        expect(countries.get("eg")?.subregion?.name).toEqual({ en: "Northern Africa", ar: "شمال أفريقيا" });
        expect(countries.inRegion("002").length).toBeGreaterThan(50);
        expect(countries.spending("EUR").map(( country ) => country.code)).toContain("DE");
        expect(countries.speaking("AR").map(( country ) => country.code)).toContain("EG");

    });
    test("a country is found by any of its names in arabic, english or its own tongue, by any code, and by its key with or without a plus", () => {

        const first = ( query: string ) => countries.search(query)[0]?.code;

        expect(first("مصر")).toBe("EG");
        expect(first("مِصْر")).toBe("EG");
        expect(first("egypt")).toBe("EG");
        expect(first("EGY")).toBe("EG");
        expect(first("818")).toBe("EG");
        expect(first("+20")).toBe("EG");
        expect(first("0020")).toBe("EG");
        expect(first("امارات")).toBe("AE");
        expect(first("السعوديه")).toBe("SA");
        expect(first("Deutschland")).toBe("DE");
        expect(first("日本")).toBe("JP");
        expect(first("Côte")).toBe("CI");
        expect(first("فلسطين")).toBe("PS");
        expect(countries.search("zzzz")).toEqual([]);
        expect(countries.search(" ")).toEqual([]);

    });

});
describe("keys", () => {

    test("a key is found however it is typed, the territory that owns a shared key comes first, and an area code finds its island", () => {

        const first = ( query: string ) => keys.search(query)[0]?.code;

        expect(keys.of("eg")).toBe("+20");
        expect(first("+20")).toBe("EG");
        expect(first("20")).toBe("EG");
        expect(first("0020")).toBe("EG");
        expect(first("٢٠")).toBe("EG");
        expect(first("+1")).toBe("US");
        expect(first("+44")).toBe("GB");
        expect(first("1268")).toBe("AG");
        expect(first("+1 268")).toBe("AG");
        expect(first("مصر")).toBe("EG");
        expect(keys.search("+9").length).toBeGreaterThan(10);
        expect(keys.all.some(( key ) => key.code === "AQ")).toBe(false);
        expect(keys.search("")).toEqual([]);

    });

});
describe("languages and currencies", () => {

    test("a language knows its direction and script and answers to its code or any of its three names", () => {

        expect(languages.get("ar")).toEqual({
            code: "ar",
            direction: "rtl",
            script: "Arab",
            name: { en: "Arabic", ar: "العربية", native: "العربية" },
        });
        expect(languages.get("fa")?.direction).toBe("rtl");
        expect(languages.search("عربي")[0]?.code).toBe("ar");
        expect(languages.search("français")[0]?.code).toBe("fr");
        expect(languages.search("english")[0]?.code).toBe("en");

    });
    test("a currency answers to its code, number, any symbol, any name and the countries that spend it, with its minor digits", () => {

        const first = ( query: string ) => currencies.search(query)[0]?.code;

        expect(first("egp")).toBe("EGP");
        expect(first("818")).toBe("EGP");
        expect(first("ج.م")).toBe("EGP");
        expect(first("جنيه مصري")).toBe("EGP");
        expect(first("مصر")).toBe("EGP");
        expect(first("$")).toBe("USD");
        expect(first("ريال سعودي")).toBe("SAR");
        expect(currencies.get("KWD")?.digits).toBe(3);
        expect(currencies.get("JPY")?.digits).toBe(0);
        expect(currencies.of("ps").map(( currency ) => currency.code)).toEqual(["ILS", "JOD"]);

    });

});
describe("flags", () => {

    test("one drawing per country serves both the flag and the flag emoji, as svg for the web and webp for native", () => {

        expect(flagEmoji("eg")).toBe("🇪🇬");
        expect(flagEmoji("x")).toBe("");
        expect(flagCode("🇪🇬")).toBe("EG");
        expect(flagCode("😀")).toBeUndefined();
        expect(flagOf("EG")).toBe(`${flagFolder}/eg.svg`);
        expect(flagOf("EG", { format: "webp", folder: "flags" })).toBe("flags/eg.webp");

        for ( const country of countries.all ) {

            expect(existsSync(resolve(asset, "flag", `${country.code.toLowerCase()}.svg`))).toBe(true);
            expect(existsSync(resolve(asset, "flag", `${country.code.toLowerCase()}.webp`))).toBe(true);

        }

    });

});
describe("emojis", () => {

    test("every emoji has both names, a group, a key that round-trips its glyph, and a drawing on disk", () => {

        expect(emojis.all.length).toBeGreaterThan(1800);

        for ( const emoji of emojis.all ) {

            expect(emoji.name.en && emoji.name.ar).toBeTruthy();
            expect(emojis.groups.some(( group ) => group.key === emoji.group)).toBe(true);
            expect(emojiCode(emoji.glyph)).toBe(emoji.code);

            const code = flagCode(emoji.glyph);

            const file = code ? resolve(asset, "flag", `${code.toLowerCase()}.svg`) : resolve(asset, "emoji", `${emoji.code}.webp`);

            expect(existsSync(file)).toBe(true);

        }

        expect(new Set(emojis.all.map(( emoji ) => emoji.code)).size).toBe(emojis.all.length);
        expect(emojis.files.length).toBe(emojis.all.filter(( emoji ) => !flagCode(emoji.glyph)).length);

    });
    test("a glyph is found with or without its presentation selector, and its image is the emoji drawing or its country's flag", () => {

        expect(plainEmoji("❤️")).toBe("❤");
        expect(emojis.get("❤")?.glyph).toBe("❤️");
        expect(emojis.imageOf("👍")).toBe(`${emojiFolder}/1f44d.webp`);
        expect(emojis.imageOf("🇪🇬")).toBe(`${flagFolder}/eg.svg`);
        expect(defineEmoji({ folder: "e", flags: { folder: "f", format: "webp" } }).imageOf("🇪🇬")).toBe("f/eg.webp");
        expect(emojis.imageOf("🫩")).toBeUndefined();
        expect(emojis.imageOf("not an emoji")).toBeUndefined();

    });
    test("arabic and english names and keywords find an emoji, and browsing narrows to a group unless a query is typed", () => {

        expect(emojis.search("thumbs up")[0]?.glyph).toBe("👍");
        expect(emojis.search("ابهام")[0]?.glyph).toBe("👍");
        expect(emojis.search("قلب").some(( emoji ) => emoji.glyph === "❤️")).toBe(true);
        expect(emojis.browse({ group: "flags" }).every(( emoji ) => emoji.group === "flags")).toBe(true);
        expect(emojis.browse({ group: "flags", query: "مصر" })[0]?.glyph).toBe("🇪🇬");
        expect(emojis.of("smileys")[0]?.group).toBe("smileys");

    });

});
describe("fonts", () => {

    test("arabic script draws in Readex Pro and every other script in Figtree, each face a file on disk with its unicode range", () => {

        expect(fontOf("Arab").family).toBe("Readex Pro");
        expect(fontOf("Latn").family).toBe("Figtree");
        expect(fontOf("Cyrl").family).toBe("Figtree");

        for ( const font of fonts ) for ( const face of font.files ) expect(existsSync(resolve(asset, "font", face.file))).toBe(true);

        const css = fontFaces().join("\n");

        expect(css).toContain(
            `font-family: "Readex Pro"; src: url("${fontFolder}/readex-pro-arabic.woff2") format("woff2"); font-weight: 160 700`,
        );
        expect(css).toContain("unicode-range: U+0600-06FF");
        expect(css).toContain("size-adjust: 104%");

    });

});
describe("a surface's world", () => {

    test("a surface keeps only what its backend supports, in its own order, refuses strangers, and draws each language in its script's font", () => {

        const world = defineWorld({ countries: ["SA", "EG"], currencies: ["usd"], languages: ["ar", "en"] });

        expect(world.countries.all.map(( country ) => country.code)).toEqual(["SA", "EG"]);
        expect(world.keys.search("+2")[0]?.code).toBe("EG");
        expect(world.currencies.all.map(( currency ) => currency.code)).toEqual(["USD"]);
        expect(world.fontOf("ar").family).toBe("Readex Pro");
        expect(world.fontOf("en").family).toBe("Figtree");
        expect(() => defineWorld({ countries: ["XX"] })).toThrow("Unknown countries: XX");

    });
    test("a world builds its emoji catalog only when first asked, and only once", () => {

        const world = defineWorld();

        expect(typeof Object.getOwnPropertyDescriptor(world, "emojis")?.get).toBe("function");
        expect(world.emojis).toBe(world.emojis);
        expect(world.emojis.get("👍")?.code).toBe("1f44d");

    });

});
describe("tokens", () => {

    const tokens = defineTokens({ colors: { light: { ink: "#111" }, dark: { ink: "#eee" } }, ...scales });

    test("every scale comes from the surface, and each scheme keeps its own palette", () => {

        expect(tokens.space[4]).toBe(16);
        expect(tokens.colors.dark.ink).toBe("#eee");
        expect(tokens.radius.full).toBe(9999);

    });
    test("css variables project a scheme under a selector in rem", () => {

        const css = cssVariables(tokens, "dark", '[data-theme="dark"]');

        expect(css.startsWith('[data-theme="dark"] {\n')).toBe(true);
        expect(css).toContain("--ink: #eee;");
        expect(css).toContain("--gap-4: 1rem;");
        expect(css).toContain("--gap-0: 0;");
        expect(css).toContain("--radius-full: 999rem;");
        expect(css).toContain("--type-lg-weight: 600;");

    });
    test("native tokens keep plain numbers", () => {

        const native = nativeTokens(tokens, "light");

        expect(native.colors.ink).toBe("#111");
        expect(native.space[4]).toBe(16);
        expect(native.type.md).toEqual({ size: 16, line: 24, weight: 400 });

    });

});
describe("motion", () => {

    const presets = { durations: { fast: 120, base: 200 }, easings: { standard: "ease", enter: "ease-out" } };

    test("reduced motion collapses every duration and transitions follow", () => {

        const full = defineMotion(presets, false);
        const reduced = defineMotion(presets, true);

        expect(transition(full, ["opacity", "transform"], "fast", "enter")).toBe(
            "opacity 120ms ease-out, transform 120ms ease-out",
        );
        expect(transition(reduced, ["opacity"], "base", "standard")).toBe("opacity 0ms ease");
        expect(() => transition(full, ["opacity"], "slow", "standard")).toThrow("Unknown motion");

    });

});
describe("font faces and icons", () => {

    test("font faces and stacks render as css", () => {

        expect(fontFace({ family: "Site-ar", src: "/fonts/ar.woff2", weight: 400 })).toBe(
            '@font-face { font-family: "Site-ar"; src: url("/fonts/ar.woff2") format("woff2"); ' +
                "font-weight: 400; font-style: normal; font-display: swap; }",
        );
        expect(fontStack(["Site-ar", "Site-en"])).toBe('"Site-ar", "Site-en", sans-serif');

    });
    test("a font embedded as a data uri keeps its format hint", () => {

        expect(fontFace({ family: "icons", src: "data:font/woff2;base64,AAAA", weight: 400, display: "block" })).toBe(
            '@font-face { font-family: "icons"; src: url("data:font/woff2;base64,AAAA") format("woff2"); ' +
                "font-weight: 400; font-style: normal; font-display: block; }",
        );

    });
    test("every semantic icon names one drawing, and only directional ones mirror", () => {

        expect(new Set(Object.values(iconAliases)).size).toBe(iconNames.length);
        expect(iconNames.every(( name ) => typeof iconAliases[name] === "string")).toBe(true);
        expect(iconMirrors.every(( name ) => iconNames.includes(name))).toBe(true);
        expect(iconMirrors).not.toContain("house");

    });
    test("a glyph is the font code of its icon, an unknown name draws the circle, and only directional icons mirror", () => {

        expect(iconGlyph("house")).toBe(String.fromCodePoint(iconCodes.house));
        expect(iconGlyph("nothing")).toBe(String.fromCodePoint(iconCodes.circle));
        expect(iconMirrored("chevronStart")).toBe(true);
        expect(iconMirrored("house")).toBe(false);

    });
    test("unknown icons resolve to the fallback", () => {

        const icons = createIcons({ house: "H", tag: "T" }, "?");

        expect(icons.names).toEqual(["house", "tag"]);
        expect(icons.get("tag")).toBe("T");
        expect(icons.get("nothing")).toBe("?");
        expect(icons.has("constructor")).toBe(false);

    });

});
describe("motion variables", () => {

    test("motion presets become css variables, and a reduced motion zeroes every duration", () => {

        const presets = { durations: { fast: 120, slow: 320 }, easings: { standard: "ease" } };

        expect(motionVariables(defineMotion(presets, false), ":root")).toBe(
            ":root {\n    --motion-fast: 120ms;\n    --motion-slow: 320ms;\n    --ease-standard: ease;\n}",
        );
        expect(motionVariables(defineMotion(presets, true), ":root")).toContain("--motion-slow: 0ms;");

    });

});
