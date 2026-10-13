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
tests/             contract tests, flat files, importing packages the way a consumer does
benches/           mitata benchmarks, flat files
```

Consumers depend on member packages through the workspace. A consumer's own packages never add an ecosystem dependency directly; when one needs a capability, the engine learns it.

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
bun run fmt      # biome, write mode
```

CI runs `bun run gates` and nothing else. The Bun version is pinned in `package.json` (`packageManager`), and CI installs exactly that.

## Release

The packages version in lockstep; the engine's version lives in the root `package.json` and in every package.

```sh
bun run release version 0.2.0   # every manifest to one version
bun run release changelog       # engine commits since the last engine/v* tag, grouped by package
bun run release tag             # git tag engine/v<version>
bun run release dry             # changelog preview, pack every package in dependency order into .release/, install the tarballs in a fresh consumer, typecheck and run it
```

`dry` is the extraction proof: what a consumer outside the workspace can install and run from the tarballs is what ToolX ships.

## Policy

`bunfig.toml`: exact versions, isolated linker, a three-day minimum release age for every new dependency, randomized test order.

TypeScript `strict` plus the exactness flags (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `verbatimModuleSyntax`, `isolatedDeclarations` so every exported signature is explicit). Biome with every rule group at `error` and the `project` and `test` domains fully on; an escape hatch is a `biome-ignore` with a reason, scoped to one line.
