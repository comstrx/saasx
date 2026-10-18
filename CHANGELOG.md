# Changelog

Every release of SaaSX, one section per tag, one block per part.

## v0.1.3 — 2026-10-18

Every tool's release now carries its own assets, attested by the SaaSX release workflow: a part's binaries for the six targets with their `.sha256` sidecars, installers stamped for that repository, a per-tool SBOM and `SHA256SUMS`; a tool without a binary ships its source as `<tool>-<version>.tar.gz` and `.zip`, which the same installers unpack. Every README opens with a Download block — the Linux and macOS installer, the Windows installer, and the source — and a part's path in SaaSX becomes the tool at extraction. `scripts/assets.sh` holds the asset naming and integrity the release and the extraction share, and a `tools` job verifies all eight releases on Linux, macOS and Windows.

### engine/rust

- The README's Download block: `rustx-installer.sh` / `.ps1` unpack the latest release's source, or clone and run `cargo xtask gates`.

### engine/bun

- The README's Download block: `bunx-installer.sh` / `.ps1` unpack the latest release's source, or clone and run `bun run gates`.

### platform/api

- The README's Download block: `api-hello-installer.sh` / `.ps1` install the latest `hello`, or clone and run `cargo run --release -p hello`.

### platform/infra

- The README's Download block: `infra-installer.sh` / `.ps1` install the latest `infra`, or clone and run `cargo run --release -- hello`.

### platform/skill

- The README's Download block: `skill-installer.sh` / `.ps1` install the latest `skill`, or clone and run `cargo run --release -- hello`.

### platform/web

- The README's Download block: `webx-installer.sh` / `.ps1` unpack the latest release's source, or clone and run `bun run dev`.

### platform/mobile

- The README's Download block: `mobilex-installer.sh` / `.ps1` unpack the latest release's source, or clone and run `bun run start`.

### platform/desk

- The README's Download block: `desk-admin-installer.sh` / `.ps1` and `desk-client-installer.sh` / `.ps1` install the latest apps, or clone and run `bun run dev`.

## v0.1.2 — 2026-10-18

### engine/rust

- `http::Keep`: a client that keeps its connections — one at a time over HTTP/1.1, multiplexed over HTTP/2, dropped once the peer closes — measured at 138 µs a request against 235 µs over a fresh connection.
- `process::Run` feeds standard input on a task while it gathers output, so a program that answers as it reads cannot deadlock the pipe, and a program that never reads is not an error.
- `http::Router::check` names the first malformed or conflicting pattern and a server refuses to start on it with `bad_route`.

### engine/bun

- `net`: a forwarded host or proto is read from the hop the outermost trusted proxy wrote, counted from the right like forwarded-for and absent past the chain, never from the value a client sent first.
- `cookie`: a cookie asking `SameSite=None` without `Secure` is refused instead of being dropped silently by browsers.
- `tooling`: `themeCss` renders a surface's tokens, motion, fonts and icon face from one input; `device`: the platform `desktop` joins web, ios and android.

### platform/api

- The hello bench measures eight greetings over one kept connection beside one over a fresh connection.

### platform/infra

- `infra hello`: the whole lifecycle of a command-line tool on the engine — booted, logged, answering hello, `--version`, usage on anything else — and nothing more until real requirements arrive.

### platform/skill

- `skill hello`: the same lifecycle, the same promise.

### platform/web

- The client runtime (session, signals and the access guard) loads only when the spec declares ports, access, signals, a session cookie or realtime; a static panel without them ships none of it.
- `bun run build --all` builds every installed spec, so both deliveries are gated; the theme stylesheet comes from the engine.

### platform/mobile

- `bun run export --all` exports every installed spec.

### platform/desk

- The desktop engine: a Tauri host on the Rust engine answering typed calls, a React page on the Bun engine, specs that declare identity, window and permissions, and one binary per spec with the page embedded — `desk-<spec>`, built, packed and installed under that name for every release target and answering `--version` with it.

## v0.1.1 — 2026-10-17

### engine/rust

- `http::Router::check` names the first route pattern that is malformed or conflicts with an earlier one, and a server refuses to start on it (`bad_route`, a `Config` failure) instead of answering 404 for a route that was declared.

### platform/api

- `hello` replaces `iam`: the first service is the whole lifecycle of a service on the engine — booted from `HELLO_*`, audited at start and stop, served thread per core, stopped by a signal — answering `hello world` at `/` and `ok` at `/health`; its binary ships as `api-hello`.

### platform/web

- A spec with `settings.delivery: "static"` builds a static export: the server-only files (the proxy, the API routes, the sitemap, the `.well-known` route) carry `.server.ts` and leave that build, every locale and screen is pre-rendered, `/` enters the default locale, robots stays static and browser beacons stay quiet.
- The hello feature is client-owned, so a `render: "client"` panel renders it after hydration while a server-delivered site still ships it in the HTML.
- The demo spec is gone: `admin` is a static, client-rendered panel and `client` a server-rendered site.

### platform/mobile

- The demo spec is gone: `admin` and `client` are the two apps.

## v0.0.2 — 2026-10-17

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
