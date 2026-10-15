import { resolve } from "node:path";
import type { Rules, SurfaceRules } from "./architecture.ts";

const markup = ["elements", "icons"];
const shared = {
    markupFiles: /^(?:elements|icons|components)\/[^/]+$|^features\/[^/]+\/(?:index|components\/[^/]+)$/,
    hookFiles: /^(?:hooks|features\/[^/]+\/hooks)\//,
    featureEntry: /^features\/([^/]+)\/index\.tsx$/,
    featureManifest: /^features\/([^/]+)\/feature\.ts$/,
    featureComponent: /^features\/([^/]+)\/components\//,
    extensions: ["", ".ts", ".tsx", "/index.ts", "/index.tsx"],
    helpers: [
        "defineConfig",
        "defineSchema",
        "screen",
        "block",
        "feature",
        "t",
        "read",
        "write",
        "data",
        "site",
        "param",
        "query",
        "signal",
        "live",
        "env",
    ],
    structure: [
        "api",
        "app",
        "components",
        "elements",
        "features",
        "hooks",
        "icons",
        "lib",
        "stores",
        "styles",
        "types",
    ],
    flat: ["styles", "elements", "icons", "components", "hooks", "types"],
    markup,
    featureParts: ["feature.ts", "index.tsx", "components", "hooks"],
    apiParts: ["core", "features", "workflow"],
    declarations: ["types/", "../specs/", "lib/spec/surface.ts"],
} as const;

export function defineRules ( surface: SurfaceRules ): Rules {

    const { root, foundation, native, free = [], html, structure = [], owners, layers } = surface;

    return {
        ...shared,
        source: resolve(root, "src"),
        specs: resolve(root, "specs"),
        foundation,
        native,
        free,
        html,
        structure: [...shared.structure, ...structure],
        owners,
        layer: ( path ) =>
            layers.findIndex(( members ) =>
                members.some(( member ) =>
                    typeof member === "string" ? path === member || path.startsWith(member) : member.test(path),
                ),
            ),
    };

}
