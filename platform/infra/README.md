# ✨ Infra

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
