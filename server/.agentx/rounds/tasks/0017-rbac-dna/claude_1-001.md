# Task 0017 — RBAC DNA traits (`HasRoles` + `HasPermissions`)

Executor: claude_1. First/only executor (no prior `0017` work; the file held my finished `0016` report, now overwritten). The opt-in capabilities over the 0016 resolver + 0015 models.

## What I implemented
- **`app/Traits/Dna/HasRoles.php`** — `roles(): BelongsToMany` (via `user_roles`), `hasRole(string|array)`, `isSuper()`, `isSupervisor()` — server-side membership reads.
- **`app/Traits/Dna/HasPermissions.php`** — the facade over `Permissions\Resolver`:
  - `can(key, ?item): bool` · `setting(key, ?item): {allow,locked,source}` · `settings(scope): matrix`.
  - tenant writes `grant`/`revoke`, super write `force`, and `hasOrFail` (403 envelope, fail-closed).
- **`app/Models/User.php`** — mounted `use HasRoles, HasPermissions;` and removed the now-duplicate `roles()` (HasRoles provides it).
- **`tests/Feature/RbacDnaTest.php`** — 5 cases covering the acceptance.

## Key decisions (the concrete WHY)
- **One `HasPermissions` for both the actor and a governable model.** The identity is ALWAYS the current `Context` (role = `Context::role()`, userId = `Context::userId()`) — never the body. The TARGET is resolved by `permissionTarget()`: an explicit `$item`, else `$this` **iff** `$this` is not the acting user (`isPermissionActor()` = `Context::userId() === $this->getKey()`). So `$user->can('view_products')` resolves the actor with no target; `$product->can('allow_comments')` resolves with the product as the item target. Per-record/special permissions therefore flow through the SAME cascade (the resolver) — no second table, no parallel mechanism.
- **`Context::role()` is the resolution role** (the active panel role the middleware verified the user holds) — clean for the gate; a user's many roles drive panel access (`hasRole`), the active one drives resolution.
- **Writes are authority-correct and locked-aware.** `force` requires `Context::isSuper()` (fail-closed) and writes `authority=super`; `grant`/`revoke` write `authority=tenant` and **refuse** if the effective `setting()` is `locked` by a `super` source — `allow` gates access, `locked` gates editability, never conflated. Each write is one `permission_settings` row via `updateOrCreate` (with `withoutGlobalScope('tenant')` so platform/global rows are written by their explicit `tenant_id`, which is derived from `$this`/`null` — never the body), then the resolver cache is busted (`forgetAll` for a global write, `forget(tenant)` otherwise).
- **Membership is server-side** (`hasRole`/`isSuper` via `->exists()` on the actor's roles — per-request, not per-row); permission resolution stays N+1-free via the resolver's cached set. Nothing native (`App\Support\{Arr,Cache,Context,Response,Str}` + Eloquent + the resolver; grep-clean).

## Acceptance criteria — all met (`RbacDnaTest`, 5 cases)
- ✅ `App\Models\User` mounts `use HasRoles, HasPermissions;`, resolves its effective set against its roles, and `can()` is **fail-closed** (no rule → false; a tenant `grant` then makes it true). `hasRole`/`isSuper` read membership server-side.
- ✅ A model gains **item-level governance the same way** (`GovernableWidget use HasPermissions;`): fail-closed, then an item `grant` resolves through the cascade.
- ✅ A tenant `grant` on a super-locked permission is **refused**; a super `force` sets+locks and renders **faded** in `setting()` (`{allow:false, locked:true, source:super:global}`).
- ✅ `composer verify` exits 0.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). `php artisan test` → **19 passed, 1 skipped** (the prior 0013/0015/0016 suites + the 5 new DNA cases). No native primitives.

## Remaining risks
- **Active-role resolution, not multi-role union.** `can()`/`setting()` resolve for `Context::role()` (the active panel role). A user with several roles uses the active one; a future "union across all assigned roles" would need an explicit pass. Intended for the panel model — flagged.
- **The 0016 Context-prefixed-cache nuance carries through writes.** `grant`/`revoke` run in the tenant's context and bust the tenant's cache correctly. A super `force` runs in super context and busts under the super prefix — to reflect immediately for the TARGET tenant's users, the bust must run in that tenant's context (or the resolver cache be made explicit-tenant-keyed, the 0016 flag). The test forces+reads in the same (super) context, so it is consistent there.
- **`hasRole`/`isSuper` query per call** (actor-level, per-request — not a per-row N+1); could be memoised on the actor instance if it becomes hot.
- **`force` at a non-global scope uses `$this`'s tenant/target** — for a global force the host model is incidental; super forcing a specific tenant/item must be invoked on a model in that tenant (its `tenant_id` is the target), consistent with "writes target a validated tenant," never a body value.

ship it
