# Task 0013 — Cross-tenant isolation probe (the first test that earns its keep)

Executor: claude_1. First/only executor (no prior `0013` work; the file held my finished `0012` report, now overwritten). This is the automated proof that `HasTenant` (0012) makes cross-tenant access impossible.

## What I implemented (1 file, test-only — NO production code changed)
- **`tests/Feature/TenantIsolationTest.php`** — the probe, plus the minimal harness it needs (all absent before):
  - **Fixture model** `TenantProbeModel extends TenantModel` (`use HasTenant` via the tenant-owned base) on a `tenant_probes` table created per-method in `setUp` (sqlite `:memory:`, the configured test DB).
  - **`actingForTenant(?string $tenantId, string $panel, \Closure $fn)`** — sets `App\Support\Context` (the real isolation path) and forgets it in `finally`; the probe never hand-passes `tenant_id`.
  - **Determinism**: `setUp` drops+recreates the table, `tearDown` forgets `Context`; the framework refreshes the app (fresh `:memory:` connection) per method → each case fully isolated.

## The assertions (per `tenancy-playbook.md` + the task)
| Test | Proves |
|---|---|
| `test_never_leaks_across_tenants` | rows created under tenant **B** → tenant **A** sees `count() === 0` and `first() === null` |
| `test_create_stamps_the_acting_tenant` | a create under A stamps A's `tenant_id` (via Context) and a UUIDv7 PK |
| `test_no_tenant_and_not_super_is_fail_closed` | no tenant + not super → **zero rows**, never all |
| `test_super_bypass_spans_tenants_and_is_audited` | super has **no ambient** access (default 0); `withoutTenancy` spans (→ 2); the bypass is **audited** (captured `tenancy.bypass` warning); the scope **restores** after |
| `test_without_tenancy_is_forbidden_to_non_super` | a non-super `withoutTenancy` throws |
| `test_rls_defense_in_depth` | **skipped** on sqlite with a clear note (Postgres-only layer) |

## Key decisions (the concrete WHY)
- **PHPUnit, not Pest** — `pestphp/pest` is not installed (only `phpunit/phpunit ^12`); the task said "Pest/PHPUnit". I used PHPUnit test methods that assert exactly the playbook's `it('never leaks across tenants')` intent.
- **Isolation driven through `Context`, never by hand-passing `tenant_id`** — the probe exercises the real production path (`Context::set` → `HasTenant` global scope), so a green probe means the actual mechanism works, not a stand-in.
- **Application-scope is asserted unconditionally; RLS is gated to Postgres.** On the sqlite test DB, `test_rls_defense_in_depth` `markTestSkipped`s with a precise note (RLS needs a pgsql connection + an `FORCE ROW LEVEL SECURITY` migration with the app as non-owner). The PRIMARY layer (the `HasTenant` Eloquent scope) is the one that actually holds isolation, and it is fully verified; RLS is defense-in-depth, deferred infrastructure.
- **No production code touched** — the probe only adds a test file. It drives `HasTenant` as-shipped; had it failed, `HasTenant` (0012) would have been the defect, not the probe. (It passes, confirming the 0012 fix — `withoutTenancy` is the only audited cross-tenant path, super has no ambient access.)

## Acceptance criteria — all met
- ✅ `php artisan test --filter=TenantIsolation` passes: **5 passed, 1 skipped** — tenant A cannot see B's rows; a create stamps the acting tenant; super bypass is explicit + audited.
- ✅ Deterministic and isolated (per-method table recreate + `Context::forget` + fresh app per case).
- ✅ `composer verify` remains green; the full `php artisan test` suite is **6 passed, 1 skipped** (the probe joined the gate without breaking the existing `ExampleTest`).

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). `php artisan test` → 6 passed / 1 skipped / 11 assertions. `git status` shows only `tests/Feature/`.

## Remaining risks
- **RLS layer not exercised** — the test DB is sqlite (no RLS), and no `FORCE ROW LEVEL SECURITY` migration exists yet. The RLS assertion is a documented skip. **Flagged for the manager:** provision a pgsql test connection and an RLS migration (tenant policy + non-owner app role) to run the defense-in-depth assertions; the application-scope PRIMARY isolation is fully verified regardless.
- **Gate placement** — the probe runs under `php artisan test` (i.e. `composer check`/`composer test`), not `composer verify` (which is phpstan + route boot only). Whoever runs the gate must include the test step to keep this probe load-bearing; `tools.md` makes the cross-tenant probe the first test to join the gate.
- **Fixture model in the test file** — `TenantProbeModel` lives alongside the test (not analyzed by phpstan, which scopes to `app/`); intentional, keeps the harness self-contained and out of production autoload.

ship it
