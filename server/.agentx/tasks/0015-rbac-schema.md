# 0015 — RBAC schema + models (catalog + cascade + roles)

- Requirement: `0006-rbac-dna.md` (clears `0001-compliance-floor.md`: UUIDv7 + `tenant_id` + composite uniques, additive/reversible, fail-closed isolation).
- Deliverable type: lib
- Order: 0012 (`HasTenant`), 0006 (`HasBaseModel`).

## Responsibility
The RBAC engine's own data foundation: a minimal `users` membership substrate, the permission catalog, the uniform cascade table, and the roles/membership tables, with their models — so the resolver and DNA have a schema (and an actor) to operate on.

## Path
- `database/migrations/*_create_users_table.php` · `*_create_permissions_table.php` · `*_create_permission_settings_table.php` · `*_create_roles_table.php` · `*_create_user_roles_table.php`.
- `app/Models/{User,Permission,PermissionSetting,Role}.php` (+ `user_roles` pivot model if needed).

## Public interface
Schema per `contracts/data.md` (UUIDv7 string PKs; FKs `<singular>_id`):
- `users` — **minimal membership substrate only** (NOT the Identity system): UUIDv7 PK, `tenant_id?` (super users `tenant_id` NULL per the platform-table exception), `name`, `email`, `password`, `email_verified_at?`; `unique(email, tenant_id)` — **NEVER `unique(email)` alone**. `App\Models\User` `use HasTenant` + Sanctum `HasApiTokens` (token-ready); it is the FK target for `user_roles`. Identity (downstream) EXTENDS this same table additively — do not pre-add auth columns/flows here.
- `permissions` — platform catalog: `(key unique, group, label)`; **no `tenant_id`** (platform-owned vocabulary).
- `permission_settings` — ONE cascade row type: `(tenant_id?, permission_id, scope ∈ {global,tenant,entity,item}, role?, target_type?, target_id?, user_id?, allow bool, locked bool, authority ∈ {super,tenant})`; `unique` per scope shape; hot index leads with `tenant_id`; **only `scope=global` has `tenant_id` NULL**.
- `roles` — `(role enum {admin,vendor,affiliate,delivery,client}, is_super bool, is_supervisor bool, tenant_id?)`; super-owned roles may be `tenant_id` NULL.
- `user_roles` — `(user_id, role_id, tenant_id)`, `unique(tenant_id, user_id, role_id)`; `user_id` is a **real FK to `users`** (no dangling reference).
- Models declare relations/casts/`fillable`; tenant-scoped models `use HasTenant` (see invariant on nullable-`tenant_id` platform rows). Closed sets (`scope`, `authority`, `role`) are PHP enums.

## Invariants
- Every business unique includes `tenant_id`; composite uniques and hot indexes lead with `tenant_id`. Migrations are reversible, additive-first.
- Platform/nullable-`tenant_id` rows are the deliberate, documented exceptions (`permissions`; `permission_settings` `scope=global`; super `roles`); the model config makes the catalog readable to all tenants while per-tenant settings stay tenant-scoped — the fail-closed scope is never weakened for convenience.
- An RLS policy + `FORCE ROW LEVEL SECURITY` is added (additively) for the tenant-scoped tables; `permissions`/global rows are the noted exceptions.
- Money/floats: N/A. `declare(strict_types=1)`; exact hand-style; zero comments.

## Acceptance criteria
- `php artisan migrate` builds all five tables (`users` + the four RBAC tables) with UUIDv7 PKs, the documented `tenant_id` rules, `users.unique(email, tenant_id)`, the real `user_roles.user_id`→`users` FK, and the per-scope uniques; `migrate:rollback` cleanly reverses them.
- `App\Models\User` resolves with `HasTenant` + `HasApiTokens`; models expose their relations, and tenant-scoped ones isolate (cross-tenant probe pattern holds for `users` and `permission_settings`).
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0012, 0006. Precedes 0016 (resolver reads this schema).

## Scope guard (binding — state in the work)
This task owns the RBAC cascade schema PLUS a **minimal `users` substrate**, because the DNA, resolver, and gate are unverifiable without both a cascade table and an actor to resolve. EXPLICITLY OUT OF SCOPE here (the downstream Identity system, AGENTX.md §2 [v1] — already captured, do NOT build now and do NOT widen this task into them):
- auth flows (login / register / verification / OTP / password reset),
- Sanctum token↔tenant binding (`token.tenant == domain.tenant`),
- the `Context`-populating panel/tenant middleware,
- permission/role SEEDING.
Identity will EXTEND this same `users` table additively (more columns, the flows above). The `users` table here is the membership FK target and nothing more.
