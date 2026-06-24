# Task 0017 — RBAC DNA (`HasRoles` + `HasPermissions`) — revision after manager review

`ACTION: revise` resolved. Both blocking defects fixed; the KEEP-AS-IS surface (cascade, lock
model, `force` super-guard, Context-only authority, the public method set) was left untouched as
instructed — no churn.

## DEFECT 1 (fixed) — tenant authoring a `global` setting → cross-tenant escalation
`grant`/`revoke` ran `write(..., Authority::Tenant, ...)` with no restriction on `$scope`. `$scope`
is effectively client-supplied (tenant-admin UI → controller → `grant`), so the engine — not a
downstream FormRequest — must fail closed.

Fix (`app/Traits/Dna/HasPermissions.php`):
- `write()`, in the `Authority::Tenant` branch, now rejects any `$scope` not in
  `{tenant, entity, item}` **before** the lock check and before any DB write:
  `if ( ! self::tenantWritableScope($scope) ) throw new \RuntimeException('A tenant may only write tenant, entity, or item scopes: ' . $scope);`
- New `tenantWritableScope(string): bool` — `match` allow-list; `global` and any unknown scope →
  `false` → throw. `force` (super, `Authority::Super`) is unaffected and keeps every scope.

## DEFECT 2 (fixed) — super-write cache bust didn't reach the target tenant's readers (bound 0016 criterion)
The resolver cached via `App\Support\Cache`, which Context-prefixes keys (`t:<Context-tenant>:`). A
tenant resolving their own verdict cached under `t:X:…` tagged `t:X:tag:rbac:*`; a super
`force`/`forgetAll` runs in super context and busts `t:platform:tag:rbac:*`, MISSING `t:X:` → stale
up to 600s. If super revokes/locks-off, tenant X kept the cached ALLOW (fail-open). A `global` bust
could never reach all tenants from one Context-prefixed context.

Fix — give the resolver a Context-INDEPENDENT (shared) cache namespace keyed only by the explicit
target tenant already embedded in the key:
- `app/Support/cache/Key.php`: added `shared(string): string` (`'s:' . $key`) and
  `sharedTag(string): string` (`'s:tag:' . $tag`) — fixed `s:` namespace, no `Scope::prefix()`.
- `app/Support/cache/index.php`: added `Cache::rememberShared(key, ttl, fn, tags)` and
  `Cache::resetShared(tag)` — mirror `set`/`Tag::reset` (same `Entry`, same `Driver` ops) but on
  shared keys, never Context-prefixed. Existing Context-scoped surface untouched.
- `app/Traits/Dna/Permissions/Resolver.php`: all five cache calls switched
  `remember`→`rememberShared`, `reset`→`resetShared` (`permission`, `catalog`, `settings`, `forget`,
  `forgetAll`). Keys already embed the explicit tenant (`rbac:set:<tenant>:<pid>`), tags
  `rbac:<tenant>` + `rbac:all`. Now resolution (Context=X) and busting (Context=super) hit the SAME
  entry, and `forgetAll()` (every entry is tagged `rbac:all`) reaches every tenant.

## Tests (`tests/Feature/RbacDnaTest.php`) — both manager-mandated cases added
- `test_a_tenant_cannot_escalate_through_a_global_or_unknown_scope_and_neighbours_stay_isolated` —
  tenant `grant(global)` and `grant(workspace)` both refused; asserts **zero** rows escaped the
  guard; a legitimate `grant(tenant)` lands; a second tenant (`neighbour()`) resolves the same key →
  deny (isolation).
- `test_a_super_force_busts_the_target_tenant_cache_across_contexts` — tenant grants+reads (caches
  ALLOW under the shared key), super (super context) `force(global,false,true)`, then back in the
  tenant's context `setting()` flips to `allow=false, locked=true, source=super:global`
  immediately — no TTL wait. Fails against the old Context-prefixed cache; passes now.

## KEEP AS-IS — untouched per review
Cascade (0016), the `write` super-lock check (`locked && source startsWith 'super'` → refuse),
`force` requires `Context::isSuper()`, authority/identity from `Context` only, `HasRoles`,
item-level governance via `permissionTarget`, the `can/setting/settings/grant/revoke/force/hasOrFail`
surface.

## Carry-forward (acknowledged, not this round)
- `can(string,?Model)` vs `Authorizable::can($abilities,$arguments)` collision lands when Identity
  adds the auth contracts — reconcile then (no collision today; User isn't Authenticatable).
- `matrix()`'s unused `$scope` — clarify/remove when the admin settings grid is defined.
- Active-role resolution (single role, not a multi-role union) — intended; flag for the panel model.

## Gate
- `composer verify` → exit 0 (config:clear ✓, `composer validate --strict` ✓, phpstan level 8 over
  170 files: **No errors** ✓, route:cache boot/clear ✓).
- `php artisan test` → **21 passed, 1 skipped** (the skip is the Postgres-only RLS
  defense-in-depth test, expected on the sqlite test driver). RBAC suite (DNA+resolver+schema): 15
  passed. Shared-cache change introduced no regression across the full suite.

ship it
