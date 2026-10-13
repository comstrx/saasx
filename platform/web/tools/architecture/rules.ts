import { defineRules } from "@engine/tooling";
import { root } from "../core/index.ts";

export const rules = defineRules({
    root,
    foundation: /^(react(?:\/|$)|next(?:\/|$)|server-only$|@engine\/)/,
    html: true,
    structure: ["proxy.ts"],
    owners: {
        "lib/spec/config.ts": ["@spec/routing", "@spec/settings"],
        "lib/spec/server.ts": ["@spec/config", "@spec/schema", "@spec/messages"],
        "lib/spec/browser.ts": ["@spec/browser"],
        "app/[locale]/layout.tsx": ["@spec/theme.css"],
        "app/[locale]/[[...path]]/blocks.tsx": ["@spec/registry"],
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
});
