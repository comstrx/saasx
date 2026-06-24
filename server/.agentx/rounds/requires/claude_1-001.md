# Architect report — claude_1 (requires → tasks)

First architect on this plan: `.agentx/tasks/` was empty, no prior architect reports, no rounds, no
manager review. I created the plan from scratch — 19 ordered task contracts covering the 6 deliverable
requirements. `0001-compliance-floor.md` is the binding lens, earns no tasks (correct — it is acceptance,
not a deliverable); every task references it.

## Ground truth I established before planning (this changed the plan materially)
- **Gate is GREEN today** (`vendor/bin/phpstan` level 8 → "No errors") and `composer dump-autoload` is clean.
- **Support is NOT uniformly built.** 18 domains have real, production-grade code (~5k lines):
  `arr cache cast context database date file http json log net num parse request response security str validate`.
  **6 domains are EMPTY folders** — `event, lock, mail, queue, storage, throttle`. The gate is green *partly
  because empty folders emit no errors*. Only `cache` of the six `†` adapters exists.
- **Verified invariants that already hold** (so I did not write tasks to "fix" them): `http/Client::guard`
  does real SSRF (scheme allow-list + `Net\Ip::isPublic` on resolved IPs); `database/Rls::apply` is
  transaction-local (`set_config(...,true)`) and reads `Context::tenantId()`; `Context`, `Response`, `Cache`,
  `Database` facades are real and match the contract surface.
- **`app/Traits/` is entirely empty** — the whole engine + DNA layer is greenfield.
- Stack confirmed from lockfile: PHP ^8.5, Laravel ^13.8, octane/horizon/reverb/sanctum, symfony mailgun +
  http-client present (so `mail` needs no new dep). Gate = `composer verify` (config:clear → validate →
  phpstan L8 → route:cache → route:clear). Classmap autoloads `app/Support` + `app/Traits`.

## What I challenged / decided (not rubber-stamped)
1. **Support is mostly an AUDIT, not a build — except it isn't, for 6 domains.** A naive read of
   "complete the Support layer" + a green gate would produce busywork tasks over green code. I split the
   reality: **one audit task (0001)** for the 18 built domains (smallest-diff, "do not rewrite green code",
   concrete invariant checklist) + **four build tasks (0002–0005)** for the genuinely missing domains. This
   is the single most important correction in the plan — without the file-count probe an architect would
   mis-scope this as "all built, just verify."
2. **Resolver placement contradiction.** `skills/rbac-permissions.md` says the resolver "lives in the
   Support DSL"; `contracts/arch.md §5` says Support is **zero business logic** (LAW). The cascade resolution
   IS business logic. Resolved in favour of the contract: the resolver lives in `app/Traits/Dna/Permissions/`
   (task 0016) and *uses* `App\Support\Cache` — it does not live in `app/Support`. Flagged so the next
   architect doesn't "fix" it back.
3. **Where the read/query DSL lives.** `abstraction-engine.md` calls it "Model DNA"; requirement 0003 puts
   "search/stats/keyset" in the base engine and names `HasBaseModel`. Since every v1 resource wants search,
   I placed the DSL in `HasBaseModel` (Bases/, task 0006) — the model gains it via `use HasBaseModel`. If a
   future system needs search as a separable opt-out, refactor to `Dna/` under rule-of-two. Stated, not
   silent.
4. **RBAC needs its own schema to be verifiable.** A resolver/gate with no `permission_settings` table can't
   be accepted. I gave 0006-RBAC its own four tables (0015) — they are the *engine's* infrastructure, not a
   business system's. I explicitly carved `users` + the Context-populating auth middleware OUT as a
   downstream Identity system (not in this backlog) and flagged the `roles`/`user_roles` seam for the manager
   to re-cut if it prefers them in Identity.
5. **The cross-tenant probe is in scope now.** Tests are "deferred until v1 ships" (AGENTX.md), but
   `compliance-floor` + `tools.md` single out the cross-tenant probe as "the first test that earns its keep."
   I made it its own task (0013) with a flagged DB-harness risk (RLS assertions need pgsql).
6. **Seams fixed so layers don't fight at the interface** (the briefing's split test):
   - `HasBaseModel::getResource` ↔ `HasRelations::getWithRelations` (method_exists hook; absent → no
     includes, never an error). 0006 ↔ 0014.
   - `HasBaseController::related/showRelated` ↔ `HasRelations::resolveRelation/isRelation` (fail-closed 404;
     until 0014 lands the action 404s any relation). 0011 ↔ 0014.
   - `HasBaseRequest::authorize()` returns `true` by default — access gating is the `has:` middleware (0018),
     NOT the request — so 0010 has **no forward dependency** on RBAC. Deliberate decoupling.
   - Base engine **threads** permissions as data; **resolution** is the resolver+middleware (0016/0018). The
     engine (0006–0011) is independent of RBAC.

