import assert from "node:assert/strict";
import { test } from "node:test";
import { inspect, layoutIssues, sources } from "../../tools/architecture/index.ts";
import { scratch } from "../core/scratch.ts";

const planted: Record<string, string> = {
    "lib/std/bad.ts": 'import { x } from "@/lib/spec/server";\nimport z from "zod";',
    "hooks/use-bad.ts": 'import { a } from "@/features/cart/components/list";\nexport const f = () => fetch("/x");',
    "hooks/use-marked.tsx": "const B = () => null;\nexport const m = () => <B />;",
    "features/cart/components/list.tsx": 'export const a = <div className="x" style={{}}>hi</div>;',
    "features/cart/components/bare.tsx": [
        'import { B } from "@/elements/button";',
        'import { C } from "@/components/card";',
        "// element: the one place a raw button is cheaper than a card",
        'import { D } from "@/elements/divider";',
        "export const r = () => <C><B /><D /></C>;",
    ].join("\n"),
    "features/cart/index.tsx": [
        'import { C } from "@/components/card";',
        'import { r } from "./components/bare";',
        'export const options = { size: 3, open: true, tags: ["a"], run: Date.now() };',
        "export default () => <C>{r()}</C>;",
    ].join("\n"),
    "features/cart/hooks/h.ts": 'import "@/features/cart/components/list";',
    "features/thin/index.tsx": '"use client";\nimport { r } from "./components/bare";\nexport default r;',
    "components/box.ts": "export const box = 1;",
    "lib/std/view.tsx": "export const n = 1;",
    "elements/button.tsx": 'import { u } from "@/hooks/use-bad";\nexport const B = () => <button className="a" />;',
    "api/a.ts": 'import { b } from "./b";\nexport const a = fetch("/");',
    "api/b.ts": 'import { a } from "./a";\nexport const b = import(name);',
    "app/page.tsx": 'import c from "@spec/config";\nexport default () => <main><script /></main>;',
    "app/x.tsx": [
        'import { y } from "../../specs/r/config/api.ts";',
        'const z = import("./q");',
        'export * from "left-pad";',
        'export type { T } from "evil";',
    ].join("\n"),
    "lib/spec/config.ts": 'import c from "@spec/config";',
    "lib/spec/bad.ts": 'import { x } from "@/lib/site/settings";',
    "lib/site/bad.ts": 'import { y } from "@/api/workflow/server";',
    "lib/observe/bad.ts": 'import { r } from "@/lib/seo";',
    "api/core/bad.ts": 'import { c } from "@/lib/spec/config";',
    "lib/providers/bad.ts": 'import { o } from "@/lib/std/object";\nexport { z } from "zod";',
    "stores/bad.ts": 'import { h } from "@/hooks/use-api";',
    "lib/site/shape.ts": 'import type { Reading } from "@/api/workflow/server";\nexport type R = Reading;',
    "../specs/r/config/api.ts": "export default {};",
    "../specs/r/config/index.ts": [
        'import x from "../../../src/api/workflow/server.ts";',
        "if (a) { foo(); }",
        "export default defineConfig({ a: b.c, d: () => 1, e: new Date() });",
    ].join("\n"),
};
const expected = [
    "lib/spec/config.ts: Selected specs belong behind lib/spec.",
    "lib/std/bad.ts: Standard utilities must stay framework-independent.",
    "lib/std/bad.ts: Third-party imports belong in lib/providers: zod",
    "lib/std/bad.ts: Standard utilities must stay framework-independent.",
    "lib/std/bad.ts: upward dependency on lib/spec/server.ts",
    "lib/spec/bad.ts: upward dependency on lib/site/settings.ts",
    "lib/site/bad.ts: upward dependency on api/workflow/server.ts",
    "lib/observe/bad.ts: upward dependency on lib/seo/index.ts",
    "api/core/bad.ts: upward dependency on lib/spec/config.ts",
    "stores/bad.ts: upward dependency on hooks/use-api.ts",
    "lib/site/shape.ts: upward type dependency on api/workflow/server.ts",
    "hooks/use-bad.ts: Backend transport belongs in src/api.",
    "hooks/use-bad.ts: upward dependency on features/cart/components/list.tsx",
    "hooks/use-bad.ts: feature internals must stay private: features/cart/components/list.tsx",
    "hooks/use-marked.tsx: Hooks are logic: a .ts file without markup.",
    "features/cart/components/list.tsx: HTML belongs in elements: div",
    "features/cart/components/list.tsx: Styling belongs in elements.",
    "features/cart/components/list.tsx: Styling belongs in elements.",
    "features/cart/components/bare.tsx: Features build on components; an element needs a reason comment (// element: …): @/elements/button",
    "features/cart/index.tsx: A feature entry is thin: it imports its own components only, not @/components/card",
    "features/cart/index.tsx: Feature entries must explicitly declare client or server ownership.",
    "features/cart/index.tsx: options.run: feature options are literal values only (strings, numbers, booleans, null, arrays, objects).",
    "features/cart/hooks/h.ts: upward dependency on features/cart/components/list.tsx",
    "features/thin/index.tsx: A feature entry exports its options as a literal object.",
    "components/box.ts: Markup files end in .tsx.",
    "lib/std/view.tsx: No markup here: a .ts file.",
    "api/b.ts: Use explicit dynamic import paths.",
    "app/page.tsx: Selected specs belong behind lib/spec.",
    "app/page.tsx: HTML belongs in elements: main",
    "app/x.tsx: No markup here: a .ts file.",
    "app/x.tsx: Third-party imports belong in lib/providers: left-pad",
    "app/x.tsx: direct project import; use lib/spec.",
    "../specs/r/config/index.ts: Specs may import their own modules and typed define helpers only.",
    "../specs/r/config/index.ts: Specs are declarative data; execution and branching belong in src.",
    "../specs/r/config/index.ts: Specs may call typed definition helpers only.",
    "../specs/r/config/index.ts: Specs are declarative data; execution and branching belong in src.",
    "../specs/r/config/index.ts: Specs are declarative data; execution and branching belong in src.",
    "../specs/r/config/index.ts: Specs are declarative data; execution and branching belong in src.",
    "../specs/r/config/index.ts: upward dependency on api/workflow/server.ts",
    "Import cycle: api/a.ts -> api/b.ts -> api/a.ts",
];

