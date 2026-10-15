import { catalogueFacts } from "engine/spec";
import { createTools, type Loaded, task } from "engine/tooling";
import { reasons } from "../../src/api/core/index.ts";
import { endpoints } from "../../src/api/features/index.ts";
import { type Locale, supportedLocales } from "../../src/lib/spec/languages.ts";
import { type Compiled, validateSpec } from "../../src/lib/spec/surface.ts";

export type Spec = Loaded<Compiled, Locale>;

export const tools = createTools<Compiled, Locale>({
    root: new URL("../..", import.meta.url),
    variable: "NEXT_PUBLIC_SPEC",
    locales: supportedLocales,
    catalogue: catalogueFacts(endpoints),
    reasons,
    validate: validateSpec,
    assets: [
        { path: "images/brand", brand: "images" },
        { path: "fonts", brand: "fonts" },
        { path: "videos", brand: "videos" },
        { path: "audios", brand: "audios" },
        { path: ".well-known", brand: "well-known" },
    ],
    architecture: {
        foundation: /^(react(?:\/|$)|next(?:\/|$)|server-only$|engine\/)/,
        html: true,
        structure: ["proxy.ts"],
        owners: {
            "lib/spec/config.ts": ["@spec/routing", "@spec/settings"],
            "lib/spec/server.ts": ["@spec/config", "@spec/schema", "@spec/messages"],
            "lib/spec/browser.ts": ["@spec/browser"],
            "app/[locale]/layout.tsx": ["@spec/theme.css"],
            "app/[locale]/[[...path]]/blocks.tsx": ["@spec/registry"],
            "app/[locale]/[[...path]]/mount.ts": ["@spec/mount"],
            "app/.well-known/[...path]/route.ts": ["@spec/well-known"],
        },
        layers: [
            ["lib/providers/", "types/", "../specs/"],
            ["api/features/"],
            ["lib/spec/"],
            ["lib/site/", "lib/observe/"],
            ["api/workflow/"],
            ["lib/seo/"],
            ["stores/"],
            ["hooks/", /^features\/[^/]+\/hooks\//],
            ["elements/", "icons/"],
            ["components/", /^features\/[^/]+\/components\//],
            ["features/"],
            ["app/", "proxy.ts"],
        ],
    },
});
export const { root, writeFile, writeJson, composeMessages, assets } = tools;
export const { installedSpecs, selectSpec, specFromEnvironment, loadSpec } = tools.loader;

task(import.meta.url, tools.check);
