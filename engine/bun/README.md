# ✨ Bun Engine

[![Bun 1.4+](https://img.shields.io/badge/bun-1.4%2B-f9f1e1.svg)](https://bun.com)
[![TypeScript 7](https://img.shields.io/badge/typescript-7-blue.svg)](https://www.typescriptlang.org)

A curated TypeScript foundation: the chosen libraries of the ecosystem behind one unified, predictable surface, shared by every web and mobile workspace in this repository.

## Overview

The JavaScript ecosystem already is a standard library; this engine does not replace it. It selects — one library per concern, chosen deliberately — and exposes each concern through one DSL that reads the same in a browser, in Node, in Bun and in React Native: HTTP, validation, state, i18n, formatting, motion primitives, and the rest as consumers pull them in. Provider-specific capabilities appear as additional functions, never as a second DSL. Configuration does not exist inside the engine.

It never wraps a framework. Frameworks are what the consumers are made of; the engine is what they share.

The engine grows only by pull: a package exists because a consumer needed it, and a capability moves here when a second consumer needs it.

## Package

Bun is the only tool: package manager, script runner and test runner. Node is never invoked directly; a framework's own build tooling may call it, which is that framework's business.

```text
package.json · bun.lock · bunfig.toml                  the one package, `engine`: every dependency, one export per member
tsconfig.json · biome.json                             governance, applies to every file
packages/<name>/src/  members; `base` is the substrate every other one builds on; `index.ts` is the member's surface, one file per concept beside it, no inline tests
packages/world/    `src` (the code), `data` (plain JSON lists: countries, regions, languages, currencies, emojis, fonts) and `asset` (emoji, flag and font files); a surface's compile copies what it uses into `public/_generated/world`
tests/             contract tests, flat files, importing members the way a consumer does
benches/           mitata benchmarks, flat files
```

A consumer depends on the one package and imports a member by subpath, `import { defineClient } from "engine/context"`; members import each other the same way. A library both web and mobile use lives here once; a library only one of them uses (its framework, or something native to it) lives in that part.

Inside this repository a part depends on the engine with `"engine": "link:engine"`, a live symlink to this folder that `bun link` registers; a distributed part swaps that one value for a git tag of this package.

| Member             | Concern                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `engine/api`       | A typed endpoint catalogue, its wire contract and the client that speaks it.                                                                                                                                                                                                                                 |
| `engine/array`     | Lists as data: keyed lookups, grouping, ordering, chunking and the row operations a cached list needs (upsert, remove, move) — pure, allocation-light, no runtime assumptions.                                                                                                                               |
| `engine/base`      | The shared substrate every other package in the engine is built on.                                                                                                                                                                                                                                          |
| `engine/cache`     | In-memory caching primitives: expiring entries, LRU, in-flight deduplication and stale-while-revalidate.                                                                                                                                                                                                     |
| `engine/context`   | Application state as one DSL over zustand: defined stores, selectors, persistence through storage and React bindings.                                                                                                                                                                                        |
| `engine/cookie`    | Cookies as one jar contract: parse and serialize, server headers, the browser document and a storage-backed jar for hosts without cookies.                                                                                                                                                                   |
| `engine/device`    | What the device is and what it allows, as one DSL: facts about platform, screen, locale and connectivity, permissions asked under one vocabulary, and watchers over the facts that change. A browser adapter is built in; a native surface injects its own.                                                  |
| `engine/error`     | A single failure model: kinds, HTTP status, codes, field errors, cause chains and the questions every caller asks of a failure.                                                                                                                                                                              |
| `engine/file`      | Files on the wire: multipart bodies, size limits, MIME lookup and data URIs.                                                                                                                                                                                                                                 |
| `engine/history`   | A navigation history as data: a bounded stack of entries with push, replace, navigate, back, reset and query updates, leave guards, native dismissal sync and href parsing — pure, no router and no runtime assumptions.                                                                                     |
| `engine/log`       | Structured logging: one JSON line per signal, levels, bound facts, redaction and pluggable sinks.                                                                                                                                                                                                            |
| `engine/net`       | HTTP transport: timeouts, retries with backoff, bounded body reading, URL and header helpers.                                                                                                                                                                                                                |
| `engine/parse`     | Parsers and formatters for the small grammars every surface meets: path patterns, query strings, templates, scalars, durations and byte sizes.                                                                                                                                                               |
| `engine/socket`    | Realtime over WebSocket as one DSL: a connection with reconnect and heartbeat, named channels, typed events, and the pusher-style wire adapter.                                                                                                                                                              |
| `engine/spec`      | The spec language shared by every surface: manifests, ports, bindings and the compiler core.                                                                                                                                                                                                                 |
| `engine/storage`   | One key-value store contract over memory, web storage and any async driver, with namespaces and JSON codecs.                                                                                                                                                                                                 |
| `engine/string`    | Text as data: unicode-aware slugs, case conversions, word splitting, truncation, masking and escaping — pure functions with no locale or runtime assumptions.                                                                                                                                                |
| `engine/tooling`   | Build-time tooling every surface runs under Bun: files, spec loading, feature manifests, message composition, brand assets and the architecture analyzer.                                                                                                                                                    |
| `engine/translate` | Messages, locales and formatting: dictionaries, interpolation, plurals, negotiation, direction and Intl formatting that survives bidi.                                                                                                                                                                       |
| `engine/validate`  | Schema validation over zod: the shared field vocabulary and failures that speak the engine's error model.                                                                                                                                                                                                    |
| `engine/world`     | The world a surface speaks to: countries with their dialing keys, regions, languages, currencies and emoji, each searchable in Arabic, English and its own tongue; one flag drawing per country; the Arabic and Latin fonts; and the design vocabulary every surface renders from: tokens, motion and icons. |

Members are runtime-agnostic: a lint rejects `Bun`, `process`, `Buffer`, `require` and any `bun:`/`node:` import inside `packages/`; tests and benches may use them.

## Development

```bash
bun install --frozen-lockfile
bun link         # registers this folder as `engine` for the parts' `link:engine`
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
