# ✨ Mobile

A spec-driven React Native engine for building multi-role or role-specific enterprise mobile applications. The core (`src/`, `assets/`, `messages/`, `tools/`, `tests/`) holds no product; an app is a spec under `specs/<name>`.

## Overview

The same language as the web engine, on the shared `@engine/*` packages: a screen is blocks of features, each feature tuned by `options`, fed through `ports` and gated by `access`, declared once in `src/features/<name>/feature.ts` and checked by the compiler at build time. From the same engine and the same specs the build produces either one application that switches role after sign-in, or one build per role.

```text
screen   contents (name, path, title, icon, entity)  ·  options (presentation, title, header, tabs, loader, order)  ·  access
block    options (width, height, grid, gap, padding, align, tone, radius)  ·  features  ·  blocks
feature  name  ·  heading  ·  options  ·  ports  ·  access  ·  features  ·  blocks
```

`presentation: tab` screens form the tab list in `order`; every feature is client-owned. A spec declares `contracts: null` to run without a backend; every port is then data or site.

## Workspace

Bun drives install, scripts and tests. Expo's own tooling (Metro, the native builds) calls Node on its own.

```text
package.json · bun.lock · bunfig.toml · biome.json · tsconfig.json · app.config.ts · metro.config.cjs · babel.config.cjs · index.ts
messages/          core messages, one file per language; a spec overrides them
specs/<name>/      config/ (contents, settings, themes, contracts, features) · schema/ (screens) · brand/ (assets, messages)
src/               the engine
tools/             plain Bun scripts: architecture, specs, messages, compile, assets, features
tests/             bun test
```

The spec is compiled before Expo runs (`bun tools/compile/index.ts <mode>`): `app.config.ts` and `metro.config.cjs` read the compiled `meta.json`, never the TypeScript sources, so Node needs no path aliases.

## Layers

`tools/architecture` enforces this order, forbids cycles, third-party imports outside `lib/providers`, `fetch` outside `src/api`, native primitives (`react-native`) and `style` props outside `elements`/`icons`, and spec imports outside `lib/spec`.

1. `lib/providers`, `types`, the specs, `lib/spec/define`.
2. `api/features` (the catalogue).
3. `lib/spec` (shapes, compiler, authoring helpers, the compiled spec behind `@spec/*`).
4. `lib/site`, `lib/observe`.
5. `api/workflow` (the client door).
6. `stores`, then `hooks`, then `elements`/`icons`/`styles`, then `components`, then `features`, then `render`, then `app` (the Expo Router routes).

Files: markup ends in `.tsx` (`elements/*`, `icons/*`, `components/*`, `features/*/components/*`, `features/*/index`); logic ends in `.ts`. `src/features/<name>/` holds exactly `feature.ts`, `index.tsx`, `components/` and `hooks/`.

## Commands

```bash
bun install --frozen-lockfile
bun run start        # compile the selected spec, then Expo
bun run check        # biome · architecture · messages · specs
bun run typecheck    # compile · tsc
bun test
bun run export       # compile · expo export (the JS bundle, no native toolchain needed)
```
