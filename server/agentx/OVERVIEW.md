# AGENTX.md — SaasX `server` (project overview + the vsample contract)

> The Laravel API at `/var/www/projects/saasx/server` — **Phase 1** of the SaasX monorepo.
> This file is the project's **overview** (how this system must be built) and a project-level **contract**
> (the `vsample` discipline at the bottom is LAW). The shared archetype laws — architecture, design, style,
> naming, tooling, tolerance, and skills — are injected by agentx's training center; this file is what is
> SPECIFIC to SaasX, and it overrides the generic guidance wherever they touch.
> The repo `README.md` "Technical Stack" is OUTDATED (it says Rust) — **the code and this file are ground truth.**

## Before you touch anything

1. Read this file in full — the product, its systems, the architecture spine, and the build method.
2. Re-read the injected contracts (architecture, design, style, naming, tools, tolerance) — they are LAW.
3. Establish ground truth: `composer.json` + `composer.lock`, `.env*`, `config/*`. Never assume a version or shape.
4. For the system you will build: **tour `server/vsample/` first** — intent only (see "The vsample contract" below).

---

## 1 — The product

**SaasX** is a premium **multi-tenant, multi-panel, multi-business SaaS platform** — *infrastructure for
operating and monetizing businesses*, not a store builder, not a marketplace clone, not a booking engine.
One tenant gets a full branded business ecosystem and owns its **entire chain**: its vendors, affiliates,
clients, deliveries, products, orders, wallets — all tenant-scoped, no cross-tenant leakage.

- Name **`SaasX`** (`APP_NAME=Saasx`); org/domains under **comstrx** (`comstrx.com`, `github.com/comstrx/saasx`).
- Monorepo root `/var/www/projects/saasx`; this governs **`server`** only (Laravel API, **Phase 1**).
  Siblings: `admin`/`client` (Next.js), `engine` (Rust/Actix — Phase 2, deferred), `mobile`, `infra`, `docs`.
- `server/vsample/` = the owner's **old** Laravel project. Reference for **intent ONLY** — never copied, never deleted.

**Tenancy.** Shared DB + **shared schema + `tenant_id` column**. The Eloquent global scope (`HasTenant`,
fail-closed) is the **primary** isolation; Postgres **RLS is defense-in-depth**. Chosen because the layered
"business-on-top-of-business" model implies many small tenants.

**Panels (6 + guest).** Each panel = its own API route file **and** its own Postman collection, kept a strict
1:1 mirror: `routes/apis/<panel>.php` ↔ `routes/collections/<panel>.json`. A single unified `XxxController`
serves all panels; behaviour differs by the **active panel role** (the `Context` tag).

| Panel | What it is |
|-------|-----------|
| `super` | Platform/SaaS-owner panel (the owner). **Cross-tenant**, `tenant_id = NULL`. API = full `admin` set **plus** a `tenants` resource. Manages every tenant and ALL its data. First-class role. |
| `admin` | The **tenant's** admin panel — manages that tenant's data: vendors, affiliates, deliveries, clients, products, orders, plans, etc. |
| `vendor` | A vendor managing **his own products** (and their orders/bookings) under a tenant. |
| `affiliate` | Affiliate managing his marketing/affiliate URLs for products and the clients he refers. |
| `delivery` | Delivery ops panel: tracks orders needing delivery, competes on vendor offers (admin approves), chats with clients, monitors status. |
| `client` | **NOT an admin panel** — the public client storefront (web/mobile). The buyer surface. |
| `guest` | Public/unauthenticated surface (browse, register, login). |

Spelling is **`affiliate`** everywhere (prefix, role, permissions `*_affiliate`) — never "affiliator".

**`super` behaviour.** On detecting a `super` user the tenant middleware **disables tenant scope**: reads
span/filter by tenant; writes target a tenant via a validated `tenant_id` in the request body. The escape hatch
is an **audited** `withoutTenancy()` — never an ambient default.

