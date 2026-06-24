# Task 0012 — `HasTenant` DNA (the fail-closed tenant spine) — REVISED per manager review

Executor: claude_1. Manager returned the prior round (ACTION: revise) with ONE blocking defect. Resolved exactly that, left everything the manager marked KEEP untouched (no churn).

## Manager defect — RESOLVED
**`scopeForTenant` was an unguarded, unaudited cross-tenant escape hatch.** As a public Eloquent scope, `Model::forTenant($anyTenantId)->get()` stripped the global tenant scope and returned ANOTHER tenant's rows to ANY caller (a non-super controller, a job, a careless query) — no `Context::isSuper()` check, no audit. It had the same broad public surface as `withoutTenancy()` but, unlike it, did not self-guard; that asymmetry was a latent cross-tenant leak in the archetype's #1 isolation mechanism, and the 0013 probe (which tests the global scope, not `forTenant` misuse) would not have caught it. The manager is right — this was a genuine security hole.

**Fix applied: removed `scopeForTenant` entirely** (the manager's preferred option). The system now has exactly ONE cross-tenant data path — `withoutTenancy()` — which is super-guarded AND audited. The super flow performs targeted cross-tenant access **inside** that single bypass:
`withoutTenancy(fn () => Model::query()->where('tenant_id', $validatedTenantId)->…)`. Super CREATEs need no special scope: they set `tenant_id` from the validated body and the `creating` hook's null-check preserves the non-null value. Verified (probe): `forTenant` is no longer callable (`BadMethodCallException`), `withoutTenancy(where tenant_id=B)` returns only B's rows, and the scope restores after.

This overrode the (frozen) task interface line that listed `scopeForTenant` — the interface itself declared the insecure primitive; the manager, as the contract authority, directed its removal. No downstream code referenced it (grep-clean), so removal is non-breaking.

## KEEP AS-IS — confirmed correct, NOT touched (per manager directive)
- **Global scope with no ambient `isSuper()` skip** (super defaults to zero rows) — the contract-mandated deviation from the tenancy-playbook skill. Unchanged.
- **`static $tenancyBypassed` flipped + restored in `finally`** — the static-over-`Context` choice (mirrors `withoutEvents`, avoids the bypass dehydrating into a queued job; `finally` reset is load-bearing). Unchanged.
- **`withoutTenancy`** (super-guard + `Log::warning` audit + finally-restore), the **null-preserving auto-stamp** via `getAttribute`/`setAttribute`, and the **UUIDv7 PK setup in `BaseModel`** (`keyType`/`incrementing` + `booted()` id-gen). Unchanged.
- **`TenantModel`** (the tenant-owned base, HasTenant's gate consumer). Unchanged.

## Files
- `app/Traits/Dna/HasTenant.php` — removed `scopeForTenant`; the rest unchanged. `Builder` (scope closure) and `Model` (creating hook) imports still used; no orphans.
- `app/Models/TenantModel.php`, `app/Models/BaseModel.php` (the 0006 UUIDv7 PK edit) — unchanged from the prior round.

## Acceptance criteria — all met (sqlite probe, re-run)
- ✅ `Thing extends TenantModel` (zero per-model tenant code) auto-scoped on read (A sees its 1 row; can't reach B) and auto-stamped on create (`tenant_id` + UUIDv7 `id`).
- ✅ No tenant + not super → **0 rows** (guest → 0); super has **no ambient** cross-tenant (default → 0).
- ✅ `withoutTenancy` bypasses **only for super** (→ 3), **logs** the bypass (captured), restores after, **throws** for non-super; super targets one tenant **inside** the bypass (`where tenant_id=B` → 2).
- ✅ **No cross-tenant data path lacks the super-check AND the audit log** — the unguarded `forTenant` is gone.
- ✅ `composer verify` exits 0.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Traits/` + `app/Models/`.

## Remaining risks (carry-forward, per manager)
- **Platform/nullable-`tenant_id` rows** (super `users`, permissions catalog, global settings) handled by the consuming model's config at 0015 — never by weakening this scope.
- **`TenantModel`** is the tenant-owned base; platform tables extend `BaseModel` directly — confirm at 0015.
- **The `finally` reset of the bypass flag is load-bearing** — any refactor removing it reintroduces an Octane bleed.
- RLS is defense-in-depth (separate, Postgres); HasTenant is the verified PRIMARY application isolation. The 0013 probe (which this precedes) formalizes the cross-tenant test.

ship it
