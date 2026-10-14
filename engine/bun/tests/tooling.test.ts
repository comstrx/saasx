import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
    analyze,
    assetHash,
    buildCatalog,
    type Connection,
    catalogModule,
    composeMessages,
    createCore,
    createTools,
    flagCode,
    guard,
    iconFont,
    messageIssues,
    modeOf,
    parseAnnotations,
    parseEmojiTest,
    prepareSpec,
    publishAssets,
    publishedUrls,
    type Rules,
    selectConnection,
    specAliases,
    syncEngineAssets,
    tonedGlyphs,
    walk,
    within,
} from "@engine/tooling";
import { iconAliases, iconCodes } from "@engine/ui";
import { emojiKey } from "@engine/world";

const rules: Rules = {
    source: "/part/src",
    specs: "/part/specs",
    foundation: /^(react(?:\/|$)|@engine\/)/,
    native: /^react-native(?:\/|$)/,
    free: ["elements/", "hooks/"],
    html: true,
    markupFiles: /^(?:elements|components)\/[^/]+$|^features\/[^/]+\/(?:index|components\/[^/]+)$/,
    hookFiles: /^hooks\//,
    featureEntry: /^features\/([^/]+)\/index\.tsx$/,
    featureManifest: /^features\/([^/]+)\/feature\.ts$/,
    featureComponent: /^features\/([^/]+)\/components\//,
    extensions: ["", ".ts", ".tsx"],
    helpers: ["screen", "block", "feature", "t"],
    structure: ["api", "elements", "components", "features", "hooks", "lib"],
    flat: ["elements", "hooks"],
    markup: ["elements"],
    featureParts: ["feature.ts", "index.tsx", "components"],
    apiParts: ["features", "workflow"],
    owners: {},
    declarations: [],
    layer: () => 0,
};

