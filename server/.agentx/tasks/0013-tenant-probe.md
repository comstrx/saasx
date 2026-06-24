# 0013 — Cross-tenant isolation probe (the first test that earns its keep)

- Requirement: `0004-hastenant-dna.md` + `0001-compliance-floor.md` ("ship a cross-tenant probe proving no leak").
- Deliverable type: lib
- Order: 0012 (`HasTenant`).

## Responsibility
Prove, with an automated test, that `HasTenant` makes cross-tenant reads/writes impossible — the single highest-value test in the foundation.

## Path
- `tests/Feature/TenantIsolationTest.php` — the probe.
- Minimal harness it needs (create only what is absent): a fixture model `use HasTenant;` on a migrated test table; an `actingForTenant($tenantId, \Closure $fn)` helper that sets/forgets `App\Support\Context`; Pest/PHPUnit DB config for the test connection.

## Public interface
- A test `it('never leaks across tenants', ...)` per `tenancy-playbook.md`: create rows under tenant B, assert tenant A sees `count() === 0`; assert a create under A stamps A's `tenant_id`; assert `super` + `withoutTenancy` can span tenants and that the bypass is audited.

## Invariants
- The probe drives isolation through `App\Support\Context` (the real path), not by hand-passing `tenant_id`.
- Application-scope isolation is asserted on the test DB (always-on); the RLS defense-in-depth layer is asserted only where the connection is Postgres (policy/`FORCE ROW LEVEL SECURITY` present) — skipped with a clear note on non-pgsql.
- No production code changed to satisfy the test; if the probe fails, `HasTenant` (0012) is the defect, not the probe.

## Acceptance criteria
- `php artisan test --filter=TenantIsolation` passes: tenant A cannot see tenant B's rows; a create stamps the acting tenant; super bypass is explicit + audited.
- The probe is deterministic and isolated (transactions/refresh between cases).
- `composer verify` remains green (the probe is the first test to join the gate, per `tools.md`).

## Deliverable type
lib

## Order
After 0012.

## Open risk
Requires a configured test DB. RLS assertions need Postgres; on sqlite the RLS portion is skipped (documented), the application-scope probe still runs. Flagged for the manager: provision a pgsql test connection to exercise the RLS layer.
