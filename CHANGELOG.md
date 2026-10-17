# Changelog

Every release of SaaSX, one section per tag, one block per part.

## v0.0.1 — 2026-10-17

### engine/rust

- One facade over log, error, memory, parse, validate, thread, rand, crypto, file, net, http and process, with capability features.
- Engine-owned types on every surface and every failure declared once in a fault contract.
- `process::Args::version` lets every binary answer `--version` with `<name> <version>`.
- Tests, benches, fuzz, miri and semver gates on Linux, macOS and Windows.

### engine/bun

- One `engine` package with a subpath per concern for web and mobile, from HTTP, state and storage to i18n, world data and emoji.
- Spec names are lowercase words behind one optional leading underscore, so the demo spec sorts first and is the default.

### platform/api

- `iam`: a session service on the engine facade, one configured operator, bearer tokens and an audited login; answers `--version`.

### platform/infra

- The infrastructure tool on the engine's process capability: doctor, services and packages; answers `--version`.

### platform/skill

- The knowledge runtime tool on the engine's process capability: doctor, typed environment and exec; answers `--version`.

### platform/web

- The spec-driven Next.js engine: screens, blocks and features compiled from specs into sites and panels.
- One element, one component and one feature render a single hello page from every spec.

### platform/mobile

- The spec-driven Expo engine: the same spec language, a native stack navigator and device adapters.
- One element, one component and one feature render a single hello screen from every spec; the lab identity comes from the environment.
