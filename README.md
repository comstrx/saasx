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

Stack: Rust for the backend and infrastructure, Next.js for every web surface, React Native for mobile.

## Parts

One repository, five parts. Each part is a real product component and the incubator of exactly one ToolX tool.

| Part | What it is | Becomes |
| --- | --- | --- |
| [`api/`](./api) | The backend. A generic `core` (errors, memory, parsing, validation, database, cache, process, HTTP) with the SaasX domain built on top of it. `core` never depends on anything outside itself. | **RustX** |
| [`infra/`](./infra) | A self-contained Rust infrastructure engine: providers, resources, state, plan, apply, deploy, rollback, health. SaasX intent lives only in manifests. | **InfraX** |
| [`skill/`](./skill) | A Rust knowledge-graph runtime served over MCP to AI agents: engineering, framework, infrastructure, business and ToolX knowledge. SaasX knowledge is a separate pack. | **SkillX** |
| [`web/`](./web) | A spec-driven Next.js + React engine. Every surface — SEO sites and non-SEO panels — is declared in `specs/` and compiled by the engine. | **WebX** |
| [`mobile/`](./mobile) | A spec-driven React Native engine. One multi-role app or one build per role, from the same core and the same `specs/`. | **MobileX** |

Each part owns its own setup, tooling and a single `verify` gate; CI runs only the gate of the part that changed.

## From SaasX to ToolX

Product-specific logic — business rules, branding, roles, products, messages — stays in specs, manifests and knowledge packs. The engines stay generic, and that boundary is enforced by tests and lints, not by convention.

```text
saasx/api/core   → RustX
saasx/infra      → InfraX
saasx/skill      → SkillX
saasx/web        → WebX     (minus specs/)
saasx/mobile     → MobileX  (minus specs/)
```

Extraction is a packaging step, not a rewrite. It is complete only when SaasX itself consumes the extracted tool.

## Community

- [Issues](https://github.com/comstrx/saasx/issues)
- [Discussions](https://github.com/comstrx/saasx/discussions)
- [Contributing](https://github.com/comstrx/saasx/blob/main/CONTRIBUTING.md)
- [Security](https://github.com/comstrx/saasx/blob/main/SECURITY.md)
- [Support](https://github.com/comstrx/saasx/blob/main/SUPPORT.md)

## License

Copyright © 2026 Abdulrahman Yasser (comstrx).

Licensed under the [GNU Affero General Public License v3.0](./LICENSE).
