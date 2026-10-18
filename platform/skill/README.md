# ✨ Skill Forge

<div align="center">
  <br/>
  <img height="150" src="https://github.com/user-attachments/assets/e5defe48-05e4-441b-932e-3aa08d9cfcbd"/>
  <br/>
  <br/>
</div>

[![Rust](https://img.shields.io/badge/Rust-Engineering_Intelligence-DEA584?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![CI](https://github.com/comstrx/saasx/actions/workflows/skill.yml/badge.svg?branch=main)](https://github.com/comstrx/saasx/actions/workflows/skill.yml)
[![Release](https://img.shields.io/github/v/release/comstrx/skillx?sort=semver)](https://github.com/comstrx/skillx/releases/latest)
[![License](https://img.shields.io/badge/License-Apache_2.0-007EC6)](https://www.apache.org/licenses/LICENSE-2.0)

> **Knowledge with Evidence. Decisions with Context. Engineering with Precision.**

A Rust-powered engineering knowledge system designed to give **AI agents and developer tools** the right architecture, rules, and technical evidence at the moment they need it—through one coherent MCP interface.

**Stop repeating instructions. Start delivering engineering intelligence.**

---

## 🎯 Overview

**Not another AI agent. The knowledge that makes agents better.**

Powerful AI models still need precise context: which rules apply, which versions matter, what decisions were made, and where the evidence lives. Scattered notes and oversized prompts make that context easy to lose or misinterpret.

Skill Forge transforms engineering knowledge into **structured, searchable, context-aware guidance**, connecting rules to sources, conditions, exceptions, and the decisions they support.

The mission: **give any capable agent the knowledge it needs without surrendering architectural control.**

---

## 📦 Download

**The latest release — checksummed, attested, one command per platform.**

`skill` answers `skill hello` and `skill --version`.

Linux and macOS:

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/comstrx/saasx/releases/latest/download/skill-installer.sh | sh
```

Windows (PowerShell):

```powershell
& ([scriptblock]::Create((irm https://github.com/comstrx/saasx/releases/latest/download/skill-installer.ps1)))
```

From source:

```bash
git clone https://github.com/comstrx/saasx.git
cd saasx/platform/skill
cargo run --release -- hello
```

Every asset carries a `.sha256` sidecar and build provenance: `gh attestation verify <asset> --owner comstrx`.

---

## 🧩 Capabilities

**A continuously evolving knowledge foundation for serious software engineering.**

**Knowledge Graphs & Relationships** · **MCP Tools, Resources & Prompts** · **Architecture & Design Rules** · **Languages & Frameworks** · **Backend, Web & Mobile** · **Infrastructure & Operations** · **Security, Testing & Performance** · **Business & Domain Knowledge** · **Search, Retrieval & Ranking** · **Sources, Versions & Conflict Resolution**

From a single language rule to a complete enterprise architecture, knowledge stays connected to the context in which it is valid.

**One knowledge model. Every engineering discipline. Clearer decisions.**

---

## 🏗️ Architecture

**Knowledge stays structured. Context stays relevant. Agents stay independent.**

```text
          AI Agents · Developer Tools
                      │
                 MCP Interface
                      │
           Query · Retrieval · Ranking
                      │
          Graph · Rules · Scope · Version
                      │
             Source-Linked Knowledge
                      │
         General Packs · Project Packs
```

**Single Responsibility** · **Explicit Sources** · **Scoped Rules** · **Version Awareness** · **Independent Agents**

The runtime owns the graph, retrieval, reasoning context, and delivery contracts. Knowledge packs own their content. Project-specific decisions remain separate from reusable engineering knowledge.

**No agent orchestration disguised as knowledge. No duplicated rules. No project logic buried in the runtime.**

---

## 🧠 Engineering

**Not a pile of Markdown. An engineering knowledge system with boundaries.**

Every knowledge unit is designed to carry its **source, scope, version, applicability, exceptions, confidence, and relationships**. Conflicting guidance must be explained; superseded decisions must not silently compete with newer ones.

Knowledge is recorded only when it can change a decision. Retrieval favors the smallest sufficient context rather than dumping whole documents into an agent's window.

The runtime remains generic, composable, and independent of any single model or product.

**Maximum relevance. Minimum noise. No invented authority.**

---

## ⚡ Performance

**Spend tokens on decisions—not repetition.**

Selective Retrieval · Context Ranking · Bounded Graph Traversal · Compact Knowledge Units · On-Demand Loading · Efficient Indexing · Targeted Caching · Minimal Runtime Overhead

Efficiency is measured through retrieval latency, token consumption, memory usage, relevance, and correctness under changing knowledge—not inflated synthetic scores.

The objective is **the right evidence, in the smallest useful context, delivered when it matters.**

**Less context waste. More engineering signal.**

---

## 🛡️ Security

**Untrusted content is evidence to inspect—not authority to obey.**

Source provenance, scope boundaries, version checks, access controls, and sensitive-data handling shape the knowledge contracts. Project-private context must remain isolated; credentials must never be stored as reusable knowledge.

Agent instructions, retrieved documents, and external inputs are kept conceptually distinct, with explicit handling for stale, conflicting, or unverifiable claims.

**No secret leakage. No silent rule overrides. No blind trust in retrieved text.**

---

## 🧪 Development

**Build with discipline. Verify with evidence. Evolve with confidence.**

A focused Rust runtime with strict linting, contract tests, retrieval-quality checks, source validation, and targeted benchmarks. Every new capability must improve real engineering decisions without introducing unnecessary complexity.

```bash
cargo clippy --workspace --all-targets --all-features --locked -- -D warnings
cargo test --workspace --all-features --locked
```

**Engineering excellence isn't a milestone. It's the standard.**

---

## 📜 License

Copyright © 2026 Abdulrahman Yasser (comstrx).

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
