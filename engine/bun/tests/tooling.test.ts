import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
    analyze,
    assetHash,
    type Connection,
    composeMessages,
    createCore,
    guard,
    messageIssues,
    modeOf,
    type Rules,
    selectConnection,
    specAliases,
    walk,
    within,
} from "@engine/tooling";

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
