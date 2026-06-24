# Universal compliance floor

The standing acceptance contract every other requirement in this backlog must satisfy. This is NOT a standalone
deliverable and earns no tasks of its own — it is the lens that judges all others. Any requirement is "done"
only when it clears this floor in addition to its own acceptance.

## Every feature must
- Be exposed only through the versioned `/v1` API — no new server-rendered surface. Inputs validated in a Form
  Request; outputs shaped through an API Resource with an explicit shape, never a raw model; one uniform
  success/fail envelope.
- Enforce tenant isolation end to end — fail-closed `HasTenant` scope (primary) plus Postgres RLS
  (defense-in-depth) — and ship a cross-tenant probe proving no leak, for every tenant-scoped table or endpoint.
- Authorize server-side via the hand-rolled RBAC (`has:<permission>`) — never trust a client-supplied role or
  permission.
- Arrive with schema via a reversible, additive-first migration: UUIDv7 keys, `tenant_id`, composite uniques
  leading with `tenant_id`.
- Live at the right layer: business logic as a thin pipeline over the Support DSL and the trait engine, with no
  native PHP/Laravel inlined into a high layer.
- Leave the gate green — Larastan at max (level 8) + `declare(strict_types=1)` everywhere, no suppression — with
  the cross-tenant probe and any tests that have joined the gate passing.

## Non-functional floor
- List endpoints are keyset-paginated and free of N+1.
- Money is integer minor units on a double-entry ledger — never a float.
- Heavy or external work is queued, idempotent, tenant-stamped, and retry-safe.
- No per-request state in statics or singletons (Octane-safe); the role/tenant/user tag lives in `Context`,
  reset on `RequestTerminated`.
- No secret reaches code, image, or logs.

## Intent
Make the floor explicit and first, so every requirement that follows inherits it as binding acceptance — the
project owner's floor on conflict yields to a project requirement only where one is more specific, never weaker.
