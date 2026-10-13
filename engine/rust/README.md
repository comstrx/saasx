# ✨ Rust Engine

[![Rust 1.99+](https://img.shields.io/badge/rust-1.99%2B-orange.svg)](https://www.rust-lang.org)
[![edition 2024](https://img.shields.io/badge/edition-2024-green.svg)](https://doc.rust-lang.org/edition-guide/)

A coherent Rust foundation: an extended standard library of focused, composable crates that every Rust workspace in this repository builds on, and the only door those workspaces have to the ecosystem.

## Overview

Not a collection of unrelated crates. Every member follows one engineering language — one naming style for types and files, one error model, one lifecycle, one dependency direction, one quality bar — so learning one crate is learning them all. It grows toward one coherent surface for errors, memory, buffers, SIMD, parsing, validation, collections, I/O, logging, concurrency, process and system, networking, cache, database, HTTP and web.

Each concern exposes one unified DSL with provider adapters behind it. A consumer selects a provider in code, or takes the default; provider-specific capabilities appear as additional functions, never as a second DSL. Configuration does not exist inside the engine.

Performance-sensitive techniques — SIMD, arenas, preallocation, zero-copy, zero-allocation, cache-aware layouts — are eligible everywhere and adopted only where measurement justifies them:

```text
optimization eligibility = universal
optimization adoption    = evidence-based
```

The engine grows only by pull: a crate exists because a consumer needed it, and a capability moves here when a second consumer needs it.

## Workspace

```text
Cargo.toml · Cargo.lock                         the workspace root
.clippy.toml · .deny.toml                       governance, applies to every crate
xtask/             the gate runner
crates/<name>/     member crates; `base` is the substrate every other one builds on
tests/             public-API contract tests, flat files, linked the way a consumer links
benches/           criterion benchmarks, flat files
fuzz/              libFuzzer targets, flat files; a workspace member, so every gate compiles them
```

Consumers depend on member crates by path. A consumer's own crates never reach the registry directly; when one needs a capability, the engine learns it — by growing a crate or by adding one for that domain, improving on the libraries it wraps or offering a DSL over them.

## Crate anatomy

```text
crates/<name>/
  Cargo.toml          inherits every package key from the workspace; owns only its name, description, keywords and categories
  src/lib.rs          crate docs, module declarations, public re-exports
  src/prelude.rs      the crate's vocabulary, glob-importable
  src/<concept>.rs    a concept that fits one file
  src/<concept>/      a larger concept: mod.rs declares and re-exports, arch.rs holds every type, one impl file per concern
```

No file holds tests or benchmarks; those live in `tests/` and `benches/` only, each file a crate with its own one-line doc.

## Code style

The code is written by hand, in one house style, and no formatter runs over it. Types are declared in one predictable place and used through namespaces: a zero-sized struct carries an API spread across concern files. There are no free functions beyond `main`. Comments exist only where a lint demands a doc, and then say the one thing the signature does not.

## Development

Run from the workspace root:

```bash
cargo run -q --manifest-path xtask/Cargo.toml -- setup    # install every missing gate tool and the nightly toolchain; gates runs it first
cargo run -q --manifest-path xtask/Cargo.toml -- gates    # clippy · test · doc · audit · vet · udeps · hack · semver · fuzz (one minute per target)
cargo run -q --manifest-path xtask/Cargo.toml -- bloat    # release binary size per crate, every binary
cargo run -q --manifest-path xtask/Cargo.toml -- fuzz     # build the fuzz targets on nightly; --run --time 600 fuzzes each
cargo run -q --manifest-path xtask/Cargo.toml -- miri     # the test suite under Miri on nightly
cargo run -q --manifest-path xtask/Cargo.toml -- sanitizer --sanitizer tsan   # the test suite under asan (default), tsan, msan or lsan
cargo run -q --manifest-path xtask/Cargo.toml -- doctor   # toolchains and tools present, then a compile check
```

The runner lists every task when called without one. CI runs `gates` and nothing else on every change; the daily workflow runs `sanitizer`, `miri` and an hour of `fuzz --run`.

The minimum supported Rust version is <code>1.99.0</code>. `cargo udeps`, `cargo fuzz`, Miri and the sanitizers use the pinned nightly named in `xtask/src/main.rs`; everything else builds on the current stable toolchain. No formatter governs the code: it is written by hand in the house style.

## Lint policy

The workspace denies `clippy::{all, cargo, nursery, pedantic}` plus a curated restriction set, and treats warnings as errors. Every crate opts in with `[lints] workspace = true`; a crate outside the policy is a hole in it. `allow` attributes are denied, so an escape hatch must be `#[expect(..., reason = "...")]` — scoped, justified, and failing the build once it stops being needed.

`unsafe` is sanctioned under proof discipline: it enters through such an expectation on the smallest item that needs it, with a `// SAFETY:` note per block and one unsafe operation per block, and is exercised under Miri and the sanitizers once it exists.
