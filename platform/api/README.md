# ✨ API

[![Rust 1.99+](https://img.shields.io/badge/rust-1.99%2B-orange.svg)](https://www.rust-lang.org)
[![edition 2024](https://img.shields.io/badge/edition-2024-green.svg)](https://doc.rust-lang.org/edition-guide/)

The backend services, built entirely on the Rust engine: one Cargo workspace of thin, opinionated crates over a generic foundation.

## Overview

Everything generic lives in the engine; what lives here is policy — which HTTP engine, which database, how tenancy, identity, authorization, idempotency, outbox and audit are wired. The result is the layer a backend wants ready-made: most of what any service needs, so that a service is a declaration of its own domain and little else.

A service crate depends on engine crates and on sibling library crates in this workspace, never on the ecosystem directly: when a service needs a capability, the engine learns it.

## Workspace

```text
Cargo.toml · Cargo.lock                         the workspace root
.clippy.toml · .deny.toml                       governance, applies to every crate
crates/<name>/     services and the libraries they share
contracts/         API and event schemas each service owns; the web and mobile clients generate from here
tests/             scenario tests across services, flat files
benches/           scenario benchmarks across services, flat files
bloats/            binary-size probes
```

The first and, for now, only service is `hello`: it consumes the engine exactly as every later service will, so each capability that lands in the engine is exercised from a consumer's seat before the real services start.

## Service anatomy

```text
crates/<name>/
  Cargo.toml
  src/main.rs       wiring only
  migrations/       the schema this service owns
  contracts/        the API and event schemas it owns
```

## Development

```bash
cargo clippy --workspace --all-targets --all-features --locked -- -D warnings
cargo test --workspace --all-features --locked
```

Plain Cargo, no runner: the engine owns the deep gates, a consumer only has to lint and pass its tests. CI runs these two commands and nothing else.
