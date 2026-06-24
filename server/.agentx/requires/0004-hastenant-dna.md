# HasTenant DNA — the fail-closed tenant spine

Build the `HasTenant` DNA trait: the multi-tenant isolation spine that every tenant-owned model gains by
`use`-ing it. This is the #1 correctness concern of the archetype — a leak here is a breach.

## What is required
- A fail-closed tenant global scope that auto-constrains every query to the current tenant, plus auto-fill of
  `tenant_id` on create — both reading the active tenant from `Context`.
- **Fail-closed semantics:** when there is no tenant in `Context` and the request is not `super`, the scope
  resolves to match nothing (or throws) — never returns unscoped rows. "No tenant" means "no data", never
  "all data".
- `super` is the only cross-tenant role; its bypass is an explicit, **audited** `withoutTenancy()` escape hatch —
  never an ambient default, never left on.
- Pairs with Postgres RLS as defense-in-depth (transaction-local GUC, non-owner role, `FORCE ROW LEVEL
  SECURITY`); the application scope remains the primary isolation.

## Constraints
Octane-safe — the tenant tag lives only in `Context`, never a static/singleton. Built on the Support DSL.
UUIDv7 `string` ids. Exact hand-style, `declare(strict_types=1)`, zero comments. Tour `vsample/app/Traits/*` for
intent first (noting vsample is single-context — our tenancy model is ours), then build stronger — never copied.

## Acceptance
- `HasTenant` enforces fail-closed isolation end to end; cross-tenant reads and writes are impossible without the
  audited escape hatch.
- A cross-tenant probe proves no leak for a model using the trait.
- Gate green.
