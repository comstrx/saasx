# ✨ Bun Engine

[![Bun 1.4+](https://img.shields.io/badge/bun-1.4%2B-f9f1e1.svg)](https://bun.com)
[![TypeScript 7](https://img.shields.io/badge/typescript-7-blue.svg)](https://www.typescriptlang.org)

A curated TypeScript foundation: the chosen libraries of the ecosystem behind one unified, predictable surface, shared by every web and mobile workspace in this repository.

## Overview

The JavaScript ecosystem already is a standard library; this engine does not replace it. It selects — one library per concern, chosen deliberately — and exposes each concern through one DSL that reads the same in a browser, in Node, in Bun and in React Native: HTTP, validation, state, i18n, formatting, motion primitives, and the rest as consumers pull them in. Provider-specific capabilities appear as additional functions, never as a second DSL. Configuration does not exist inside the engine.

It never wraps a framework. Frameworks are what the consumers are made of; the engine is what they share.

The engine grows only by pull: a package exists because a consumer needed it, and a capability moves here when a second consumer needs it.

## Workspace

Bun is the only tool: package manager, workspace, script runner and test runner. Node is never invoked directly; a framework's own build tooling may call it, which is that framework's business.

```text
package.json · bun.lock · bunfig.toml                  the workspace root
tsconfig.json · biome.json                             governance, applies to every file
packages/<name>/   member packages; `base` is the substrate every other one builds on
packages/world/    `src` (the code), `data` (plain JSON lists: countries, regions, languages, currencies, emojis, fonts) and `asset` (emoji, flag and font files); a surface's compile copies what it uses into `public/_generated/world`
tests/             contract tests, flat files, importing packages the way a consumer does
benches/           mitata benchmarks, flat files
```

Consumers depend on member packages through the workspace. A library both web and mobile use lives here once; a library only one of them uses (its framework, or something native to it) lives in that part.

## Package anatomy

```text
packages/<name>/
  package.json      name, version, exports; private until extraction
  src/index.ts      the public surface; one file per concept beside it; no inline tests
```

Packages are runtime-agnostic: a lint rejects `Bun`, `process`, `Buffer`, `require` and any `bun:`/`node:` import inside `packages/`; tests and benches may use them.

## Development

```bash
bun install --frozen-lockfile
bun run gates    # check (tsc) · lint (biome) · test (bun test) · audit (bun audit)
bun run bench    # mitata benchmarks
bun run fmt      # biome assists (imports); no formatter runs here
```

CI runs `bun run gates` and nothing else. The Bun version is pinned in `package.json` (`packageManager`), and CI installs exactly that.

## Policy

`bunfig.toml`: exact versions, isolated linker, a three-day minimum release age for every new dependency, randomized test order.

TypeScript `strict` plus the exactness flags (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `verbatimModuleSyntax`, `isolatedDeclarations` so every exported signature is explicit). Biome with every rule group at `error` and the `project` and `test` domains fully on; an escape hatch is a `biome-ignore` with a reason, scoped to one line.

## Style

No comments anywhere: a name that needs one is renamed. Functions and control statements space their parens (`function name ( a, b )`, `if ( x )`), bodies open and close on a blank line, declarations group together and a blank line precedes the return. The formatter is off; the linter is the only gate on form.
