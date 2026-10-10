# ✨ Node Engine

[![Node 26+](https://img.shields.io/badge/node-26%2B-brightgreen.svg)](https://nodejs.org)
[![TypeScript 7](https://img.shields.io/badge/typescript-7-blue.svg)](https://www.typescriptlang.org)

A curated TypeScript foundation: the chosen libraries of the ecosystem behind one unified, predictable surface, shared by every web and mobile workspace in this repository.

## Overview

The JavaScript ecosystem already is a standard library; this engine does not replace it. It selects — one library per concern, chosen deliberately — and exposes each concern through one DSL that reads the same in a browser, in Node and in React Native: HTTP, validation, state, i18n, formatting, motion primitives, and the rest as consumers pull them in. Provider-specific capabilities appear as additional functions, never as a second DSL. Configuration does not exist inside the engine.

It never wraps a framework. Frameworks are what the consumers are made of; the engine is what they share.

The engine grows only by pull: a package exists because a consumer needed it, and a capability moves here when a second consumer needs it.

## Workspace

```text
package.json · pnpm-workspace.yaml · pnpm-lock.yaml   the workspace root
.node-version · tsconfig.json · biome.json · vitest.config.ts
packages/<name>/   member packages; `base` is the substrate every other one builds on
tests/             contract tests, flat files, importing packages the way a consumer does
benches/           benchmarks, flat files
```

Consumers depend on member packages through the workspace. A consumer's own packages never add an ecosystem dependency directly; when one needs a capability, the engine learns it.

## Package anatomy

```text
packages/<name>/
  package.json      name, version, exports; private until extraction
  src/index.ts      the public surface; one file per concept beside it; no inline tests
```

## Development

```bash
pnpm install --frozen-lockfile
pnpm verify      # check (tsc) · lint (biome) · test (vitest)
pnpm bench       # vitest benchmarks
pnpm fmt         # biome, write mode
```

CI runs nothing that `pnpm verify` does not run locally. Node and pnpm versions are pinned in `.node-version` and `package.json` (`packageManager`).

## Policy

TypeScript `strict` plus the exactness flags (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`). Biome's recommended preset with `any`, non-null assertions, parameter reassignment and `console` as errors. Only what is genuinely public is exported.
