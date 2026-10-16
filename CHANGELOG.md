# Changelog

Every release of SaaSX, one section per tag, one block per part.

## v0.1.0 — 2026-10-14

### engine/rust

- One facade over log, error, memory, parse, validate, thread, rand, crypto, file, net, http and process, with capability features.
- Engine-owned types on every surface and every failure declared once in a fault contract.
- Tests, benches, fuzz, miri and semver gates on Linux, macOS and Windows.

### engine/bun

- One `engine` package with a subpath per concern for web and mobile, from HTTP, state and storage to i18n, world data and emoji.

### platform/api

- `iam`: a session service on the engine facade, one configured operator, bearer tokens and an audited login.

### platform/infra

- The infrastructure tool on the engine's process capability: doctor, services and packages.

### platform/skill

- The knowledge runtime tool on the engine's process capability: doctor, typed environment and exec.

### platform/web

- The spec-driven Next.js engine: screens, blocks and features compiled from specs into sites and panels.

### platform/mobile

- The spec-driven Expo engine: the same spec language, a native stack navigator and device adapters.
