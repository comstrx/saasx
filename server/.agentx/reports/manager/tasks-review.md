ACTION: ship

Task 0019 — Engagements / social DNA (`HasSocial` + reference `HasLikes` + `likes` table). Correct, complete,
tenant-safe, at the right altitude, design-aware. This is the last foundation task (0001–0019 complete).

Confirmed:
- **Gated, fail-closed, reachability met:** `like()/unlike()` call `$this->hasOrFail('allow_likes')` — `HasLikes`
  composes `HasPermissions` so `use HasLikes` is self-governing (DNA self-containment). The gate resolves the
  actor from `Context` with `$this` as the item target (disable-able per-entity/per-item). The test grants
  `allow_likes` via the 0017 write surface WITHIN its own path before asserting a like — exactly the binding
  gate-reachability requirement from the architecture review.
- **Atomic counter, "same care as money":** transaction + `lockForUpdate` on the actor's row; no-op on
  `previous === value` (no double-count on repeat toggle); base-builder `increment`/`decrement` (atomic SQL,
  `toBase()`, no `updated_at` bump); the concurrent-first-insert window is backstopped by the `unique` + a
  single bounded retry that reconciles. No underflow (`decrement` only when a prior reaction existed);
  denormalized, never recounted; `hasColumn`-guarded with a morph-`count()` fallback.
- **Tenant-stamped** (`Like extends TenantModel`), **actor from `Context`** (never the body), **nothing-native**
  (Database/Context/Eloquent pipeline). **Design-aware:** ONE reference + table; `HasSocial` composes only what
  exists; other kinds declared with a copy-template, not pre-built. No gold-plating. Gate green (L8; 31 passed /
  1 skipped).

## Ruling — `User use HasSocial` as the trait consumer: ACCEPTABLE now
phpstan `trait.unused` needs an `app/` consumer; `User` is the only existing domain model (Product/Blog are
downstream); reusing it beats inventing a speculative demo table — consistent with the reuse / no-speculation
bar, and it exercises the counter-fallback (User has no counter columns). REVISIT when a real engageable domain
model lands: user-likes may not be a v1 feature, so move the demonstrator role to a real engageable and drop
`User`'s `HasSocial` if unintended. Not blocking.

## Firm flags (non-blocking — both feed the copy-template every future kind inherits)
1. **Engagement morph index must lead with `tenant_id`.** data.md prescribes `indexed (tenant_id,
   engageable_type, engageable_id)`, but `uuidMorphs('engageable')` yields `(engageable_type, engageable_id)`
   and the `unique` puts `tenant_id` last. UUID-selective so point-lookup impact is minor, but this is the
   REFERENCE every future engagement kind copies — add a `(tenant_id, engageable_type, engageable_id)` composite
   (and lead the unique with `tenant_id`) here and in the copy-template, per the "lead with tenant_id" law.
2. **Concurrency is reasoned, not runtime-tested** (sqlite ignores `lockForUpdate`); the `unique` + retry is the
   integrity backstop and the logic is correct for Postgres — re-verify under a Postgres harness before relying
   on it in prod. The 0015 NULL-distinct nuance applies to the `likes` unique for the rare super-engages case.

## Carry-forward (run-wide, for the systems/Identity phase — feed the journey report)
permission/role + catalog SEEDING (super's global grants, `allow_*` keys); the Identity system (auth flows,
Sanctum token↔tenant binding, the `Context`-populating middleware — gates fail-closed until it lands); the
`can()`/`Authorizable::can()` collision; queue/mail RLS-in-jobs; the RLS GUC `''`-vs-`::uuid` reconciliation;
vendor-ownership isolation on management-panel reads/writes; bare-token CRUD derivation is single-word-only (use
explicit verb keys in the route blocks); `matrix()`'s unused `$scope`; the resource()-convention 3×
(low-urgency); the http SSRF dual-stack IPv6 hardening; the s3 adapter dependency (sanctioned); guzzle/psr7 CVE
dep-hygiene; a live MinIO/S3 + Mailgun round-trip in an integration env.
