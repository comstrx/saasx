# ✨ SaasX

<div align="center">
  <br/>
  <img height="150" src="https://github.com/user-attachments/assets/44494fd3-782f-47a8-9580-b9f0e75a1ac7"/>
  <br/>
  <br/>
</div>

[![Rust + Bun](https://img.shields.io/badge/Rust_%2B_Bun-Enterprise_SaaS-0D9488?logo=rust&logoColor=white)](https://github.com/comstrx/saasx)
[![CI](https://github.com/comstrx/saasx/actions/workflows/global.yml/badge.svg?branch=main)](https://github.com/comstrx/saasx/actions/workflows/global.yml)
[![Release](https://img.shields.io/github/v/release/comstrx/saasx?sort=semver)](https://github.com/comstrx/saasx/releases/latest)
[![License](https://img.shields.io/badge/License-Apache_2.0-007EC6)](https://www.apache.org/licenses/LICENSE-2.0)

> **One Enterprise SaaS. Seven Engineering Tools. One Uncompromising Vision.**

SaasX is a real **multi-tenant, multi-role, multi-product enterprise SaaS** and the proving ground where seven reusable tools are forged into [ToolX](https://github.com/comstrx/toolx).

**Build the hard system once. Make every system after it radically easier.**

---

## 🎯 Overview

**One product. Two missions. An entire engineering ecosystem.**

**Build a real enterprise SaaS:** one unified catalog powering commerce and services across customer experiences, tenant websites, operational panels, and role-aware mobile applications.

**Forge ToolX through reality:** develop the foundations and specialized tools inside SaasX, challenge them with real requirements, and extract them into independent releases. No parallel implementations. No throwaway architecture.

The ambition is clear: **prove advanced engineering in a working product, then make that engineering reusable everywhere.**

---

## 🧩 Capabilities

**A continuously evolving system spanning the complete enterprise lifecycle.**

**Multi-Tenancy & Role-Based Access** · **Unified Catalog & Commerce** · **Identity & Authorization** · **Orders, Payments & Financial Integrity** · **APIs, Realtime & Events** · **SEO Websites & Enterprise Panels** · **Cross-Platform Mobile Experiences** · **Infrastructure & Operations** · **Security & Observability** · **Engineering Knowledge & AI Integration**

Every capability serves a real product requirement while strengthening the reusable tools beneath it.

**One product. Seven tools. Endless possibilities.**

---

## 🏗️ Architecture

**Two foundations. Five specialized forges. Strict ownership.**

```text
┌──────────────────────────────────────────────────────────────┐
│                            SaasX                             │
│              Enterprise Product + ToolX Lab                  │
└──────────────────────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
     ┌─────────────────────┐         ┌─────────────────────┐
     │     Rust Engine     │         │      Bun Engine     │
     │        RustX        │         │        BunX         │
     └─────────────────────┘         └─────────────────────┘
               │                               │
     ┌─────────┼─────────┐           ┌─────────┴─────────┐
     │         │         │           │                   │
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     ┌─────────┐
│   API   │ │  Infra  │ │  Skill  │ │   Web   │     │ Mobile  │
│  Forge  │ │  Forge  │ │  Forge  │ │  Forge  │     │  Forge  │
│  APIX   │ │ InfraX  │ │ SkillX  │ │  WebX   │     │ MobileX │
└─────────┘ └─────────┘ └─────────┘ └─────────┘     └─────────┘
     │         │         │           │                   │
     └─────────┴─────────┴───────────┴───────────────────┘
                               │
                    ┌─────────────────────┐
                    │    ToolX Releases   │
                    └─────────────────────┘
```

**Rust foundation:** [RustX](./engine/rust) → [APIX](./platform/api) · [InfraX](./platform/infra) · [SkillX](./platform/skill)  
**Bun foundation:** [BunX](./engine/bun) → [WebX](./platform/web) · [MobileX](./platform/mobile)

Each foundation owns generic capabilities. Each forge owns a specialized concern. SaasX owns product-specific business logic, specs, manifests, and knowledge packs.

**One-way dependencies. One owner per responsibility. No duplicated foundations.**

---

## 🧠 Engineering

**Not seven disconnected projects. One disciplined engineering system.**

Shared capabilities are developed once in the right foundation. Specialized tools provide opinionated workflows without leaking product rules into reusable code. Explicit contracts, cohesive modules, provider boundaries, and independent workspaces preserve clarity at every layer.

The independent ToolX repositories are **one-way release destinations**. SaasX remains the single source of development; extraction is packaging, never a rewrite.

**Maximum reuse. Minimum coupling. No architectural shortcuts.**

---

## ⚡ Performance

**Push the hardware. Challenge the assumptions. Prove every gain.**

Memory-Safe Systems · Async I/O · Efficient Concurrency · SIMD · Zero-Copy · Buffer Reuse · Lean Bundles · Fast Rendering · Resource-Aware Infrastructure

Real workloads—not marketing benchmarks—determine what stays. Throughput, tail latency, CPU, RAM, allocation costs, startup time, app size, and responsiveness are measured where they matter.

**Maximum practical efficiency. Zero performance theater.**

---

## 🛡️ Security

**Enterprise trust starts at the boundaries.**

Memory safety, tenant isolation, least privilege, resource-level authorization, secure transport, financial integrity, and auditable operations are design requirements across the stack.

Security is reinforced through explicit contracts, bounded resources, defensive defaults, dependency auditing, supply-chain controls, and verification suited to each component.

**No cross-tenant shortcuts. No silent trust. No compromise on integrity.**

---

## 🧪 Development

**Build with discipline. Verify with evidence. Release with confidence.**

Each part owns its linting, tests, audits, and benchmarks. Central GitHub Actions governs security and releases, while targeted checks avoid unnecessary builds and wasted resources.

```bash
cd engine/rust && cargo xtask gates
cd engine/bun && bun run gates
```

**Build in SaasX → prove in SaasX → release through ToolX.**

[Contributing](./CONTRIBUTING.md) · [Security](./SECURITY.md) · [Support](./SUPPORT.md) · [Issues](https://github.com/comstrx/saasx/issues)

**Engineering excellence isn't a milestone. It's the standard.**

---

## 📜 License

Copyright © 2026 Abdulrahman Yasser (comstrx).

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
