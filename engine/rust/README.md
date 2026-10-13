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
.clippy.toml · .deny.toml · .config/nextest.toml   governance, applies to every crate
xtask/             the gate runner
crates/<name>/     member crates, one layer each, lowest first: log, error, memory, parse, validate, file, net, http, process; `engine` re-exports them all
tests/             public-API contract tests, flat files, linked the way a consumer links
benches/           criterion benchmarks, flat files
fuzz/              libFuzzer targets, flat files; a workspace member, so every gate compiles them
```

Consumers depend on the `engine` facade crate by path and name nothing else. A consumer's own crates never reach the registry directly; when one needs a capability, the engine learns it — by growing a crate or by adding one for that domain, improving on the libraries it wraps or offering a DSL over them.

## Crates

```text
log        structured events and audit records as values, bound fields, text or JSON, sinks with size rotation; nothing written without a sink
error      the one failure every crate returns: a stable code with its HTTP status, exit code and level, a key, a detail, frames, a cause, field problems
memory     bytes without surprises: a stack store, a preallocated buffer, a pool, a bump arena of shared bytes, a zero-copy cursor, byte lanes eight at a time
parse      text into values: integers, reals, flags, sizes, durations, percent-encoding, query strings, dotenv lines, comma lists, each failure keyed
validate   forms that collect every failed field into one keyed failure
file       files, directories and paths, every I/O call asynchronous, atomic writes, paths confined to a root
net        addresses, tuned sockets, listeners with accept-time hooks, streams, dialing with a deadline, resolution, a thread-per-core runtime, a stop signal
http       hyper underneath: a router of async handlers behind middleware, requests and responses as values, a client, WebSockets over an upgrade
process    what a command-line tool stands on: boot, arguments, typed environment with a dotenv file, programs run with a deadline, the machine, its package manager, its service manager, pid files
engine     the one door: every crate above as a module, so a consumer declares one dependency
```

The layers depend downward only: `log` ← `error` ← `memory` ← `parse` ← `validate`, and `file`, `net`, `http`, `process` stand on those in that order. A failure is a value that is printed, logged or journaled only when a caller says so; a store fails with `Exhausted` instead of growing; every I/O call is asynchronous; the HTTP server runs one worker per core, each with its own listener and router, and drains on a stop signal. TLS is not served yet.

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
cargo run -q --manifest-path xtask/Cargo.toml -- fuzz     # build the fuzz targets on nightly; --run --time 600 fuzzes each, --run --budget 3600 shares an hour
cargo run -q --manifest-path xtask/Cargo.toml -- miri     # the pure suites (log error memory parse validate) under Miri on nightly
cargo run -q --manifest-path xtask/Cargo.toml -- sanitizer --sanitizer tsan   # the test suite under asan (default), tsan, msan or lsan
cargo run -q --manifest-path xtask/Cargo.toml -- doctor   # toolchains and tools present, then a compile check
```

The runner lists every task when called without one. CI runs `gates` on Linux, macOS and Windows on every change (fuzzing is skipped on Windows, where libFuzzer does not run); the daily workflow runs `sanitizer`, `miri` and an hour of fuzzing shared by every target (`fuzz --run --budget 3600`). A test running past three minutes is killed (`.config/nextest.toml`).

The minimum supported Rust version is <code>1.99.0</code>. `cargo udeps`, `cargo fuzz`, Miri and the sanitizers use the pinned nightly named in `xtask/src/main.rs`; everything else builds on the current stable toolchain. No formatter governs the code: it is written by hand in the house style.

## Lint policy

The workspace denies `clippy::{all, cargo, nursery, pedantic}` plus a curated restriction set, and treats warnings as errors. Every crate opts in with `[lints] workspace = true`; a crate outside the policy is a hole in it. `allow` attributes are denied, so an escape hatch must be `#[expect(..., reason = "...")]` — scoped, justified, and failing the build once it stops being needed.

`unsafe` is sanctioned under proof discipline: it enters through such an expectation on the smallest item that needs it, with a `// SAFETY:` note per block and one unsafe operation per block, and is exercised under Miri and the sanitizers once it exists.
