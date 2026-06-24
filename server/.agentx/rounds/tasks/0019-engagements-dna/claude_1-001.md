# Task 0018 — RBAC edge middleware (`Has` + `Role`)

Fresh build (no prior executor report for 0018; the `tasks-review.md` on disk was the 0017 review,
already resolved). The two thin edge gates over the 0017 DNA, both `route:cache`-safe and
fail-closed.

## Implemented
- `app/Http/Middleware/Has.php` — the `has:` permission gate. Resolves the actor, then
  `$actor->can($permission)`; 403 on deny via `Response::error('permission', …, 403)`.
  - **Key derivation**: `permission($key, $method)` — if `$key` contains `_` it is an explicit key
    used verbatim (`view_products`, `allow_statistics`, `add_product_variants`); a bare resource
    token (no `_`, e.g. `products`) derives `<verb>_<resource>` from the HTTP method
    (`GET/HEAD→view, POST→add, PUT/PATCH→edit, DELETE→delete`). Unknown method → `null` → deny.
    So one alias `has:products` on a resource group gates `view_/add_/edit_/delete_products` by
    method; cross-cutting keys are passed explicitly. (Convention: a single-token cross-cutting key
    must carry an `_`, e.g. `allow_export`, to skip derivation — every contract example already does.)
- `app/Http/Middleware/Role.php` — the `role:` membership gate. `role:admin` /
  `role:admin,vendor` → variadic `...$roles`; `$actor->hasRole(array_values($roles))` (any held
  role passes); 403 on miss via `Response::error('role', …, 403)`.
- `bootstrap/app.php` — registered string aliases `'has'`/`'role'` (no closures → `route:cache`-safe).
- `tests/Feature/RbacMiddlewareTest.php` — 6 cases (below).

## Key decisions / WHY
- **Actor load = `User::query()->withoutGlobalScope('tenant')->find(Context::userId())`.** The id is
  server-set in `Context` (never the request body); we fetch that one already-authenticated principal
  by PK — no enumeration, no client-steerable input. The tenant scope MUST be bypassed because it is
  fail-closed: in a super/platform context `Context::tenantId()` is `null`, so the scope filters
  `tenant_id = <nil-UUID sentinel>` and a super actor (null `tenant_id`) would never load. This is
  loading the authenticated subject exactly as the future Identity layer would — not a cross-tenant
  escape hatch (it cannot be driven by request input). Null actor → fail-closed 403.
- **Thin delegates, no parallel mechanism.** `Has`→`can()`, `Role`→`hasRole()`. The gate does **not**
  special-case super and does **not** consult `locked` (per the invariants: `locked` governs
  editability, not access). Super authority is expressed through the resolver (super `force` / global
  grants from 0017), the single source of truth — putting a super-bypass in the edge would be the
  "parallel authorization mechanism" the requirement forbids. See risk below.
- **Inlined `actor()` in both files** rather than a shared trait — 2 trivial lines; a `Concerns\`
  trait for that is over-factoring and would exceed the task's declared 2-file surface. Kept the
  smallest correct diff.
- **`array_values($roles)`** at the `hasRole` call — a PHP variadic types as
  `array<int<0,max>,string>`, which phpstan does not prove is a `list`, so it is rejected by
  `hasRole(list<string>|string)`. `array_values` is an honest variadic→`list<string>` normalization
  (not a silencing cast); `hasRole`'s precise `list` contract (0017) is left intact.

## Kept / removed
- Kept the entire 0017 DNA and 0016 resolver untouched — the gates are pure declarations over them.
- Removed nothing; no prior 0018 work existed.

## Acceptance criteria — met
- Lacking the permission → 403; holding it → pass; derived CRUD keys gate per method
  (`test_has_denies_without_the_permission_and_passes_after_a_grant`,
  `test_has_derives_the_crud_key_from_the_request_method`,
  `test_has_passes_an_explicit_cross_cutting_key_verbatim`).
- `role:` rejects a missing role; multi-role actors pass on any held role; the panel role admits
  (`test_role_rejects_a_missing_role_and_admits_any_held_role`, `test_role_admits_the_panel_role`).
- Fail-closed with no actor (`test_the_gate_is_fail_closed_without_an_actor`).
- `php artisan route:cache` succeeds with the aliases applied; `composer verify` exits 0.

## Gate
- `composer verify` → exit 0 (config:clear ✓, `composer validate --strict` ✓, phpstan level 8 over
  **172 files: No errors** ✓, `route:cache` boot + clear ✓).
- `php artisan test` → **27 passed, 1 skipped** (skip = the Postgres-only RLS test on sqlite). The 6
  new middleware tests pass; no regression across the suite.

## Risks / carry-forward
- **No implicit super-bypass at the gate** (deliberate, above). If product wants super to pass every
  gate without explicit grants, that belongs in the resolver (0016), not the edge — flag for the
  manager to rule on. Today super is gated like anyone else and must be granted (global `force`).
- **Actor identity comes from `Context::userId()`**, populated by the downstream Identity middleware
  (AGENTX.md §2); until that lands, `Context` is the trusted source (set server-side). No auth/401
  layer here — a missing actor is fail-closed 403, not 401 (401 is Identity's concern, upstream).
- Single-token cross-cutting keys must carry an `_` to skip CRUD derivation (documented convention).
- `actor()` loads once per gate; a route stacking `has:`+`role:` does two PK lookups — negligible
  (indexed PK, `can()` itself hits the resolver cache). Request-memoization is available if profiling
  ever warrants it; not added speculatively.

ship it
