import { defineRules } from "@engine/tooling";
import { root } from "../core/index.ts";

export const rules = defineRules({
    root,
    foundation: /^(react(?:\/|$)|expo(?:-[a-z-]+)?(?:\/|$)|@expo\/|@engine\/)/,
    native: /^react-native(?:\/|$)/,
    free: ["elements", "icons", "hooks", "styles", "app"],
    html: false,
    structure: ["render"],
    owners: {
        "lib/spec/config.ts": ["@spec/routing"],
        "lib/spec/runtime.ts": ["@spec/config", "@spec/schema", "@spec/messages", "@spec/client"],
        "lib/spec/world.ts": ["@spec/flags"],
        "render/blocks.tsx": ["@spec/registry"],
    },
    layers: [
        ["lib/providers/", "types/", "../specs/"],
        ["api/features/"],
        ["lib/spec/"],
        ["lib/site/", "lib/observe/"],
        ["api/workflow/"],
        ["stores/"],
        ["hooks/", /^features\/[^/]+\/hooks\//],
        ["elements/", "icons/", "styles/"],
        ["components/", /^features\/[^/]+\/components\//],
        ["features/"],
        ["render/"],
        ["app/"],
    ],
});
