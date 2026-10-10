# ✨ SaasX

<div align="center">
  <br/>
  <img height="130" src="https://github.com/user-attachments/assets/b219c898-7bf8-4390-994f-71386b2209b9" />
  <br/>
  <br/>
</div>

[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](#license)
[![Release](https://img.shields.io/github/v/release/comstrx/saasx?sort=semver)](https://github.com/comstrx/saasx/releases/latest)

`saasx` is a production-grade multi-tenant, multi-role, multi-product enterprise SaaS and the proving ground from which [ToolX](https://github.com/comstrx/toolx) is extracted.

## Overview

SaasX is one product with two jobs.

**A real enterprise SaaS.** Multi-tenant, multi-role and multi-product on a single unified catalog: super, admin, vendor and delivery panels; SEO client and tenant sites; one mobile app that switches role after login. Built to serve a serious SaaS business on its own — it must stay useful even if every tool around it disappeared.

**The proving ground for ToolX.** Every reusable system is built inside SaasX, hardened against real requirements, benchmarks and production, and only then extracted as a standalone tool.

```text
SaasX builds the evidence.
ToolX captures the engineering and knowledge.
```

Stack: Rust for the backend, infrastructure and knowledge runtime; Next.js for every web surface; React Native for mobile.

## Layout

One repository, two layers. `engine/` holds the two generic foundations; `platform/` holds the five parts built on them. Every part is a real product component and the incubator of exactly one ToolX tool.

```text
engine/
  rust/      the Rust foundation
  node/      the TypeScript foundation
platform/
  api/       backend services
  infra/     infrastructure engine
  skill/     knowledge runtime
  web/       web engine
  mobile/    mobile engine
```

| Part                                    | What it is                                                                                                                                                           | Becomes     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [`engine/rust/`](./engine/rust)         | The Rust foundation: an extended standard library every Rust part builds on, and the only door to the ecosystem. Generic by construction.                            | **RustX**   |
| [`engine/node/`](./engine/node)         | The TypeScript foundation: the chosen libraries behind one unified surface, shared by the web and mobile parts.                                                      | **NodeX**   |
| [`platform/api/`](./platform/api)       | The backend services: thin, opinionated crates over the Rust engine — tenancy, identity, authorization, idempotency, outbox, audit — plus the contracts they expose. | **ApiX**    |
| [`platform/infra/`](./platform/infra)   | A self-contained infrastructure engine on the Rust engine: providers, resources, state, plan, apply, deploy, rollback, health. Intent lives only in manifests.       | **InfraX**  |
| [`platform/skill/`](./platform/skill)   | A knowledge-graph runtime served over MCP to AI agents: engineering, framework, infrastructure and business knowledge. Product knowledge is a separate pack.         | **SkillX**  |
| [`platform/web/`](./platform/web)       | A spec-driven Next.js + React engine on the Node engine. Every surface — SEO sites and non-SEO panels — is declared in `specs/` and compiled by the engine.          | **WebX**    |
| [`platform/mobile/`](./platform/mobile) | A spec-driven React Native engine on the Node engine. One multi-role app or one build per role, from the same core and the same `specs/`.                            | **MobileX** |

Dependencies flow one way, down: a part depends on an engine by local path, never on the ecosystem directly and never on another part. When a part needs a capability, the engine learns it. Each engine and each part owns its own setup, tooling and gate; CI runs only the gates of what changed.

## From SaasX to ToolX

Product-specific logic — business rules, branding, roles, products, messages — stays in environment files, specs, manifests and knowledge packs. The engines and parts stay generic, and that boundary is enforced by tests and lints, not by convention.

```text
saasx/engine/rust      → RustX
saasx/engine/node      → NodeX
saasx/platform/api     → ApiX
saasx/platform/infra   → InfraX
saasx/platform/skill   → SkillX
saasx/platform/web     → WebX     (minus specs/)
saasx/platform/mobile  → MobileX  (minus specs/)
```

Extraction is a packaging step, not a rewrite. SaasX stays the permanent source of every tool; the ToolX repositories are where releases land.

## Community

- [Issues](https://github.com/comstrx/saasx/issues)
- [Discussions](https://github.com/comstrx/saasx/discussions)
- [Contributing](https://github.com/comstrx/saasx/blob/main/CONTRIBUTING.md)
- [Security](https://github.com/comstrx/saasx/blob/main/SECURITY.md)
- [Support](https://github.com/comstrx/saasx/blob/main/SUPPORT.md)

## License

Copyright © 2026 Abdulrahman Yasser (comstrx).

Licensed under the [GNU Affero General Public License v3.0](./LICENSE).
