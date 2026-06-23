# overview.md — SaasX `server` (the master build doc)

> The Laravel API at `/var/www/projects/saasx/server`, **Phase 1** of the SaasX monorepo.
> This file is **how the system must be built**; `contracts/*.md` are **LAW** (non-negotiable, single-concern).
> A future session may be a weaker model: everything needed to work with **zero questions** is in this file
> and the contracts. The repo `README.md` "Technical Stack" is OUTDATED (it says Rust) — **the code, this
> file, and the contracts are ground truth.**

## Read order — every turn, before touching anything

1. `agents/overview.md` (this file) — the product, its systems, the build method, the agentx protocol.
2. `agents/contracts/*.md` — the enforceable laws. Re-read **all seven** every turn:

| Contract | Governs — read it for |
|----------|-----------------------|
| `contracts/arch.md` | Layers, the Base engine, layer skeletons, Support map, `Context`, routes, DB/tenancy — **where things live**. |
| `contracts/design.md` | Repository pattern, schema-as-truth, DNA traits, swappable drivers, the "magic" policy — **how to think**. |
| `contracts/style.md` | The exact hand-written code style. Code must be indistinguishable from the owner's. |
| `contracts/naming.md` | File / class / method / route / permission / DB naming and the `index.php` folder convention. |
| `contracts/tools.md` | Stack, versions, libraries, the gate, autoload, what is forbidden. |
| `contracts/vsample.md` | How to use the old `vsample` project (intent only — never copied, never deleted). |
| `contracts/tolerance.md` | Pragmatism vs over-engineering, what is sacred, security non-negotiables, process & reporting. |

3. Ground truth before claiming any version/shape: `composer.json` + `composer.lock`, `.env*`, `config/*`.
4. For the system you will touch: **tour `server/vsample/`** first (intent only — `contracts/vsample.md`).

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

**Tenancy.** Shared DB + **shared schema + `tenant_id` column**. The Eloquent global scope
(`BelongsToTenant`, fail-closed) is the **primary** isolation; Postgres **RLS is defense-in-depth**. Chosen
because the layered "business-on-top-of-business" model implies many small tenants.

**Panels (6 + guest).** Each panel = its own API route file **and** its own Postman collection, kept a
strict 1:1 mirror: `routes/apis/<panel>.php` ↔ `routes/collections/<panel>.json`. A single unified
`XxxController` serves all panels; behaviour differs by the **active panel role** (`arch.md` §6, the `Context` tag).

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
span/filter by tenant; writes target a tenant via a validated `tenant_id` in the request body. The escape
hatch is an **audited** `withoutTenancy()` — never an ambient default.

**Vendor onboarding & tenant commission (booking.com-style).** A guest on the client storefront clicks
"become a partner" → is redirected to that tenant's **vendor-panel domain** → registers, verifies,
optionally subscribes to a plan (free/premium) → adds products that surface on the tenant's storefront. The
tenant **admin earns a commission** on every order/booking of that vendor's products (per-tenant marketplace economics).

**v1 API scope (decided 2026-06-16).** Seed **ALL roles** (super, admin, vendor, affiliate, delivery,
client) + their permissions in the DB now. Expose **APIs / route files / collections for `super`, `admin`,
`vendor`, `client` ONLY** in v1. **`affiliate` and `delivery` get NO API yet** (DB rows exist, surface does not).

**v1 goal.** Lay the fundamentals correctly and get the database right — multi-tenancy, identity + RBAC,
multi-vendor, multi-product-type, the actor chain, plans/feature-gates. Advanced subsystems follow once the
spine is solid. **Tests are deferred until v1 ships** (`contracts/tools.md`).

---

## 2 — The systems map

Build **systems, not layers** (§4). Each system is a vertical that distributes its requirements across the
layers. Status: **[v1]** build now · **[v1·db]** seed/schema now, no API yet · **[design]** design the
abstraction now so adding it later is one file · **[later]** deferred.

| System | Status | Essence |
|--------|--------|---------|
| **Identity & auth** | [v1] | Users, Sanctum **stateless Bearer**, tenant-bound tokens, verification/OTP, password reset. Subdomain + token tenant resolution. |
| **RBAC** | [v1] | Hand-rolled roles + permissions + per-record special permissions. Many-to-many roles; panel group declares the role, middleware verifies. **Never trust client-supplied permissions.** |
| **Multi-tenant core** | [v1] | `tenant_id` everywhere, `BelongsToTenant` fail-closed scope, RLS defense-in-depth, `Context` role/tenant tag, tenant-stamped jobs. |
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

Subsystem rule: every `[design]`/`†` system is **"swap a driver / add one file"** — a `Driver` interface +
concrete driver(s) + a manager in `index.php`. Callers never reference a backend directly (`design.md` §6).

---

## 3 — The architecture spine

Repository pattern, layered. Two views of one stack (full law in `arch.md`):

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
DNA traits, never in a concrete class** (`arch.md` §3, `design.md` §3). The schema + naming conventions are
the **single source of truth**: relations, routes, permissions, and fields are **derived, not hand-written.**

---

## 4 — How to build (working method)

**Systems-first, vertical. NEVER layer-by-layer.** Do not pre-build a whole layer. Pick a system, drive it
through the layers; the system distributes its requirements across them as you go.

