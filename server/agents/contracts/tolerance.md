# contracts/tolerance.md — Pragmatism, what is sacred, security & process (LAW)

> Strongest practices, **but NO over-engineering ("بدون أفورة").** The bar is **"serves its purpose excellently
> in production"** — not 100% sacred, not 100% secure, not a general-purpose library for the whole world. Build
> what this project needs, on demand, exceptionally well. Re-read every turn.

## The pragmatism bar

- **Smallest correct change.** Change what the task needs and nothing more. No drive-by refactors, no cosmetic
  rewrites, no speculative work, no scope creep.
- **Delete before adding. Reuse before introducing.** Reuse what's in the repo/lockfile before a new pattern or
  dependency. Name the conflict if a new dep duplicates an existing capability (`tools.md`).
- **No speculative abstraction, no premature generality.** Abstract the second time you need a thing, not the
  first. Correctness over cleverness.
- **Build it ourselves** — no new external libraries except extreme necessity. Exceptions: crypto and money
  primitives (`tools.md`).
- **Accept correct prior work as-is.** Change another agent's code ONLY for a concrete reason: a real bug, a
  contract violation, a failed gate, a logic/business error, a security risk, or scope drift — and write exactly
  why in your report. **No edit loops, no taste wars.**

## What is sacred (never compromised — these are correctness, not gold-plating)

- **Multi-tenant isolation.** `BelongsToTenant` global scope is **fail-closed** and primary; RLS is
  defense-in-depth; cache keys are per-tenant; jobs carry and restore `tenant_id`; `super` uses an **audited**
  `withoutTenancy()` escape hatch only (`arch.md` §10).
- **Octane safety.** No per-request state in singletons/statics; the role/tenant tag lives in `Context`;
  tenant-scoped state is reset on `RequestTerminated`.
- **Money.** Double-entry ledger, **integer minor units only** (never floats); idempotency keys on financial endpoints.
- **Auth & RBAC.** Hand-rolled, server-authoritative; **never trust client-supplied permissions**.
- **The gate.** Larastan level 8 green with no suppression; `declare(strict_types=1)` everywhere (`tools.md`).
- **The style & naming contracts.** Indistinguishable hand, zero comments, clear names (`style.md`, `naming.md`).

## What is NOT sacred (do not gold-plate)

- 100% test coverage (tests are deferred until v1 ships), 100% defensive paranoia, exhaustive configurability,
  abstractions no current system uses, micro-optimizations without a measurement.
- Porting `vsample` faithfully — it is intent only (`vsample.md`).

## Security & quality non-negotiables (always on)

- **Validation is mandatory on every write** — a FormRequest, validated at the boundary. Untrusted input is hostile.
- **Authorization via real, hand-rolled RBAC** (gates/policies, `has:<permission>` middleware) — never trust the client.
- **Parameterize queries.** Never weaken auth/escaping. SSRF-guard outbound HTTP (`support/net/Ip`).
- **No silent error-swallowing** — no empty `catch`. Surface or handle; never hide.
- **Keyset pagination.** **Bounded, whitelisted search** — never an open query surface.
- **Concurrency:** no shared mutable state without a guard; idempotent jobs; bounded retries with backoff.
- **Never log/print/commit secrets** — `.env`, keys, tokens, credentials are off-limits (`support/log/Redact`).
- **Performance is a feature:** no needless allocation, no N+1 (auto eager-load + the `preventLazyLoading()`
  tripwire), no blocking I/O on hot paths. Measure claims, don't assert them.

## Migrations

- Reversible, additive-first. **No destructive drop in the same release as code that still reads the column.**
  Central migrations, UUIDv7, `tenant_id`, composite uniques (`arch.md` §9).

## Process & reporting (every task / agentx turn)

- **Do not execute build work unless asked; when planning, plan.** Confirm before any outward or irreversible
  action (push, deploy, migrate on real data, publish, prune, history rewrite, killing a service). Propose instead.
- **Uncertainty protocol:** state the ambiguity in one line, take the convention-consistent path, flag it in
  your report. Never silently invent architecture; never add a dependency that duplicates an existing capability
  without naming the conflict.
- **Report** (`reports/{requires|tasks}/{agent}.md`, overwrite): gate result (command, exit code, error count);
  what changed and the concrete WHY; what was kept/changed/rejected from prior work and why; deviations from the
  contracts and why (or "none"); anything left unverified (e.g. needs a running service).
- **Final line `ship it`** (exact) only when the work is complete, correct, contract-compliant, and the gate
  passes — this is the signal agentx reads to advance. If you changed nothing, the whole report is one line: `ship it`.