describe("architecture", () => {

    test("markup, styling and native primitives are refused outside elements", () => {

        const { issues } = analyze(
            "components/card.tsx",
            'import { View } from "react-native";\nexport default function Card () { return <View className="x"><section /></View>; }',
            rules,
        );

        expect(issues).toEqual([
            "Native primitives belong in elements: react-native",
            "HTML belongs in elements: section",
            "Styling belongs in elements: className",
        ]);

    });
    test("a feature entry stays thin and declares its owner", () => {

        const { issues } = analyze(
            "features/cards/index.tsx",
            'import Card from "@/elements/card";\nexport default function Cards () { return <Card />; }',
            rules,
            "server",
        );

        expect(issues).toEqual([
            "A feature entry is thin: it imports its own components only, not @/elements/card",
            "Feature entries declare client or server ownership.",
        ]);

    });
    test("specs are data", () => {

        const { issues } = analyze(
            "../specs/site/schema/home.ts",
            'import { screen } from "../../../src/lib/spec/surface.ts";\nexport default screen({ a: compute(1) });',
            rules,
        );

        expect(issues).toEqual(["Specs may call typed definition helpers only: compute"]);

    });

});
describe("files and compile", () => {

    test("the core writes under its root and walks in order", () => {

        const root = mkdtempSync(resolve(tmpdir(), "tooling-"));
        const core = createCore(root);

        core.writeJson("out/b.json", { b: 1 });
        core.writeFile("out/a.txt", "a");
        mkdirSync(resolve(root, "messages"));
        writeFileSync(resolve(root, "messages/en.json"), '{"nav":{"home":"Home"}}');
        writeFileSync(resolve(root, "messages/ar.json"), '{"nav":{"home":"الرئيسية"}}');

        expect(walk(resolve(root, "out")).map(( item ) => item.name)).toEqual(["a.txt", "b.json"]);
        expect(within(root, resolve(root, "out/a.txt"))).toBe(true);
        expect(within(root, resolve(root, "../x"))).toBe(false);
        expect(composeMessages({ core: resolve(root, "messages"), locales: ["en", "ar"] }).ar).toEqual({
            nav: { home: "الرئيسية" },
        });
        writeFileSync(resolve(root, "messages/ar.json"), '{"nav":{}}');
        expect(() => composeMessages({ core: resolve(root, "messages"), locales: ["en", "ar"] })).toThrow("ar");

    });
    test("connections, aliases and hashes follow the mode and the assets", () => {

        const connection: Connection = {
            baseUrl: "https://a",
            development: { baseUrl: "http://l", browserBaseUrl: null },
        };

        expect(selectConnection(connection, "development") as unknown).toEqual({
            baseUrl: "http://l",
            browserBaseUrl: null,
        });
        expect(selectConnection(connection, "production") as unknown).toEqual({ baseUrl: "https://a" });
        expect(modeOf("production")).toBe("production");
        expect(specAliases("/p", "node_modules/.cache/spec/x", ["config"], { "@spec/theme.css": "theme.css" })).toEqual(
            {
                "@spec/config": "./node_modules/.cache/spec/x/config.json",
                "@spec/theme.css": "./node_modules/.cache/spec/x/theme.css",
                "@spec/registry": "./node_modules/.cache/spec/x/registry.js",
            },
        );
        expect(assetHash(new Map([["a", new Uint8Array([1])]]))).toHaveLength(20);

    });
    test("everything a compile generates lands under public/_generated: engine assets copied, spec folders replaced whole", () => {

        const root = mkdtempSync(resolve(tmpdir(), "tooling-"));
        const generated = ( path: string ) => resolve(root, "public/_generated", path);

        syncEngineAssets(root, { flags: ["EG"], emoji: { static: ["1f44d.webp"], motion: [] } });
        publishAssets(root, ["images/brand", "fonts"], new Map([["images/brand/logo.svg", new Uint8Array([1])]]));
        publishAssets(root, ["images/brand", "fonts"], new Map([["fonts/site.woff2", new Uint8Array([2])]]));

        expect(existsSync(generated("images/flag/eg.svg"))).toBe(true);
        expect(existsSync(generated("images/emoji/static/1f44d.webp"))).toBe(true);
        expect(existsSync(generated("images/brand/logo.svg"))).toBe(false);
        expect([...readFileSync(generated("fonts/site.woff2"))]).toEqual([2]);
        expect(() => publishAssets(root, ["fonts"], new Map([["videos/intro.mp4", new Uint8Array([3])]]))).toThrow("videos/intro.mp4");

    });
    test("a compiled config names every published asset by its final url and leaves every other string alone", () => {

        const assets = new Map([["images/brand/logo.svg", new Uint8Array([1])], ["fonts/site.woff2", new Uint8Array([2])]]);
        const config = { content: { logo: "/images/brand/logo.svg", icon: "/images/brand/icon.png", name: "fonts/site.woff2" }, fonts: ["/fonts/site.woff2"], size: 3 };

        expect(publishedUrls(config, assets)).toEqual({
            content: { logo: "/_generated/images/brand/logo.svg", icon: "/images/brand/icon.png", name: "fonts/site.woff2" },
            fonts: ["/_generated/fonts/site.woff2"],
            size: 3,
        });

    });

});
describe("surface tools", () => {

    test("one folder table gives the spec paths, the brand folders and the asset reader; dot files and compile output never count", () => {

        const root = mkdtempSync(resolve(tmpdir(), "tools-"));
        const put = ( path: string, text: string ) => {

            mkdirSync(resolve(root, path, ".."), { recursive: true });
            writeFileSync(resolve(root, path), text);

        };

        put("public/images/brand/logo.svg", "a");
        put("public/images/brand/.keep", "");
        put("public/.well-known/security.txt", "b");
        put("public/_generated/images/brand/logo.svg", "old");
        put("specs/shop/brand/images/logo.svg", "c");
        put("specs/shop/brand/well-known/assetlinks.json", "d");

        const tools = createTools({
            root,
            variable: "SPEC",
            locales: ["en"],
            catalogue: { operations: [], features: [] } as never,
            validate: (( input: unknown ) => input) as never,
            assets: [{ path: "images/brand", brand: "images" }, { path: ".well-known", brand: "well-known" }],
            architecture: { foundation: /^@engine\//, html: true, owners: {}, layers: [] },
        });
        const composed = tools.assets.compose(resolve(root, "public"), resolve(root, "specs/shop/brand"));

        expect(tools.assets.paths).toEqual(["images/brand", ".well-known"]);
        expect(tools.assets.brandFolders).toEqual(["images", "well-known", "messages"]);
        expect([...composed.keys()]).toEqual([".well-known/assetlinks.json", ".well-known/security.txt", "images/brand/logo.svg"]);
        expect(new TextDecoder().decode(composed.get("images/brand/logo.svg"))).toBe("c");
        expect([...tools.assets.files(resolve(root, "public"), true).keys()].sort()).toEqual([".well-known/security.txt", "images/brand/logo.svg"]);
        expect(tools.rules.source).toBe(resolve(root, "src"));

    });

});
describe("build", () => {

    test("a spec is prepared for its mode with every published asset named by its final url", () => {

        const spec = {
            config: {
                api: { connections: { primary: { baseUrl: "https://api.shop", development: { baseUrl: "http://127.0.0.1:8000", browserBaseUrl: null } } } },
                content: { logo: "/images/brand/logo.svg" },
            },
            schema: { screens: [{ hero: "/videos/intro.mp4" }] },
        };
        const assets = new Map([["images/brand/logo.svg", new Uint8Array([1])], ["videos/intro.mp4", new Uint8Array([2])]]);
        const development = prepareSpec(spec, assets, "development");
        const production = prepareSpec({ ...spec, config: { ...spec.config, api: null } }, assets, "production");

        expect(development.config.api?.connections.primary as unknown).toEqual({ baseUrl: "http://127.0.0.1:8000", browserBaseUrl: null });
        expect(development.config.content.logo).toBe("/_generated/images/brand/logo.svg");
        expect(development.schema.screens[0]?.hero).toBe("/_generated/videos/intro.mp4");
        expect(production.config.api).toBeNull();

    });

});
describe("spec isolation", () => {

    test("a spec may import its own modules and the surface door only, never another spec or src", () => {

        const own = analyze(
            "../specs/site/schema/home.ts",
            'import x from "./parts/x.ts";\nimport { screen } from "../../../src/lib/spec/surface.ts";\nexport default screen(x);',
            rules,
        );
        const other = analyze(
            "../specs/site/schema/home.ts",
            'import y from "../../panel/schema/home.ts";\nexport default y;',
            rules,
        );
        const deep = analyze(
            "../specs/site/schema/home.ts",
            'import { config } from "../../../src/lib/spec/server.ts";\nexport default config;',
            rules,
        );

        expect(own.issues).toEqual([]);
        expect(other.issues).toEqual(["Specs may import their own modules and the define helpers only."]);
        expect(deep.issues).toEqual(["Specs may import their own modules and the define helpers only."]);

    });
    test("a spec folder escaping the specs root is refused by the loader guard", () => {

        expect(() => guard("/part/specs", "/part/src/secret.ts", "Spec path escapes specs")).toThrow("escapes");
        expect(guard("/tmp", "/tmp/a.ts", "x")).toBe("/tmp/a.ts");

    });

});
describe("message contracts", () => {

    test("every backend reason and every form rule needs a message in every language", () => {

        const dictionaries = {
            en: { errors: { reasons: { not_found: "Gone" }, rules: { min: "Too short" } } },
            ar: { errors: { reasons: { not_found: "اختفى" }, rules: { min: "قصير" } } },
        };

        expect(messageIssues(dictionaries, { reasons: ["not_found", "forbidden"], rules: ["min", "max"] })).toEqual([
            "en: missing errors.reasons.forbidden",
            "en: missing errors.rules.max",
            "ar: missing errors.reasons.forbidden",
            "ar: missing errors.rules.max",
        ]);
        expect(messageIssues(dictionaries, { reasons: ["not_found"], rules: ["min"] })).toEqual([]);

    });

});
describe("emoji sources", () => {

    const sample = [
        "# group: Smileys & Emotion",
        "1F600                                                  ; fully-qualified     # 😀 E1.0 grinning face",
        "1F600                                                  ; minimally-qualified # 😀 E1.0 grinning face",
        "# group: People & Body",
        "1F44D                                                  ; fully-qualified     # 👍 E0.6 thumbs up",
        "1F44D 1F3FB                                            ; fully-qualified     # 👍🏻 E1.0 thumbs up: light skin tone",
        "1F44D 1F3FF                                            ; fully-qualified     # 👍🏿 E1.0 thumbs up: dark skin tone",
        "# group: Smileys & Emotion",
        "2764 FE0F                                              ; fully-qualified     # ❤️ E0.6 red heart",
        "# group: Component",
        "1F3FB                                                  ; component           # 🏻 E1.0 light skin tone",
    ].join("\n");
    const english = parseAnnotations('<ldml><annotations><annotation cp="😀">face | grin</annotation><annotation cp="😀" type="tts">grinning face</annotation><annotation cp="👍">+1 | thumbs up | up</annotation><annotation cp="👍" type="tts">thumbs up</annotation><annotation cp="❤">heart &amp; love</annotation><annotation cp="❤" type="tts">red heart</annotation><annotation cp="🏻" type="tts">light skin tone</annotation><annotation cp="🏼" type="tts">medium-light skin tone</annotation><annotation cp="🏽" type="tts">medium skin tone</annotation><annotation cp="🏾" type="tts">medium-dark skin tone</annotation><annotation cp="🏿" type="tts">dark skin tone</annotation></annotations></ldml>');
    const arabic = parseAnnotations('<ldml><annotations><annotation cp="😀" type="tts">وجه مبتسم</annotation><annotation cp="😀">وجه | ابتسامة</annotation><annotation cp="👍" type="tts">قبول</annotation><annotation cp="❤" type="tts">قلب أحمر</annotation><annotation cp="🏻" type="tts">فاتح</annotation><annotation cp="🏼" type="tts">فاتح متوسط</annotation><annotation cp="🏽" type="tts">متوسط</annotation><annotation cp="🏾" type="tts">غامق متوسط</annotation><annotation cp="🏿" type="tts">غامق</annotation></annotations></ldml>');

    test("the unicode list keeps fully-qualified rows with their group; annotations split keywords and decode entities", () => {

        const rows = parseEmojiTest(sample);

        expect(rows.map(( row ) => row.glyph)).toEqual(["😀", "👍", "👍🏻", "👍🏿", "❤️"]);
        expect(rows[1]).toEqual({ codes: ["1F44D"], glyph: "👍", name: "thumbs up", group: "People & Body" });
        expect(english.get("❤")).toEqual({ name: "red heart", keywords: ["heart & love"] });
        expect(emojiKey("❤️")).toBe("2764");

    });
    test("the catalog folds tones into their base, drops the keyword that repeats the name and marks the artwork it has", () => {

        const rows = parseEmojiTest(sample);
        const catalog = buildCatalog(rows, english, arabic, { statics: new Set(["1f600", "1f44d", "1f44d-1f3fb", "1f44d-1f3fc", "1f44d-1f3fd", "1f44d-1f3fe", "1f44d-1f3ff"]), motions: new Map([["1f44d", [48, 2100] as const], ["ffff", [8, 500] as const]]) });

        expect(catalog.tuples).toEqual([
            ["😀", 0, "grinning face", "وجه مبتسم", "face|grin", "وجه|ابتسامة", "", 1],
            ["👍", 1, "thumbs up", "قبول", "+1|up", "", "👍🏻", 7],
            ["❤️", 0, "red heart", "قلب أحمر", "heart & love", "", "", 0],
        ]);
        expect(catalog.motions).toEqual({ "1f44d": [48, 2100] });
        expect(catalog.tones[4]).toEqual({ key: "dark", modifier: "🏿", name: { en: "dark skin tone", ar: "غامق" } });
        expect(tonedGlyphs(catalog.tuples[1] as never)).toEqual(["👍🏻", "👍🏼", "👍🏽", "👍🏾", "👍🏿"]);
        expect(catalogModule(catalog)).toContain('["👍",1,"thumbs up","قبول","+1|up","","👍🏻",7],');
        expect(catalogModule(catalog)).toStartWith('import type { EmojiGroup, EmojiMotion, EmojiTone, EmojiTuple } from "../kinds.ts";');
        expect(() => buildCatalog(rows, english, new Map(), { statics: new Set(), motions: new Map() })).toThrow("No Arabic annotation");

    });
    test("a flag emoji names its flag file: country pairs and tagged subdivisions, nothing else", () => {

        expect(flagCode("🇪🇬")).toBe("eg");
        expect(flagCode("🇸🇦")).toBe("sa");
        expect(flagCode("🏴󠁧󠁢󠁳󠁣󠁴󠁿")).toBe("gb-sct");
        expect(flagCode("🏳️‍🌈")).toBeUndefined();
        expect(flagCode("🏴")).toBeUndefined();
        expect(flagCode("😀")).toBeUndefined();

    });

});
describe("icon fonts", () => {

    test("a surface's icons become a subset font holding exactly their glyphs, every engine alias resolvable", async () => {

        const names = Object.keys(iconAliases);
        const font = await iconFont(names, iconAliases, "truetype");

        expect(font.codepoints).toEqual(iconCodes);
        expect(new Set(Object.values(font.codepoints)).size).toBe(names.length);
        expect(font.bytes.length).toBeGreaterThan(1000);
        expect(font.bytes.length).toBeLessThan(40_000);

    });
    test("an icon the drawing set lacks is refused by name", async () => {

        await expect(iconFont(["house", "no-such-icon"], iconAliases, "truetype")).rejects.toThrow("no-such-icon");

    });

});