**Vendor onboarding & tenant commission (booking.com-style).** A guest on the client storefront clicks
"become a partner" → is redirected to that tenant's **vendor-panel domain** → registers, verifies, optionally
subscribes to a plan (free/premium) → adds products that surface on the tenant's storefront. The tenant
**admin earns a commission** on every order/booking of that vendor's products (per-tenant marketplace economics).

**v1 API scope.** Seed **ALL roles** (super, admin, vendor, affiliate, delivery, client) + their permissions in
the DB now. Expose **APIs / route files / collections for `super`, `admin`, `vendor`, `client` ONLY** in v1.
**`affiliate` and `delivery` get NO API yet** (DB rows exist, surface does not).

**v1 goal.** Lay the fundamentals correctly and get the database right — multi-tenancy, identity + RBAC,
multi-vendor, multi-product-type, the actor chain, plans/feature-gates. Advanced subsystems follow once the
spine is solid. **Tests are deferred until v1 ships.**

---

## 2 — The systems map

Build **systems, not layers** (§4). Each system is a vertical that distributes its requirements across the
layers. Status: **[v1]** build now · **[v1·db]** seed/schema now, no API yet · **[design]** design the
abstraction now so adding it later is one file · **[later]** deferred.

| System | Status | Essence |
|--------|--------|---------|
| **Identity & auth** | [v1] | Users, Sanctum **stateless Bearer**, tenant-bound tokens, verification/OTP, password reset. Subdomain + token tenant resolution. |
| **RBAC** | [v1] | Hand-rolled roles + permissions + per-record special permissions. Many-to-many roles; panel group declares the role, middleware verifies. **Never trust client-supplied permissions.** |
| **Multi-tenant core** | [v1] | `tenant_id` everywhere, `HasTenant` fail-closed scope, RLS defense-in-depth, `Context` role/tenant tag, tenant-stamped jobs. |
| **Multi-vendor** | [v1] | Vendors under a tenant, onboarding, plan subscription, commission to tenant admin. |
| **Multi-product-type** | [v1] | One product spine supporting multiple product types (physical/digital/service/booking…) without per-type table sprawl. |
| **Orders** | [v1] | Order lifecycle as a **state machine**; domain events emitted via the events abstraction. |
| **Wallets & ledger** | [v1] | Double-entry ledger, **integer minor units only** (never floats). Idempotency on financial endpoints. |
| **Plans & feature-gates** | [v1] | Plans, subscriptions, per-plan limits → per-plan rate limiting (`support/throttle`). |
| **Payments** | [design + v1 Stripe] | `PaymentGateway` contract + `StripeDriver` (fake creds OK) + manager + webhook pipeline + **full lifecycle** (intent→authorize→capture→refund→dispute→payout). Add a provider = ONE file. |
| **Cache** | [v1] | Full DSL (get/read/set/update/remember/refresh/forget/**index**/reset/flush) + **indexed (tag) partial invalidation**, neutral interface, Redis first, swappable. |
| **N+1 elimination** | [v1] | Auto eager-load from auto-discovered relations + requested includes; `preventLazyLoading()` as the dev tripwire. |
| **Search** | [design] | Provider abstraction; v1 a DB-backed/light driver, ES driver later (OpenSearch-compatible). Bounded, whitelisted. |
| **Events / broker** | [design] | All publishing via `App\Support\Event::publish(event,payload,key)` behind a swappable `Driver`. **No broker in v1**; default = Redis/Horizon. Add Kafka/Redpanda/SQS/NATS = ONE Driver file. Add `outbox` table when durable delivery is needed. |
| **Idempotency** | [v1] | `Idempotency-Key` header → middleware stores `key→response` under a lock, scoped per tenant+user+endpoint → safe retries, no duplicate side effects. |
| **Storage & files** | [v1] | One `Storage` abstraction, **`s3` driver everywhere** (AWS prod, MinIO dev). Tenant-namespaced keys, private by default, signed `TemporaryUrl`. |
| **Mail** | [v1] | **Always queued** (`ShouldQueue`), **Mailgun HTTP API** transport — never SMTP. |
| **Chat (realtime CRM)** | [later, flagship] | Conversations/participants/messages + per-participant state + replies + context (product/order). Reverb, `ShouldBroadcastNow`, presence + shared tenant-admin channel, oversight (admin reads its tenant, super reads all), AI bot with human handoff (`conversation.mode = bot|human`). Design-aware now, built later. |
| **AI** | [design] | Swappable provider, default **Claude / Anthropic latest**; powers chat bot + discovery. Add/replace = ONE file. |

