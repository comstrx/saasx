# ✨ Desk Forge

<div align="center">
  <br/>
  <img height="150" src="https://github.com/user-attachments/assets/28d09d40-f669-492e-a07a-e4b87322a7bd"/>
  <br/>
  <br/>
</div>

[![React + Tauri](https://img.shields.io/badge/React_%2B_Tauri-Native_Desktop-24C8D8?logo=react&logoColor=white)](https://tauri.app)
[![CI](https://github.com/comstrx/saasx/actions/workflows/desk.yml/badge.svg?branch=main)](https://github.com/comstrx/saasx/actions/workflows/desk.yml)
[![Release](https://img.shields.io/github/v/release/comstrx/deskx?sort=semver)](https://github.com/comstrx/deskx/releases/latest)
[![License](https://img.shields.io/badge/License-Apache_2.0-007EC6)](https://www.apache.org/licenses/LICENSE-2.0)

> **One Engine. Infinite Desktops. Native Without Compromise.**

A spec-driven desktop engineering system uniting **React, Bun, Tauri, and Rust** to create distinct, high-performance applications for Windows, macOS, and Linux from one reusable foundation.

**Build the engine once. Shape every experience. Ship it natively.**

---

## 🎯 Overview

**One codebase. Many identities. True desktop experiences.**

Desktop development shouldn't mean duplicating application shells, scattering native integrations, or rebuilding the same interface for every product.

Desk Forge brings desktop applications under **one coherent engineering model**: define the product through specifications, compose its experience from reusable capabilities, and connect to the operating system through explicit native boundaries.

The ambition: **make independently branded desktop applications as deliberate to build as they are natural to use.**

---

## 🧩 Capabilities

**A continuously evolving foundation for modern desktop applications.**

**Spec-Driven Application Builds** · **Reusable React Experiences** · **Multi-Window Workflows** · **Typed Native IPC** · **Filesystem & Process Integration** · **System Tray & Notifications** · **Offline State & Local Storage** · **Deep Links & OS Integration** · **Cross-Platform Packaging & Updates** · **Testing, Profiling & Observability**

Each capability strengthens a shared engine while allowing every application to retain its own identity, features, permissions, and release lifecycle.

**One foundation. Every application. No duplicated engines.**

---

## 🏗️ Architecture

**Specifications above. Two foundations beneath. Clear boundaries throughout.**

```
                     Application Specs
           Identity · Screens · Features · Policy
                            │
                Validate · Compile · Build
                            │
                     Desk Forge Core
                  ┌─────────┴─────────┐
                  │                   │
             React · BunX        Tauri · RustX
             UI · State          IPC · Native OS
                  │                   │
                  └─────────┬─────────┘
                            │
                Windows · macOS · Linux
```

**Single Responsibility** · **Spec Isolation** · **Typed Boundaries** · **Native Portability** · **One-Way Dependencies**

Specifications own application identity and product-specific decisions. React and BunX own the interface; Tauri and RustX own privileged native capabilities. Bun powers development and builds, while the packaged interface runs inside the operating system's WebView.

**No hardcoded products. No tangled runtimes. No duplicated foundations.**

---

## 🧠 Engineering

**A desktop application is more than a web page inside a window.**

Each layer has a clear owner: specifications describe the application, the renderer owns its experience, and the native runtime owns operating-system interactions. Typed contracts, explicit capabilities, isolated application variants, and small composable modules keep the system adaptable without sacrificing clarity.

Existing platform APIs and mature tooling remain the first choice. New abstractions must earn their place by removing real duplication, strengthening correctness, or simplifying cross-platform delivery.

**Reuse what is universal. Isolate what is native. Customize what is essential.**

---

## ⚡ Performance

**Launch quickly. Render smoothly. Remain lightweight.**

Lean Bundles · Lazy Feature Loading · Efficient Rendering · Bounded IPC · Minimal Native Work · Responsive Windows · Controlled Background Tasks · Measured Resource Usage

Performance is measured across real applications and operating systems: cold-start time, memory footprint, interface responsiveness, IPC latency, package size, and build cost. Optimization follows evidence rather than framework folklore.

**Every millisecond has a cost. Every dependency needs a reason.**

---

## 🛡️ Security

**The interface is untrusted. Native privileges are explicit.**

Least-privilege Tauri capabilities, scoped commands and plugins, validated IPC payloads, safe external navigation, secure local storage, and strong content policies define the trust boundary. Application specifications cannot silently grant unrestricted operating-system access.

Signing, verified updates, dependency review, and platform-specific security checks extend that discipline into distribution.

**No unrestricted native access. No implicit permissions. No hidden trust.**

---

## 🧪 Development

**Engineer deliberately. Test across boundaries. Release with evidence.**

The React/Bun surface and the Rust/Tauri runtime are verified independently, then exercised together through focused integration and cross-platform tests. Benchmarks measure real regressions rather than producing decorative numbers.

```bash
bun install --frozen-lockfile
bun run check
bun run typecheck
bun test
bun tauri dev
bun tauri build
cargo test --manifest-path src-tauri/Cargo.toml --locked
```

**One engineering standard. Every platform. Every application.**

---

## 📜 License

Copyright © 2026 Abdulrahman Yasser (comstrx).

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