## Requirements → tasks (how and why I split)
- **0001 compliance-floor** → 0 tasks. It is the acceptance lens; referenced by every task. Correct per its
  own text ("earns no tasks of its own").
- **0002 support-foundation** → **0001 (audit 18 built)** + **0002 lock+throttle** + **0003 queue+event** +
  **0004 storage** + **0005 mail**. Split by *what is actually missing* and by adapter cohesion: lock+throttle
  are trivial Redis primitives; queue+event are the tenant-aware Redis/Horizon pair (queue/Tenant stamp+
  restore, event/Outbox); storage is the distinct s3 backend; mail is Mailgun-HTTP-queued. Each build task
  follows the proven `cache` adapter template (Driver + ≥1 driver + manager).
- **0003 base-engine-traits** → **0006 HasBaseModel** → **0007 HasBaseRepository** → **0008 HasBaseService**
  → **0009 HasBaseResource** → **0010 HasBaseRequest** → **0011 HasBaseController**. One task per layer
  because each layer is a distinct responsibility and the inter-layer seam is exactly where an interface
  fight happens — fixing the seam per task IS the architecture. Ordered by build dependency (model DSL →
  repo → service; resource/request are boundary; controller composes all three, last).
- **0004 hastenant-dna** → **0012 HasTenant** + **0013 cross-tenant probe**. Trait stays pure; the probe is
  the highest-value test and gets its own verifiable unit.
- **0005 relations-dna** → **0014 HasRelations** (auto-discovery + eager-load + nested dispatch +
  preventLazyLoading). One cohesive concern.
- **0006 rbac-dna** → **0015 schema+models** → **0016 resolver** → **0017 DNA traits (HasRoles+HasPermissions)**
  → **0018 middleware (Has+Role)**. The largest, highest-stakes subsystem; clean seams schema→resolver→DNA→
  gate, each substantial and independently verifiable.
- **0007 engagements-dna** → **0019** (design-aware: the `Dna/Social/` pattern + ONE reference trait
  `HasLikes` + its morph table; the rest declared, not pre-built — per "build only what a current system
  needs", and no concrete engageable system is in this backlog).

## Ordering rationale
Support foundation first (the one sanctioned foundation-first exception) → base engine → HasTenant (+probe)
→ relations → RBAC (schema→resolver→DNA→gate) → engagements. `Order:` fields are set to *real* prerequisites
(the specific built Support domains a trait uses), not blanket serialization, so the manager can parallelize:
e.g. 0002–0005 (Support builds), 0006/0009/0010 (model, resource, request) and 0012 (HasTenant) are largely
independent and only converge at 0011 (controller) and the RBAC/engagements chain. All tasks are `lib` — no
task stands up a routed resource (routes/collections are the downstream systems phase).

## What I kept / changed / removed
- Kept: nothing to keep — empty plan. Removed: nothing.
- Changed vs a naive plan: reframed Support from "build 24" to "audit 18 + build 6"; decoupled Request from
  RBAC; pinned resolver out of `app/Support`.

## Open risks / assumptions (carry forward — do not re-derive)
1. **Context population is downstream.** The base engine *reads* `App\Support\Context`; the panel/tenant
   middleware that *sets* it from the authenticated Sanctum token (token.tenant == domain.tenant) is an
   Identity-system concern NOT in this backlog. Flagged, not turned into a task (it is already captured by
   AGENTX.md §2 Identity [v1]). If the manager wants it now, it needs a new requirement.
2. **RBAC ↔ Identity seam (task 0015).** `roles`/`user_roles` are placed with RBAC; `users` + auth flows are
   downstream. Re-cut if the manager prefers an Identity-owned membership.
3. **Probe DB harness (task 0013).** Needs a configured test DB; RLS assertions require Postgres (sqlite
   skips the RLS layer, documented). Application-scope isolation runs anywhere.
4. **Platform-level nullable-`tenant_id` rows** (permissions catalog, global permission_settings, super
   roles) interact subtly with the `HasTenant` fail-closed scope — handled by model config in 0015/0016, not
   by weakening the scope. Watch this in review; it is a classic leak/over-restrict point.
5. I did **not** write a new requirement file this run. No need beyond-scope was *revealed* that AGENTX.md
   §2 doesn't already capture (Context middleware, Identity, products/orders/wallets systems are all known
   downstream). If the next architect disagrees on the Identity seam, that is the place to add one.

## Gap that remains
The plan is complete, ordered, minimal, and contract-compliant for the 6 deliverable requirements, and each
task is independently executable with sharp acceptance. The one thing I cannot self-certify is downstream of
the architecture turn: the tasks have not been *executed*, so "gate green per task" is asserted by the
contract, not yet observed. As an architecture deliverable the plan is ready.

ship it
