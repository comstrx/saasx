# Task 0012 — `HasTenant` DNA (the fail-closed tenant spine)

Executor: claude_1. First/only executor (no prior `0012` work; the file held my finished `0011` report, now overwritten). `app/Traits/Dna/` was empty (first DNA trait).

## What I implemented (1 new trait + 2 model files)
- **`app/Traits/Dna/HasTenant.php`** — the multi-tenant isolation spine:
  - `bootHasTenant()` — a global scope `tenant` that constrains every query to `<table>.tenant_id = Context::tenantId() ?? SENTINEL`, and a `creating` hook stamping `tenant_id ??= Context::tenantId()`.
  - `withoutTenancy(\Closure $fn)` — the ONLY bypass: super-only (throws otherwise), `Log::warning('tenancy.bypass', …)` audited, runs `$fn` with the scope off, **restores in `finally`**.
  - `scopeForTenant(Builder, ?string)` — explicit single-tenant targeting (super writes to a validated body `tenant_id`), fail-closed to SENTINEL on null.
- **`app/Models/TenantModel.php`** — `abstract … extends BaseModel { use HasTenant; }`, the base for tenant-owned models (and HasTenant's gate consumer).
- **`app/Models/BaseModel.php`** (edited, 0006) — added the deferred UUIDv7 PK setup: `$keyType='string'`, `$incrementing=false`, and a `booted()` `creating` hook generating a UUIDv7 id when empty.

## Key decisions (the concrete WHY)
- **Scope is ALWAYS on — no ambient super skip.** The tenancy-playbook skill shows `if (Context::isSuper()) return;` in the scope, but the task invariant is explicit: "super … bypass is `withoutTenancy()` only — **never an ambient default**." So the scope does NOT check `isSuper`; super sees **zero rows by default** and must call the audited `withoutTenancy()` to read cross-tenant. Verified: `super` default count = 0, not all. (The only `isSuper` in the file is `withoutTenancy`'s guard.)
- **Fail-closed sentinel.** No tenant in `Context` and not bypassed → `tenant_id = '00000000-…-000000000000'` (a nil UUID no row holds) → zero rows. "No tenant" means "no data," never "all data." Verified: `guest` count = 0.
- **The bypass is a transient static guard, not tenant state.** `withoutTenancy` flips a per-using-class `static bool $tenancyBypassed` and restores the previous value in `finally` (re-entrant). This honors the invariant ("read tenant ONLY from `Context`") because the **tenant identity is always read from `Context::tenantId()`** — the flag only decides whether to *apply* the scope. It is Octane-safe (always reset in `finally`; requests are sequential per worker), and unlike a `Context` flag it does **not** propagate into queued jobs (statics aren't dehydrated) — avoiding a bypass leaking into a job dispatched inside `$fn`. This mirrors Laravel's own `withoutEvents`/`withoutTimestamps` pattern. Verified: scope restored after bypass (super back to 0), audit log captured `tenancy.bypass`, non-super `withoutTenancy` throws.
- **`tenant_id` stamping via `getAttribute`/`setAttribute`** (not `$model->tenant_id`) — gate-clean (no undefined-magic-property error on base `Model`), only fills when absent so a super write's body `tenant_id` is preserved.
- **`TenantModel` as the tenant-model base** — HasTenant needed a consumer for analysis (same as `BaseModel` for `HasBaseModel`); the natural one is the base every tenant-owned model extends. Platform tables (`tenants`, the permissions catalog) extend `BaseModel` directly. **Flag for 0015.**
- **UUIDv7 PK setup in `BaseModel`** (universal, covers tenant + platform models), not in `HasTenant` (which would miss non-tenant models) — completing the dependency I flagged in the 0006 report. Nothing native; only `App\Support\{Context,Log,Database}` + Eloquent.

## Acceptance criteria — all met (sqlite probe)
- ✅ `Thing extends TenantModel` (zero per-model tenant code) is **auto-scoped on read** (A sees only its 1 row, cannot `find` B's row; B sees its 2) and **auto-stamped on create** (`tenant_id` = current tenant, `id` = UUIDv7).
- ✅ **No tenant + not super → zero rows** (`guest` → 0, never 3); **super has no ambient cross-tenant** (default → 0).
- ✅ `withoutTenancy` bypasses **only for super** (count → 3), **logs** the bypass (captured), restores the scope after, and **throws** for non-super; `scopeForTenant(B)` returns B's rows, `forTenant(null)` → 0.
- ✅ `composer verify` exits 0.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Traits/` (HasTenant) and `app/Models/` (BaseModel edit + TenantModel).

## Remaining risks
- **The `finally` reset is load-bearing** — it is what keeps the static bypass flag from bleeding across requests/jobs. Any refactor that removes it reintroduces an Octane leak. Documented and verified.
- **Platform/nullable-`tenant_id` rows** (super `users`, permissions catalog, global settings) interact with the fail-closed scope: a `super`-owned row has `tenant_id` NULL, and a super reading `users` via the scope sees nothing unless `withoutTenancy`. The invariant requires the consuming model's config (0015) to handle this deliberately — NOT by weakening this scope. Flagged for 0015.
- **`BaseModel` UUIDv7 setup affects every model** — correct for this UUIDv7-everywhere archetype, but a model overriding `booted()` must call `parent::booted()` to keep id-gen (standard Laravel caveat); 0015 models that use the trait engine and don't override `booted()` inherit it cleanly.
- **RLS is defense-in-depth, separate** — HasTenant is the PRIMARY application isolation (verified on sqlite); Postgres RLS (transaction-local GUC, non-owner role) is exercised by the 0013 probe, which this task precedes.

ship it