test("the architecture tool names every planted violation and nothing else", () => {

    const tree = new Map([...sources()].filter(( [path] ) => !path.startsWith("../specs/")));

    for ( const [path, code] of Object.entries(planted) ) {

        tree.set(path, code);

    }

    assert.deepEqual(inspect(tree).sort(), [...expected].sort());

});
test("the folder laws name every stray layer, nested flat folder, broken feature folder and foreign api part", () => {

    const layers = ["app", "components", "elements", "hooks", "icons", "lib", "stores", "styles", "types"];
    const files = [
        ...layers.map(( name ) => `${name}/.gitkeep`),
        "proxy.ts",
        "instrumentation.ts",
        "instrumentation-client.ts",
        "api/core/.gitkeep",
        "api/features/cart.ts",
        "api/workflow/.gitkeep",
        "api/legacy.ts",
        "api/doors/.gitkeep",
        "vendor/.gitkeep",
        "components/nested/.gitkeep",
        "features/stray.ts",
        "features/cart/index.tsx",
        "features/cart/components/.gitkeep",
        "features/cart/hooks/.gitkeep",
        "features/cart/config.ts",
        "features/orders/components/.gitkeep",
        "features/orders/index.ts",
    ];
    const tree = scratch(Object.fromEntries(files.map(( file ) => [file, ""])));

    try {

        assert.deepEqual(layoutIssues(tree.root).sort(), [
            "src/ holds the fixed layers only: vendor",
            "src/api/ holds core/, features/ and workflow/ only: doors",
            "src/api/ holds core/, features/ and workflow/ only: legacy.ts",
            "src/components/ must stay flat: nested",
            "src/features/ contains feature directories only: stray.ts",
            "src/features/cart/ holds index.tsx, components/ and hooks/ only: config.ts",
            "src/features/orders/ declares its calls and permissions in src/api/features/orders.ts",
            "src/features/orders/ holds index.tsx, components/ and hooks/ only: index.ts",
            "src/features/orders/ needs its entry index.tsx",
        ].sort());

    }
    finally {

        tree.dispose();

    }

});
