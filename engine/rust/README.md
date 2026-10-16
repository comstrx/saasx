# ✨ Rust Engine

[![Rust 1.99+](https://img.shields.io/badge/rust-1.99%2B-orange.svg)](https://www.rust-lang.org)
[![edition 2024](https://img.shields.io/badge/edition-2024-green.svg)](https://doc.rust-lang.org/edition-guide/)

A coherent Rust foundation: an extended standard library of focused, composable crates that every Rust consumer builds on, and the only door those consumers have to the ecosystem.

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
xtask/             the gate runner, `cargo xtask <task>` through `.cargo/config.toml`
crates/<name>/     member crates, one layer each, lowest first: log, error, memory, parse, validate, thread, rand, crypto, file, net, http, process; `engine` is the facade
tests/             public-API contract tests, flat files, linked the way a consumer links
benches/           criterion benchmarks, flat files
fuzz/              libFuzzer targets, flat files; a workspace member, so every gate compiles them
```

Consumers depend on the `engine` facade crate by path and name nothing else; no type of a dependency crosses it, so tokio, hyper or any other library underneath can change without a consumer noticing. A consumer's own crates never reach the registry directly; when one needs a capability, the engine learns it — by growing a crate or by adding one for that domain, improving on the libraries it wraps or offering a DSL over them.

## Crates

```text
log        structured events and audit records as values, bound fields, text or JSON, sinks with size rotation; nothing written without a sink
error      the one failure every crate returns: a stable code with its HTTP status, exit code and level, a key declared once as a fault, a detail, frames, a cause, field problems
memory     bytes without surprises: shared bytes, a stack store, a preallocated buffer, a pool, a bump arena, a zero-copy cursor, byte lanes eight at a time
parse      text into values: integers, reals, flags, sizes, durations, percent-encoding, query strings, dotenv lines, comma lists
validate   forms that collect every failed field into one failure, each field problem a declared fault
thread     concurrency: a runtime per worker thread, a kept executor, tasks on the local set or the blocking pool, deadlines, a stop signal
rand       randomness from the operating system's secure source: unbiased numbers, reals, strings, identifiers, picks, shuffles, dates, UUIDs of version 4 and 7
crypto     SHA-1 and Base64 without dependencies, unguessable tokens with their fingerprints, secrets compared in constant time
file       files, directories and paths, every I/O call asynchronous, atomic writes, paths confined to a root
net        addresses, listeners with accept-time hooks, streams, dialing with a deadline, resolution
http       hyper underneath, none of it on the surface: routes, middleware, requests, responses, methods and headers of its own, a client that refuses what it cannot secure, same-origin WebSockets
process    what a command-line tool stands on: boot, arguments, typed environment with a dotenv file, programs run with a deadline, the machine, its package manager, its service manager, pid files
engine     the facade: each crate as a module whose surface is named item by item, a prelude, and the contract of every code and declared fault
```

Each crate is packaged as `engine-<name>` and reached as `engine::<name>`, so no package shares a name with a registry crate and no scanner mistakes ours for theirs. The layers depend downward only: `log` ← `error` ← `memory`, `parse`, `validate`, `thread`, `rand` ← `crypto`, `file`, `net` ← `http`, `process`. The facade's `file`, `net`, `http` (with `net`) and `process` are features each consumer names, so a command-line tool that takes only `process` compiles no network stack; `alloc` adds the global allocator, a unit type whose whole contract is the standard `GlobalAlloc`.

Every failure a crate raises is declared once in its `Faults`: a stable key a client translates by, the one code it carries, and a default detail; `engine::Contract` lists every code and every declared fault, and a part declares its own the same way. A failure is a value that is printed, logged or journaled only when a caller says so; a store fails with `Exhausted` instead of growing; every I/O call is asynchronous; the HTTP server runs one worker per core, each with its own listener and router, and drains on a stop signal. TLS is neither served nor spoken yet, so the client refuses an `https` URI rather than send it in clear; it also refuses a URI that carries credentials.

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
cargo xtask setup    # install every missing gate tool and the nightly toolchain; gates runs it first
cargo xtask gates    # clippy · test · doc · audit · vet · udeps · hack · semver · fuzz (one minute per target)
cargo xtask bloat    # release binary size per crate, every binary
cargo xtask fuzz     # build the fuzz targets on nightly; --run --time 600 fuzzes each, --run --budget 3600 shares an hour
cargo xtask miri     # the pure suites (log error memory parse validate rand crypto engine) under Miri on nightly
cargo xtask sanitizer --sanitizer tsan   # the test suite under asan (default), tsan, msan or lsan
cargo xtask doctor   # toolchains and tools present, then a compile check
```

The runner lists every task when called without one. CI runs `gates` on Linux, macOS and Windows on every change (fuzzing is skipped on Windows, where libFuzzer does not run); the daily workflow runs `sanitizer`, `miri` and an hour of fuzzing shared by every target (`fuzz --run --budget 3600`). A test running past three minutes is killed (`.config/nextest.toml`). `semver` compares every library crate with its merge base against `--baseline`: the commit before the push on `main`, the base of a pull request, `main` locally; a breaking change needs a version that says so, and a crate absent from the baseline is reported, not compared. Items are compared in the crate that defines them, so the facade's re-exports are guarded there.

The minimum supported Rust version is <code>1.99.0</code>. `cargo udeps`, `cargo fuzz`, Miri and the sanitizers use the pinned nightly named in `xtask/src/main.rs`; everything else builds on the current stable toolchain. No formatter governs the code: it is written by hand in the house style.

## Lint policy

The workspace denies `clippy::{all, cargo, nursery, pedantic}` plus a curated restriction set, and treats warnings as errors. Every crate opts in with `[lints] workspace = true`; a crate outside the policy is a hole in it. `allow` attributes are denied, so an escape hatch must be `#[expect(..., reason = "...")]` — scoped, justified, and failing the build once it stops being needed.

`unsafe` is sanctioned under proof discipline: it enters through such an expectation on the smallest item that needs it, with a `// SAFETY:` note per block and one unsafe operation per block, and is exercised under Miri and the sanitizers once it exists.

## License

Copyright © 2026 Abdulrahman Yasser (comstrx).

Licensed under the [Apache License 2.0](https://github.com/comstrx/saasx/blob/main/LICENSE).
