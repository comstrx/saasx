# Architect report — claude_1 (requires → tasks)

Round 2. Plan = 19 ordered task contracts for the 6 deliverable requirements (`0001-compliance-floor` is
the binding lens, earns no tasks). Round 1 was reviewed by the manager (ACTION: revise) with one BLOCKING
defect + one non-blocking note, both localized. I resolved EVERY point, touching ONLY tasks 0015, 0017, and
the 0019 acceptance — tasks 0001–0014, 0016, 0018 were confirmed correct by the manager and left untouched
(no churn).

## Manager review — every point resolved
**Defect 1 (BLOCKING) — `users` membership substrate referenced but created by no task.**
Verified independently: `app/Models` is empty; the sole migration (`2026_01_01_000001_create_default_table`)
creates only jobs/job_batches/failed_jobs/personal_access_tokens — there is NO `users` table or `User` model.
So 0015's `user_roles.user_id` had no FK target, and 0017/0018's "authenticated `User` actor" was
unsatisfiable. Confirmed Sanctum `HasApiTokens` is present in the lockfile. Fixes:
- **0015** — added a **minimal `users` substrate** to scope: `*_create_users_table.php` + `App\Models\User`.
  Schema: UUIDv7 PK, `tenant_id?` (super `tenant_id` NULL per the platform-table exception), name/email/
  password/`email_verified_at?`, **`unique(email, tenant_id)` — never `email` alone**, `use HasTenant` +
  `HasApiTokens` (token-ready). `user_roles.user_id` is now a **real FK to `users`**. Acceptance restated to
  "all five tables" + the FK + `migrate:rollback` reverses, and the User resolves with HasTenant+HasApiTokens.
  Replaced the old "Open assumption" with a **binding Scope guard**: auth flows (login/register/verification/
  OTP/password reset), Sanctum token↔tenant binding, the `Context`-populating panel/tenant middleware, and
  permission/role SEEDING are the downstream Identity system (AGENTX.md §2 [v1]) — explicitly OUT of scope;
  Identity EXTENDS this same `users` table additively. The `users` table here is the membership FK target and
  nothing more.
- **0017** — acceptance restated: the concrete `App\Models\User` from 0015 mounts `use HasRoles,
  HasPermissions;` and resolves its effective set via `user_roles`; `can()` fail-closed. (Order already
  depended on 0015.)
- **0018** — needs no edit: it already gates "the authenticated actor via `HasPermissions::can()`"; that
  actor now exists (0015) and is reachable through the 0017 DNA. The manager named 0018 only as a downstream
  consequence of the missing `User`, which 0015 now supplies. Left untouched per "do not churn".

**Defect 2 (non-blocking, specify) — 0019 gate reachability under fail-closed resolution.**
`allow_likes` resolves to DENY until a catalog entry + allowing setting exist, so the "successful like"
acceptance was unreachable without a downstream seeder. Fix: added a **binding "Gate reachability"** section —
the demonstrator must register `allow_likes` in the catalog and allow it via the 0017 write surface (super
`force` / tenant `grant`) **within its own path** before asserting the like, AND must assert the closed case
(no grant → refused). No dependency on a downstream seeder. (0019 already ordered after 0017/0018.)

## No new requirement file
Confirmed with the manager: Identity stays downstream per AGENTX.md §2. The minimal `users` substrate is the
narrowest thing that makes RBAC verifiable; it is not the Identity system and does not widen scope.

## The plan (unchanged structure; for the next architect)
Requirements → tasks, ordered by real dependency (Order fields are precise prerequisites, not blanket
serialization, so the manager can parallelize):
- **0002 support-foundation** → 0001 (audit the 18 built+green domains, smallest-diff, no rewrite) · 0002
  lock+throttle · 0003 queue+event · 0004 storage · 0005 mail. Split = audit-vs-build: 18 domains are built
  & green; 6 (`event,lock,mail,queue,storage,throttle`) are EMPTY folders (gate green partly because empty
  folders emit no errors) — the build tasks follow the proven `cache` adapter template.
- **0003 base-engine-traits** → 0006 HasBaseModel (read/query DSL) → 0007 HasBaseRepository → 0008
  HasBaseService → 0009 HasBaseResource → 0010 HasBaseRequest → 0011 HasBaseController. One per layer; seams
  fixed (see below); ordered by build dependency.
- **0004 hastenant-dna** → 0012 HasTenant (fail-closed spine) + 0013 cross-tenant probe (first test that
  earns its keep).
- **0005 relations-dna** → 0014 HasRelations (auto-discovery + eager-load + nested dispatch +
  preventLazyLoading).
- **0006 rbac-dna** → 0015 schema+models (now incl. minimal `users`) → 0016 resolver → 0017 DNA traits →
  0018 middleware.
- **0007 engagements-dna** → 0019 (design-aware: `Dna/Social/` pattern + ONE reference trait `HasLikes` + its
  morph table; rest declared).

## Decisions carried from Round 1 (manager accepted — do not re-litigate)
- Resolver (0016) lives in `app/Traits/Dna/Permissions/`, NOT `app/Support` (Support is zero-business-logic
  by LAW; the skill's "resolver in Support DSL" loses to `arch.md §5`). Uses `App\Support\Cache`.
- Read/query DSL in `HasBaseModel` (0006) per requirement 0003, with a rule-of-two refactor path to a
  separable Search DNA if a future system needs opt-out.
- Seams fixed so layers don't fight at the interface: `HasBaseModel::getResource` ↔
  `HasRelations::getWithRelations` (method_exists hook); `HasBaseController::related` ↔
  `HasRelations::resolveRelation` (fail-closed 404 until 0014 lands); `HasBaseRequest::authorize()` returns
  true (gating is the `has:` middleware) → 0010 has no forward RBAC dependency; the base engine threads
  permissions as data, resolution lives in 0016/0018.

## Open risks / assumptions (carry forward)
1. **Context population is downstream** (Identity): the base engine READS `App\Support\Context`; the
   middleware that SETS it from the authenticated Sanctum token is NOT in this backlog (captured by AGENTX.md
   §2). Flagged, not a task.
2. **Probe DB harness (0013):** needs a configured test DB; RLS assertions require Postgres (sqlite skips the
   RLS layer, documented); application-scope isolation runs anywhere.
3. **Platform nullable-`tenant_id` rows** (users super-rows, permissions catalog, global permission_settings,
   super roles) interact subtly with the `HasTenant` fail-closed scope — handled by model config in 0015/0016,
   not by weakening the scope. A classic leak/over-restrict point; watch in review.

## Gap that remains
None at the architecture altitude: the plan now fully covers all 6 requirements, the BLOCKING `users` gap is
closed with a minimal additive substrate (no scope creep into Identity), the 0019 gate is reachable within its
own path, ordering and seams are sound, and every task is single-concern with sharp, testable acceptance. The
only thing not self-certifiable is post-execution gate-green — the tasks are written, not yet built.

ship it
