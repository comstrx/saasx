# Task 0015 — RBAC schema + models (catalog + cascade + roles)

Executor: claude_1. First/only executor (no prior `0015` work; the file held my finished `0014` report, now overwritten). The first real domain models land here, on the engine + tenancy spine.

## What I implemented
- **3 enums** (`app/Enums/`): `PermissionScope {global,tenant,entity,item}`, `Authority {super,tenant}`, `RoleType {admin,vendor,affiliate,delivery,client}` (backed `string`).
- **5 table migrations** (UUIDv7 PKs, FKs `<singular>_id`, `tenant_id` rules, composite uniques leading with `tenant_id`):
  - `users` — minimal substrate: `tenant_id?`, `name/email/password/email_verified_at?`, **`unique(email, tenant_id)`** (never `email` alone).
  - `roles` — `role`, `is_super`, `is_supervisor`, `tenant_id?` (super roles NULL).
  - `permissions` — platform catalog `(key unique, group, label)`, **no `tenant_id`**.
  - `permission_settings` — the cascade: `(tenant_id?, permission_id FK, scope, role?, target_type?, target_id?, user_id?, allow, locked, authority)`, per-scope `unique`, hot index `(tenant_id, permission_id, scope)`.
  - `user_roles` — `(tenant_id?, user_id FK→users, role_id FK→roles)`, `unique(tenant_id, user_id, role_id)`.
- **1 RLS migration** (`enable_rls_policies`) — **pgsql-guarded** (skips on sqlite): `ENABLE`+`FORCE ROW LEVEL SECURITY` + a tenant policy on the 4 tenant-scoped tables; `down()` drops them. Additive, reversible.
- **4 models**: `User`, `Role`, `Permission`, `PermissionSetting` (relations, enum casts, `fillable`).
- **`tests/Feature/RbacSchemaTest.php`** — verifies the migrations build the schema and that `users`/`permission_settings` isolate cross-tenant (joins the gate).
- **Fix to the default migration** — `personal_access_tokens.morphs('tokenable')` (bigint id) → **`uuidMorphs`** so `HasApiTokens` tokens actually persist for UUID-PK users (real "token-ready").

## Key decisions (the concrete WHY)
- **`User extends TenantModel use HasApiTokens` — NOT `Authenticatable`.** For the membership substrate, `User` needs to be a tenant-isolated Eloquent model with the UUIDv7 PK setup + Sanctum tokens + relations — none of which require the auth-guard contract. Extending `Authenticatable` would (a) conflict with `TenantModel` as the base and (b) force `User` to re-declare the UUIDv7 PK setup (DERIVE violation). Identity (downstream) adds `Authenticatable`/`Notifiable` **additively** (interfaces + traits), no base-class change. This keeps `User` inside the engine (`HasBaseModel`/`HasTenant`/`HasRelations` via `TenantModel`).
- **`Permission extends BaseModel`, not `TenantModel`** — it is the platform-owned vocabulary (no `tenant_id`), readable by every tenant; the catalog being un-scoped is the documented platform exception. `PermissionSetting`/`Role` are `TenantModel` (tenant-scoped); their `tenant_id`-NULL rows (global settings, super roles) ride the `HasTenant` creating hook that preserves a NULL for super.
- **RLS policy `USING (tenant_id IS NULL OR tenant_id = current_setting('app.tenant_id', true)::uuid)`** — defense-in-depth that permits platform/global (`NULL`) rows + the current tenant's rows, never another tenant's. The `HasTenant` app scope remains the PRIMARY restriction; RLS is the DB-level net (app connects as non-owner — an ops step). pgsql-only; sqlite skips with the migration as a clean no-op.
- **Fixed `tokenable` to `uuidMorphs`** in the 0001 scaffold migration — bigint `tokenable_id` cannot hold a UUID, so `createToken` would have failed silently for our models. A correctness fix for the UUID-everywhere archetype (greenfield, migrations not yet run).

## Acceptance criteria — all met
- ✅ Migrations build all five tables (+ the corrected `personal_access_tokens`) with UUIDv7 PKs, the `tenant_id` rules, `users.unique(email, tenant_id)`, the real `user_roles.user_id→users` FK, and the per-scope unique; **`migrate:rollback` cleanly reverses** (verified end-to-end on sqlite).
- ✅ `User` resolves with `HasTenant` + `HasApiTokens`, exposes `roles()` (discovered); enum casts work (`scope→PermissionScope`, `authority→Authority`); **users and permission_settings isolate** — tenant A sees 0 of B's rows, a create stamps the acting tenant, and the same email registers once per tenant (`unique(email, tenant_id)`). `RbacSchemaTest` (4 cases) + the wider suite pass.
- ✅ `composer verify` exits 0.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). `php artisan test` → **10 passed, 1 skipped** (0013 isolation + 4 new RBAC cases; RLS skip on sqlite). Probe removed.

## Remaining risks
- **NULL-`tenant_id` + unique nuance** — Postgres treats NULLs as distinct, so the composite `unique(email, tenant_id)` does NOT prevent two super users (`tenant_id` NULL) sharing an email, nor duplicate global `permission_settings`. The unique enforces every non-NULL shape (the tenant-row case). The platform-row uniqueness (super email, global settings) needs `NULLS NOT DISTINCT` (PG15+) or per-scope partial uniques — a refinement for Identity / the resolver (0016) that authors those rows. Flagged.
- **Global `permission_settings` (tenant_id NULL) are invisible to a tenant's default `HasTenant` scope** — by design: the resolver (0016) reads the platform defaults explicitly as part of the cascade walk (tenant rows stay isolated). Note for 0016.
- **RLS verified structurally only** — the migration applies on pgsql and skips on sqlite (the test DB); the actual policy/`FORCE` assertions need a pgsql test connection (0013's flagged carry-forward). The PRIMARY application-scope isolation is fully verified.
- **`User` is not `Authenticatable` yet** — deliberate (substrate only); Identity adds the auth contracts additively. The default-migration `uuidMorphs` edit is a correctness fix for UUID tokens.

ship it
