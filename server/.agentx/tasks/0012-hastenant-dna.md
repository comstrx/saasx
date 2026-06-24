# 0012 — `HasTenant` DNA (the fail-closed tenant spine)

- Requirement: `0004-hastenant-dna.md` (clears `0001-compliance-floor.md`: tenant isolation primary + fail-closed).
- Deliverable type: lib
- Order: 0001 (`App\Support\Context`, `App\Support\Database\Rls`).

## Responsibility
The multi-tenant isolation spine: a DNA trait that auto-constrains every query to the current tenant and auto-fills `tenant_id` on create, fail-closed, with one audited cross-tenant escape hatch.

## Path
- `app/Traits/Dna/HasTenant.php`.

## Public interface
- `bootHasTenant(): void` — adds the global scope `tenant` (`where <table>.tenant_id = Context::tenantId()`) and a `creating` hook that fills `tenant_id ??= Context::tenantId()`.
- `withoutTenancy(\Closure $fn): mixed` — the ONLY bypass; runs `$fn` with the scope removed, **audited** (logs actor/tenant via `App\Support\Log`); usable only when `Context::isSuper()`.
- `scopeForTenant(Builder $q, ?string $tenantId): Builder` — explicit single-tenant targeting (super writes targeting a validated body `tenant_id`).

## Invariants
- **Fail-closed:** no tenant in `Context` and not `super` → the scope matches nothing (a sentinel UUID / no-rows), NEVER unscoped rows. "No tenant" means "no data".
- `super` (`Context::isSuper()`) is the only cross-tenant role; bypass is `withoutTenancy()` only — never an ambient default, never left on; every use is audited.
- Reads tenant ONLY from `App\Support\Context` (Octane-safe); never a static/singleton/global helper.
- Pairs with Postgres RLS (defense-in-depth) but is itself the PRIMARY isolation; the app never connects as table owner.
- Platform/nullable-`tenant_id` rows (catalog/global/super) are handled deliberately by the consuming model's config, not by weakening the scope.
- `declare(strict_types=1)`; exact hand-style; zero comments; ids UUIDv7 `string`.

## Acceptance criteria
- A model `use HasTenant;` is auto-scoped on read and auto-stamped on create with no per-model code.
- With no tenant in `Context` and not super, queries return zero rows (never all rows).
- `withoutTenancy` only bypasses for super and logs the bypass; the cross-tenant probe (task 0013) passes.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0001. Precedes 0013 (probe), 0015 (RBAC tenant-scoped models), 0019 (engagements).