Subsystem rule: every `[design]` system is **"swap a driver / add one file"** — a `Driver` interface +
concrete driver(s) + a manager in `index.php`. Callers never reference a backend directly.

---

## 3 — The architecture spine

Repository pattern, layered. Two views of one stack:

- **Build / dependency order (inner → outer):**
  `support → traits → bases → repository → service → controller → request → middleware → route`
- **Runtime request flow (outer → inner):**
  `route → middleware → request (validation) → controller → service → repository → model (+ traits) → support`

What you write per new resource (the DX target):

```
migration  +  Model (use traits)  +  Repository::fields()  +  Service (overrides only)  →  full auto API
```

The engine materializes CRUD / search / stats / files / permissions / relations / nested relations /
tenant-scope. Concrete classes stay near-empty. **The magic lives in the `HasBaseXxx` engine traits and the
DNA traits, never in a concrete class.** The schema + naming conventions are the **single source of truth**:
relations, routes, permissions, and fields are **derived, not hand-written.**

---

## 4 — How to build (working method)

**Systems-first, vertical. NEVER layer-by-layer.** Do not pre-build a whole layer. Pick a system, drive it
through the layers; the system distributes its requirements across them as you go. (The one sanctioned
exception is the Support layer, laid complete once as the foundation — see the requirements.)

Order for a system (example: `auth`):
1. **Migrations** — tables (users, roles, permissions, pivots…) with **UUIDv7**, `tenant_id`, composite uniques.
2. **Models** (+ DNA traits).
3. **Traits** the models need (engine `HasBaseXxx` and/or DNA `HasXxx`), built on the Support DSL.
4. **Repository** (`fields()` + overrides) · **Service** (overrides only) · **Controller** (thin) ·
   **FormRequest** (mandatory validation) · **Resource** (envelope shaping).
5. **Middleware** + **routes** (explicit reusable blocks in `routes/apis/shared.php`, `route:cache`-safe).
6. **Postman collection** entry in the mirror file, **same change**.

While building, when you need a string/cache/number/list/net/io/db helper: **go to `app/Support` — use it if it
exists; if not, create it in the right file; if the file/folder doesn't exist, create `folder/index.php`** then
`composer dump-autoload`. Same for traits. Build **only what the current system needs** — no speculative
breadth. **Before writing any `support/` or `trait/` file, tour `vsample`'s `app/Helpers/*` + `app/Traits/*`
first** (intent only), then build ours stronger.

**Per-resource definition of done.** A resource is complete only when ALL hold: migration (UUIDv7 + `tenant_id`
+ composite uniques) · model with DNA traits · `Repository::fields()` · `Service` (overrides only) · thin
`Controller` · `FormRequest` validating every write · `Resource` shaping the envelope · route block wired per
panel · `collections/<panel>.json` mirror updated · **gate green**.

---

## 5 — v1 definition of done

- Multi-tenancy correct end-to-end: fail-closed scope, RLS, `Context` tag, tenant-stamped jobs, per-tenant cache keys.
- Identity + RBAC complete; all six roles + permissions seeded.
- The Base engine (all `HasBaseXxx` + the shells) and the needed DNA traits exist and are exercised by real resources.
- Live APIs for `super`, `admin`, `vendor`, `client` with the `apis ↔ collections` mirror kept 1:1.
- Multi-vendor, multi-product-type, the actor chain, orders state machine, wallets/ledger, plans/feature-gates wired.
- Payments: Stripe driver + lifecycle behind the contract. Mail queued via Mailgun API. Storage via s3/MinIO.
- Events/search/AI/chat **abstractions** in place (drivers minimal) so each is "add one file" later.
- **Gate green**: Larastan level 8, `declare(strict_types=1)` everywhere, no formatter, no suppressions.

