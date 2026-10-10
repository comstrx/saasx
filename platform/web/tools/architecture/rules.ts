import { resolve } from "node:path";
import { root } from "../core/index.ts";

export const source = resolve(root, "src");
export const foundation = /^(react(?:\/|$)|next(?:\/|$)|server-only$)/;
export const markupFiles = /^(?:elements|icons|components)\/[^/]+$|^features\/[^/]+\/(?:index|components\/[^/]+)$/;
export const hookFiles = /^(?:hooks|features\/[^/]+\/hooks)\//;
export const featureEntry = /^features\/([^/]+)\/index\.tsx$/;
export const featureComponent = /^features\/([^/]+)\/components\//;

export const extensions = [
    "", ".ts", ".tsx", ".js", "/index.ts", "/index.tsx", "/index.js"
];
export const helpers = [
    "defineConfig", "defineSchema", "t"
];
export const structure = [
    "api", "app", "components", "elements", "features", "hooks", "icons", "lib",
    "stores", "styles", "types", "proxy.ts", "instrumentation.ts", "instrumentation-client.ts"
];
const entrypoints = [
    "proxy.ts", "instrumentation.ts", "instrumentation-client.ts"
];
export const flat = [
    "styles", "elements", "icons", "components", "hooks", "types"
];
export const markup = [
    "elements", "icons"
];
export const featureParts = [
    "index.tsx", "components", "hooks"
];
export const apiParts = [
    "core", "features", "workflow"
];
export const executable = [
    "IfStatement", "SwitchStatement", "ForStatement", "ForOfStatement", "WhileStatement",
    "FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression",
    "NewExpression", "AwaitExpression", "MemberExpression", "ConditionalExpression",
];
export const owners: Readonly<Record<string, string[]>> = {
    "lib/spec/config.ts": ["@spec/connections", "@spec/routing"],
    "lib/spec/server.ts": ["@spec/config", "@spec/schema", "@spec/messages"],
    "lib/spec/browser.ts": ["@spec/browser"],
    "app/[locale]/layout.tsx": ["@spec/theme.css"],
    "app/[locale]/[[...path]]/blocks.tsx": ["@spec/registry"],
};

export const declarations = ["types/", "../specs/", "lib/spec/define.ts"];

const layers: readonly (readonly (string | RegExp)[])[] = [
    ["lib/std/", "lib/providers/", ...declarations],
    ["api/core/", "api/features/"],
    ["lib/spec/"],
    ["lib/site/", "lib/observe/"],
    ["api/workflow/"],
    ["lib/seo/"],
    ["stores/"],
    ["hooks/", /^features\/[^/]+\/hooks\//],
    markup.map(( folder ) => `${folder}/`),
    ["components/", /^features\/[^/]+\/components\//],
    ["features/"],
    ["app/", ...entrypoints],
];

export function layer ( path: string ): number {

    return layers.findIndex(( members ) => members.some(( member ) => (typeof member === "string" ? path === member || path.startsWith(member) : member.test(path))));

}
