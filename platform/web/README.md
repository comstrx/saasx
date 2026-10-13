# ✨ Web

A spec-driven Next.js engine for building SEO sites, client surfaces and admin panels. The core (`src/`, `public/`, `messages/`, `tools/`, `tests/`) holds no product; a site or a panel is a spec under `specs/<name>`.

## Overview

The engine separates what a surface is from how it is built. A spec declares screens as blocks of features, each feature tuned by `options`, fed through `ports` and gated by `access`; the compiler checks every declaration against the features and the API catalogue at build time and the renderer walks the compiled tree.

One system at every depth — `{ options, children }`:

```text
screen   contents (name, path, title, description, icon, entity)  ·  options (render, title, seo, index, nav, footer, sidebar, loader)  ·  access
block    options (width, height, grid, sizes, gap, padding, align, tone, radius, shadow)  ·  features  ·  blocks
feature  name  ·  heading  ·  options  ·  ports  ·  access  ·  features  ·  blocks
```

A feature is generic: `src/features/<name>/feature.ts` declares its `owner`, the `options` it understands (literal defaults), the `ports` it needs (`list`, `one` or `write`, with the fields it reads) and the `access` it demands. The spec binds each port to a catalogue operation (`read("products.list", { limit: 8 })`, `write("orders.create")`), to inline data (`data([...])`) or to the site document (`site("links")`). The compiler refuses a port whose source lacks a field, a read bound to a write, a write on a server-owned feature, a gated feature the server cannot gate, and an operation the catalogue does not know; permissions of the bound operations become the feature's gate.

The engine is SEO-aware, not SEO-bound: every screen carries `render: server | client`, `seo`, `index` and `title`; a panel spec sets `settings.screen` once and every screen inherits it. A spec declares `contracts: null` to run without a backend — every port is then data or site — and `settings.delivery: static` to ship as a static export.

## Workspace

Bun is the only tool we drive: install, scripts, tests. Next's own build tooling calls Node on its own.

```text
package.json · bun.lock · bunfig.toml · biome.json · tsconfig.json · next.config.ts
messages/          core messages, one file per language; a spec overrides them
specs/<name>/      config/ (contents, settings, themes, contracts, features) · schema/ (screens) · brand/ (assets, messages)
src/               the engine
tools/             plain Bun scripts: architecture, specs, messages, compile, assets, features
tests/             bun test
```

## Layers

`tools/architecture` enforces this order over value and type imports, forbids cycles, third-party imports outside `lib/providers`, `fetch` outside `src/api`, HTML and styling outside `elements`/`icons`, and spec imports outside `lib/spec`.

1. `lib/std` (framework-free), `lib/providers` (the only doors to third-party packages and the shared engine), `types`, the specs, `lib/spec/define`.
2. `api/core` (endpoint DSL, wire, client) and `api/features` (the catalogue, one file per feature).
3. `lib/spec` (shapes, compiler, authoring helpers, the compiled spec behind `@spec/*`).
4. `lib/site`, `lib/observe`.
5. `api/workflow` (`server`, `browser` — the doors the app reads and writes through).
6. `lib/seo`.
7. `stores`, then `hooks`, then `elements`/`icons`, then `components`, then `features`, then `app` with `proxy.ts`.

Files: markup ends in `.tsx` (`elements/*`, `icons/*`, `components/*`, `features/*/components/*`, `features/*/index`); logic ends in `.ts`. `src/features/<name>/` holds exactly `feature.ts` (the manifest), `index.tsx` (the entry), `components/` and `hooks/`.

## Specs

`NEXT_PUBLIC_SPEC` selects the spec folder; empty selects the first installed one. A spec is data: no branching, no calls beyond the typed helpers of `lib/spec/define` (`defineConfig`, `defineSchema`, `screen`, `block`, `feature`, `t`, `read`, `write`, `data`, `site`, `param`, `query`).

```ts
export default screen({
    contents: { name: "home", path: "/", title: t("home.title"), description: t("home.description"), icon: "house" },
    options: { render: "server", seo: true },
    blocks: [
        block({ width: "wide", gap: 12 }, [
            feature("header", { heading: true, options: { prominent: true } }),
            feature("cards", { options: { columns: 4 }, ports: { items: read("products.list", { limit: 8 }) } }),
            feature("links", { ports: { items: site("links") } }),
        ]),
    ],
});
```

Every switch is a key with its default written out, so a change is one value and the machine never guesses.

## Commands

```bash
bun install --frozen-lockfile
bun run dev          # dev server on 3001 after compiling the selected spec
bun run build        # next build (standalone, or a static export when the spec says so)
bun run check        # biome · architecture · messages · specs
bun run typecheck    # next typegen · tsc
bun test
```

CI runs these commands and nothing else.