Order for a system (example: `auth`):
1. **Migrations** — tables (users, roles, permissions, pivots…) with **UUIDv7**, `tenant_id`, composite uniques.
2. **Models** (+ DNA traits).
3. **Traits** the models need (engine `HasBaseXxx` and/or DNA `HasXxx`), built on the Support DSL.
4. **Repository** (`fields()` + overrides) · **Service** (overrides only) · **Controller** (thin) ·
   **FormRequest** (mandatory validation) · **Resource** (envelope shaping).
5. **Middleware** + **routes** (explicit reusable blocks in `routes/apis/shared.php`, `route:cache`-safe — `arch.md` §8).
6. **Postman collection** entry in the mirror file, **same change** (`arch.md` §8).

While building, when you need a string/cache/number/list/net/io/db helper: **go to `app/Support` — use it if
it exists; if not, create it in the right file; if the file/folder doesn't exist, create `folder/index.php`**
then `composer dump-autoload`. Same for traits. Build **only what the current system needs** — no speculative
breadth. **Before writing any `support/` or `trait/` file, tour `vsample`'s `app/Helpers/*` + `app/Traits/*`
first** (intent only — `vsample.md`), then build ours stronger.

**Always tour `vsample` first** for the system you build: trace its footprints across
models/traits/services/repositories/routes/migrations, see how the magic was wired, then build **ours
fresher / stronger / safer**. `vsample` is old and weaker — intent and ideas only, never the implementation.

**Per-resource definition of done.** A resource is complete only when ALL hold:
migration (UUIDv7 + `tenant_id` + composite uniques) · model with DNA traits · `Repository::fields()` ·
`Service` (overrides only) · thin `Controller` · `FormRequest` validating every write · `Resource` shaping the
envelope · route block wired per panel · `collections/<panel>.json` mirror updated · **gate green**.

---

## 5 — v1 definition of done

- Multi-tenancy correct end-to-end: fail-closed scope, RLS, `Context` tag, tenant-stamped jobs, per-tenant cache keys.
- Identity + RBAC complete; all six roles + permissions seeded.
- The Base engine (all `HasBaseXxx` + the shells) and the needed DNA traits exist and are exercised by real resources.
- Live APIs for `super`, `admin`, `vendor`, `client` with the `apis ↔ collections` mirror kept 1:1.
- Multi-vendor, multi-product-type, the actor chain, orders state machine, wallets/ledger, plans/feature-gates wired.
- Payments: Stripe driver + lifecycle behind the contract. Mail queued via Mailgun API. Storage via s3/MinIO.
- Events/search/AI/chat **abstractions** in place (drivers minimal) so each is "add one file" later.
- **Gate green**: Larastan level 8, `declare(strict_types=1)` everywhere, no formatter, no suppressions (`tools.md`).

---

## 6 — The agentx operating protocol (how a run works)

`agentx` (at `/var/www/tools/agentx`) orchestrates a **competing team** of workers (Claude via Agent SDK,
codex via `codex exec`) through two phases against this `agents/` tree, with a **deterministic gate** as the
real judge — never self-report. Roster & gate come from agentx `.env`; `GATE_CMD` for this project is
`composer lint` (Larastan level 8). Files this team reads/writes:

```
agents/
├── overview.md            this file (read every turn)
├── contracts/*.md         the seven laws (read every turn)
├── requires/NNNN-name.md  INPUT: a requirement the owner drops in
├── tasks/NNNN-{name}.md   architects fan requirements into ordered, traceable tasks
├── reports/requires/*.md  architect reports (one per agent; last line `ship it` = done)
├── reports/tasks/*.md     executor reports (one per agent; last line `ship it` = done)
├── review.md              manager's revise notes (transient)
├── control.md             manager verdict: `ACTION: ship|revise` (transient)
├── gate.log               last gate output (transient)
├── decisions/<date>-NNNN.md  one dense decision record per run
└── history/…              archived requires/tasks/reports per run
```

Phases (auto-resolved: `requires` present → `arch` then `exec`; only `tasks` → `exec`; empty → "nothing to do"):

- **Architecture.** Architects turn each `requires/NNNN-name.md` into small, ordered, **traceable**
  `tasks/NNNN-{requirement-name}.md` — each minimal, independently executable, unambiguous, no drift. They
  **plan, never write project code.** They loop until every architect report ends with exactly `ship it`,
  then the manager judges (`control.md` → `ship` accepts, `revise` sends back with `review.md` notes).
- **Execution.** Executors implement `tasks/` **in order, smallest correct change**. The gate runs **after
  every executor**; a red gate blocks progress — the same executor must read `gate.log` and fix until green.
  Round ends when the gate is green AND every executor report says `ship it`; then the manager judges.
- **Decision.** The manager writes one dense `decisions/<date>-NNNN.md`; the run archives `requires`/`tasks` to `history/`.

**Worker contract (every turn).** Re-read `overview.md` + `contracts/*.md`. Honour every contract on every
line: exact style, zero comments, clear names, `declare(strict_types=1)`, systems-first, tour `vsample`, no
over-engineering. **Accept correct prior work as-is**; change another agent's code ONLY for a concrete,
reported reason (real bug, contract violation, failed gate, logic/business error, security risk, scope
drift). **The gate is the judge, not self-report.** End your report with exactly `ship it` only when the work
is complete, correct, contract-compliant, and the gate passes. Confirm before any outward/irreversible action.
