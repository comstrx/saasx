# ✨ Infra

[![Rust 1.99+](https://img.shields.io/badge/rust-1.99%2B-orange.svg)](https://www.rust-lang.org)
[![edition 2024](https://img.shields.io/badge/edition-2024-green.svg)](https://doc.rust-lang.org/edition-guide/)

A Rust infrastructure engine for defining, provisioning, deploying, operating and rolling back infrastructure.

## Overview

Infrastructure as a programmable operational system. The engine owns the reusable concerns; a project's intent lives in manifests and never in the engine.

```text
engine        providers · resources · dependency graph · state · plan · apply · destroy
              deployment · health · rollback · environments · secret references · observability hooks

manifests     Infra.lua · environment contracts · secret references — the project's desired state
```

The engine never says "create this project's cluster"; the manifests do. Separating the two keeps the engine generic and makes a project's infrastructure a set of files that can be read, reviewed and diffed.

Every mutating operation plans before it applies, keeps state with locking, keeps secrets out of state and out of manifests (references only), and leaves a rollback path.

## Engine

The engine is one crate on the Rust engine, reached by path and never through the registry directly. It is a pure library at heart: it builds and runs on a bare machine before anything it manages exists.

## Tool

`infra` drives the engine's `process` capability:

```text
infra doctor                                                  the machine: platform, distro, host, memory, uptime, package and service managers
infra service show|install|uninstall|start|stop|restart|status <name> [--command <path>] [--arg=<x>]... [--env K=V]... [--provider systemd|launchd|windows]
infra package install|uninstall|check <name>                  through apt, dnf, pacman, apk, zypper, nix, brew, winget, scoop or choco
```

A unit is rendered for the machine's provider (or the named one) from one description; nothing escalates privileges on its own. `INFRA_LOG=<level>` writes text to standard error, `INFRA_LOG_FILE` JSON lines and `INFRA_AUDIT` the audit journal; every change to a service or a package is audited with the user as actor.

## Development

```bash
cargo clippy --workspace --all-targets --all-features --locked -- -D warnings
cargo test --workspace --all-features --locked
```

Plain Cargo, no runner: the engine owns the deep gates, a consumer only has to lint and pass its tests. CI runs these two commands and nothing else.

## License

Copyright © 2026 Abdulrahman Yasser (comstrx).

Licensed under the [Apache License 2.0](https://github.com/comstrx/saasx/blob/main/LICENSE).