---

## 6 — The vsample contract (LAW — intent only, never copied)

`server/vsample/` is the owner's **old** Laravel project (~1.5 years old), a **reference for INTENT and IDEAS
only** — never copied, never the implementation, **never deleted**. It is excluded from the gate
(`phpstan excludePaths: vsample`). Re-read this before building any system. **The goal is never to reproduce
vsample or match it — it is to out-build it by a wide margin: more magic, sharper abstraction, far cleaner.**

**What it is, and is not.**
- It **is**: a window into how the owner thinks about SaaS systems, the "magic" he wants, his naming instincts,
  and how the same system was wired before. A confidence-builder and an idea source.
- It is **not**: a sacred pattern, a copy-paste source, or production-grade. It documented an idea for a small
  client — a **lower level** than what we build now. We build an enterprise, product-base company codebase:
  **fresher, stronger, safer, cleaner.**

**The discipline (mandatory).**
1. **Tour `vsample` first** for the system you are about to build. Trace its footprints across `app/Models`,
   `app/Traits`, `app/Services`, `app/Repositories`, `routes`, `database/migrations` — see how the magic was
   wired and the approach taken.
2. **Extract intent, not code.** Understand *why* it did a thing; then design ours from scratch to the
   contracts. **No line is copied verbatim.**
3. **Go back and forth.** Keep returning to `vsample` throughout a system — it surfaces ideas you'd miss and
   restores confidence in the automation. But every decision is re-derived against our contracts.
4. **Reject its weaknesses on purpose.** Where `vsample` is weaker than our contracts, ours wins — always.

**Where to look, per system (the magic — intent only).**

| Building… | Tour these in `vsample/` | Take the intent, rebuild to |
|-----------|--------------------------|------------------------------|
| The Base engine | `app/Traits/Bases/HasBase{Repository,Controller,Service,Model,Request,Resource}.php`, shells in `app/Repositories/BaseRepository.php` etc. | UUIDv7 strings, `Context`, our envelope |
| Unified controller across roles | `app/Http/Controllers/Controller.php` + `HasBaseController`'s `defaultScopes()`/`defaultPermissions()` keyed by `user_role()` | `Context` role/tenant tag — **never** `user_role()` globals or per-request statics |
| Routes / action set | `routes/apis/admin.php` (glob+closures), `routes/apis/shared.php`, `routes/apis/client.php` | explicit reusable **blocks** in `routes/apis/shared.php`, string handlers, `route:cache`-safe |
| Relations magic | `app/Traits/Model/HasRelations.php`, `HasDeepRelations.php` (schema-derived + deep dispatch) | cleaner schema-derived relations; relation dispatch via controller actions, not closures; no external relation libs |
| RBAC | `app/Traits/Model/Permissions/*` (hand-rolled roles + special per-record permissions) | hand-built, cleaner/stronger/safer — **never trust client-supplied permissions** |
| Search / stats | `app/Traits/Model/Search/*` | bounded, whitelisted, provider-swappable |
| Support / DSL | `app/Helpers/*` (`Response`, `Cache`, `Request`, `Api`, `Public`) | `app/Support/*` reimplemented stronger, with stronger names, SaaS-scoped |

**Hard NOs carried over from the contracts.**
- The response shape differs: `vsample`'s flat `Helpers/Response.php` is replaced by our uniform
  `{status, data|message, errors}` envelope. Do **not** port the old shape.
- IDs are **UUIDv7 strings**, not `int` — do not copy `int $id` signatures from `vsample`.
- `tenant_id`, fail-closed scope, and RLS are ours — `vsample` is single-context; do not assume its tenancy model.
- **No route closures, no `glob()` route registration, no per-request statics/globals** — even though `vsample`
  does all three.

**Before writing any `support/` or `trait/` file:** tour `vsample`'s `app/Helpers/*` + `app/Traits/*` first,
then implement ours stronger, with stronger names, building only what the current system needs.
