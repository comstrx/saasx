# AGENTS.md — SaasX `server` (Laravel API)

> Authoritative contract for any agent working in this project. Read it fully before doing
> anything, then work to it **without deviation**. Assume a future session may be a weaker
> model: everything you need is spelled out here. The README's "Technical Stack" section is
> OUTDATED (it says Rust) — **the code and this file are ground truth**.
>
> Scope: this file governs `/var/www/projects/saasx/server` only (the Laravel API).

---

## START HERE (new session, zero context)

1. Read this whole file if exists, then **`vision.txt`** (the owner's raw messages from the founding
conversation — the source *intent*; AGENTS.md is the distilled contract, `vision.txt` is the "why").
2. Read ground truth: `composer.json` + `composer.lock`, `.env` /
`.env.example`, `config/*` (NEVER assume versions or shape). 3. For whatever area you will touch,
**tour `server/vsample/`** first to see how it was done there (intent only — Block 3). 4. Then build
to the contracts below, in the exact code style, with zero further questions.

---

## BLOCK 1 — The Project

**What it is.** A premium **multi-tenant, multi-panel, multi-business SaaS platform** — an
*infrastructure for operating and monetizing businesses*, not a store builder, not a marketplace
clone, not just a booking engine. One tenant gets a full branded business ecosystem.

- **Project name: `SaasX`** (`APP_NAME=Saasx`). The org / domains live under **comstrx**
  (`comstrx.com`, `github.com/comstrx/saasx`).
- **Monorepo** root is `/var/www/projects/saasx`. Parts: `server` (this — Laravel API, **Phase 1**),
  `admin` & `client` (Next.js), `engine` (Rust/Actix — **Phase 2, deferred**), `mobile`, `infra`, `docs`.
- `server/vsample/` = the owner's **old** Laravel project (~1.5y). **Reference for intent ONLY,
  never copied, never deleted.** See Block 3.

**Tenancy model.** Shared DB + **shared schema + `tenant_id` column**, with Postgres **RLS as
defense-in-depth** (app-level global scope is the primary isolation). Chosen because the layered
"business-on-top-of-business" model implies *many small tenants*.

**Surfaces / panels (6 + guest).** `super`, `admin`, `vendor`, `affiliate`, `delivery`, `client`,
and public `guest`. Each panel = its own API route file **and** its own Postman collection, kept as
a strict 1:1 mirror: `routes/apis/<panel>.php` ↔ `routes/collections/<panel>.json`.
- Spelling is **`affiliate`** everywhere (route prefix, role, permissions `*_affiliate`) — never "affiliator".
- **`super` = top-level owner panel**, the platform owner. Cross-tenant. Its API = the full `admin`
  resource set **plus** a `tenants` resource (manage every tenant and all of its vendors / clients /
  affiliates / deliveries / everything). The tenant middleware, on detecting a `super` user,
  **disables tenant scope**; reads span/filter by tenant; writes target a tenant via a validated
  `tenant_id` in the request body. `super` is a first-class **role** (`tenant_id = NULL`).

**Per-tenant chain.** Every tenant owns its OWN full chain — its vendors, clients, affiliates,
deliveries, products, orders, wallets, etc. All of these are tenant-scoped (`tenant_id`), and their
relationships stay inside the tenant. No cross-tenant leakage.

**v1 goal:** lay the fundamentals correctly and get the database right — multi-tenancy, identity +
RBAC, multi-vendor, multi-product-type, the actor chain, plans/feature-gates. Advanced subsystems
follow once the spine is solid.

**Subsystems (target designs — all "swap a driver / add one file"):**
- **Search:** Elasticsearch as a *swappable provider* (ES driver first, OpenSearch-compatible;
  lighter driver acceptable in dev). Replaces vsample's DB-only search.
- **Events / message broker:** all publishing goes through the **`app/support/event/` abstraction** —
  `App\Support\Event::publish(event, payload, key)` backed by a swappable `Driver` interface. **No
  broker runs in v1**; default driver = Redis/Horizon. Adding ANY broker later (Redpanda/Kafka/SQS/
  NATS…) = **ONE new `Driver` file + config**; callers never change and business code never references
  a broker directly. (Add a transactional `outbox` table when durable delivery is needed.)
- **Orders:** state machine + domain events emitted via the events abstraction above.
- **Idempotency:** an `Idempotency-Key` request header → middleware stores `key→response` under a
  lock, scoped per tenant+user+endpoint → safe retries, no duplicate side effects.
- **Payments:** `PaymentGateway` contract + `StripeDriver` (fake creds are fine) + manager + webhook
  pipeline + **full lifecycle state machine** (intent→authorize→capture→refund→dispute→payout).
  Adding a provider = ONE file implementing the contract + registering it.
- **Cache:** a provider with a full DSL (get/read/set/update/remember/refresh/forget/**index/reset**/
  flush) and **indexed (tag) partial invalidation**, behind a neutral interface (Redis first, swappable).
- **N+1:** eliminated via auto eager-load from auto-discovered relations + requested includes;
  `Model::preventLazyLoading()` in dev as the tripwire.
- **Chat (realtime, CRM-style — a flagship system):** conversations/rooms + participants + messages +
  per-participant message state (read/delivered/starred/pinned/deleted) + replies + optional context
  (product/order). All tenant-scoped. **Conversation types across roles:** client↔vendor,
  client↔support(=admin), vendor↔admin, delivery↔client, delivery↔vendor, affiliate↔vendor,
  support↔{client,vendor,affiliate,delivery}, and **admin↔super (`super→tenant` support)**. Realtime
  via **Reverb**, events broadcast **immediately** (`ShouldBroadcastNow`) to each participant's
  presence channel **plus a shared tenant-admin channel** → every admin/support session is live-synced
  (CRM shared inbox). **Oversight:** the tenant admin can read client↔vendor & admin↔client chats in
  its tenant; **super reads everything across all tenants** (RBAC + tenant scope + channel auth). A
  **fixed chat widget** lives on every frontend (client site + vendor/affiliate/delivery/admin
  dashboards) → opens support chat to the tenant admin; the admin's widget opens super support. **AI
  bot** auto-replies via a swappable AI provider **in the same thread**, with seamless human
  (admin/support) **handoff** (`conversation.mode = bot|human`). Frontend surfaces chat types as tabs.
- **Mail:** ALWAYS **queued** (`ShouldQueue`), sent via the Mailgun API mailer (see Block 2). (Note the
  contrast: chat broadcasts immediately/`ShouldBroadcastNow`; mail is queued.)
- **AI:** a **swappable provider** (default **Claude / Anthropic, latest models**) under
  `app/support/…`; powers the chat bot and AI discovery. Adding/replacing a provider = ONE file.

---

## BLOCK 2 — Architecture, Stack, Database, Tooling & Code Style

**Stack (confirmed in `composer.json` — never assume versions, read the lockfile):**
PHP `^8.5` · Laravel `^13` · Octane + **FrankenPHP** · Horizon · Reverb · Sanctum.
PostgreSQL 16 · Redis 8 (logical DBs: default/cache/queue/horizon/reverb/session/rate_limit/lock).
**Deferred (roadmap, NOT v1):** Redpanda, Rust/Actix `engine` via gRPC, Elasticsearch (→ OpenSearch at scale).

**Auth.** Sanctum, **stateless Bearer tokens everywhere** (SPA cookie mode breaks with many custom
domains). Every token is **bound to a tenant**; middleware asserts `token.tenant == domain.tenant`.
v1 tenant resolution = subdomain + Bearer token; custom domains + FrankenPHP/Caddy on-demand TLS later.
API prefix `/v1`.

**Mail.** Mailgun via its **HTTP API transport** — the `mailgun` mailer in `config/mail.php`
(`transport: mailgun`, backed by `symfony/mailgun-mailer` + `symfony/http-client`; creds in
`config/services.php → mailgun`). **NEVER SMTP.** A `failover` mailer chain exists (mailgun included);
send through the `mailgun` (or `failover`) mailer.

**Design pattern: repository pattern, layered.** Two views of the same stack:

- **Build / dependency order (inner → outer):**
  `support → traits → bases → repository → service → controller → request → middleware → route`
- **Runtime request flow (outer → inner):**
  `route → middleware → request (validation) → controller → service → repository → model (+ traits) → support`

**Abstraction philosophy (the whole point — abstract at the highest level):**
- The **schema + naming conventions are the single source of truth**: relations, routes, permissions,
  fields are DERIVED, not hand-written.
- Generic behavior is pushed DOWN into the engine (`support → traits → bases`); concrete classes are
  **pure declaration**, not implementation.
- Capabilities are opt-in **trait "DNA"** mounted on models.
- Every resource exposes the **same uniform surface** → predictable, self-similar code & API.
- Max automation, min surface. **"Magic" is welcome** when it is *deterministic automation* the team
  understands (auto-resource routes, schema-derived relations) — never accidental obscurity. But it
  MUST be **Octane-safe and `route:cache`-safe** (explicit reusable route blocks, no route closures,
  no boot-time globbing).

**Target DX (what you write per new resource):**

```
migration  +  Model (use traits)  +  Repository::fields()  +  Service (overrides only)  →  full auto API
```

The engine materializes CRUD / search / stats / files / permissions / relations / nested relations /
tenant-scope. Concrete classes stay near-empty.

**Code structure = FLAT (not modular domains).** All in one level each:
`app/Models/*`, `app/Repositories/*Repository.php`, `app/Services/*Service.php`,
`app/Http/Controllers/*Controller.php`, `app/Http/Requests/*`, `app/Http/Resources/*`.
A single unified `XxxController` serves all panels; behavior differs by the **active panel role**.

**`app/Support/` & `app/Traits/` layout.** First level = **folders only**, never loose files. Each
feature is a folder whose **`index.php` is the public adapter / final workflow** you call from
outside (internal pieces live in sibling files). Even a one-file helper becomes `folder/index.php`.
- `app/Support/` = native / infrastructure helper classes ONLY (php, io, db, cache, net, str, num,
  lists, parse, validate) — **ZERO business logic**. `cache/` and `database/` are adapters behind a
  **neutral interface** (keep the interface even though Redis/Postgres-only now).
- `app/Traits/` = reusable model DNA (tenancy, relations/deep-relations, files, permissions, search,
  cache, social) mounted on models. `app/Traits/Bases/` holds the **`HasBaseXxx` engine traits** — the
  actual reusable logic for every layer (see "The Base engine" right below).

**Support layer — canonical domain map (the blueprint).** 24 native/infra domains, ZERO business
logic. Each folder = a domain; `index.php` = the public facade (`App\Support\<Name>`); internal
PascalCase files (`namespace App\Support\<Name>`) hold the pieces. `†` = adapter (a `Driver` interface
+ a concrete `RedisDriver`/`LocalDriver`/… + a manager in `index.php`; swap the backend by adding ONE
Driver file). Files are created on demand (systems-first) — this map is the contract for naming/shape.

```
app/Support/
├── arr/         Arr         Dot Shape Filter Map Group Sort Tree
├── cache/   †   Cache       Driver RedisDriver Key Tag Entry Scope
├── cast/        Cast        Scalar Collection Enum                          mixed -> typed scalar/enum/array
├── context/     Context     Tenant Panel User Scope Meta                    Octane-safe wrapper over Laravel Context (the role/tenant/super tag)
├── database/    Database    Uuid Transaction Rls Query Schema Column Sort Keyset
├── date/        Date        Clock Range Format Parse
├── event/   †   Event       Driver RedisDriver Payload Pending Key Outbox   App\Support\Event::publish(event,payload,key); Redis/Horizon default, outbox-ready
├── file/        File        Path Name Mime Size Hash Stream
├── http/        Http        Client Request Response Header Status Retry      outbound; SSRF guard via net/Ip
├── json/        Json        Encode Decode Path Shape Merge
├── lock/    †   Lock        Driver RedisDriver Mutex                         distributed lock (serves idempotency)
├── log/         Log         Context Channel Entry Redact                     Redact = never log secrets
├── mail/        Mail        Mailer Message Address                           always queued, Mailgun API transport
├── net/         Net         Ip Url Domain Host Port                          Domain = tenant subdomain resolution
├── num/         Num         Money Percent Range Format Random                Money = integer minor-units math only; the ledger is business
├── parse/       Parse       Csv Query Boolean Number Locale
├── queue/   †   Queue       Driver Dispatch Payload Tenant Retry             Tenant = stamp/restore tenant ctx across jobs
├── request/     Request     Input Header Fingerprint Idempotency Locale Tenant
├── response/    Response    Envelope Failure Pagination Meta                 uniform success/fail JSON envelope
├── security/    Security    Token Hash Signature Secret Sanitize Encrypt     wrappers only — no DIY crypto
├── storage/ †   Storage     Driver LocalDriver S3Driver ObjectKey Upload Visibility TemporaryUrl
├── str/         Str         Casing Slug Clean Matches Random Template Inflect
├── throttle/ †  Throttle    Driver RedisDriver Limit                         per-plan rate limiting
└── validate/    Validate    Rule Shape Field Type Message                    predicates + Laravel Rule objects (Uuid7, Slug, …)
```

Rules for this layer:
- No class name may be a reserved keyword — hence `Boolean` (not `Bool`), `Casing` (not `Case`),
  `Matches` (not `Match`), and `cache/Tag` (not `Index`, which collides with `index.php`).
- Facades intentionally shadow Illuminate equivalents (`Str`, `Arr`, `Cache`, `Date`, `Log`, `Mail`,
  `Queue`, `Storage`, `Http`, `Request`, `Response`, `Context`). Never alias-import both in one file.
- `cache`, `lock`, `throttle`, `queue`, `event`, `storage` are the swappable adapters (`†`).
- `context` is the single source of truth for the active role/tenant/super tag; `database/Rls` and
  `queue/Tenant` read from it.

**The Base engine — how `BaseXxx` in every layer works (CORE PATTERN — this IS the magic).**
The real logic of each layer lives in a `HasBaseXxx` **trait** under `app/Traits/Bases/`. Each layer
has a thin **`BaseXxx` shell class** (in that layer's own folder) that does nothing but `use` its
trait. Concrete classes **extend** the shell and stay almost empty — declaring only what is unique to
them (e.g. `fields()`, an override). Put new shared behaviour in the **trait**, NEVER in a concrete class.

| Shell class (its file)                         | `use`s trait (`App\Traits\Bases\…`) |
|------------------------------------------------|-------------------------------------|
| model in `app/Models/…`                        | `HasBaseModel` (+ DNA traits)       |
| `app/Repositories/BaseRepository.php`          | `HasBaseRepository`                 |
| `app/Services/BaseService.php`                 | `HasBaseService`                    |
| `app/Http/Controllers/Controller.php` (base)   | `HasBaseController`                 |
| `app/Http/Requests/BaseRequest.php`            | `HasBaseRequest`                    |
| `app/Http/Resources/BaseResource.php`          | `HasBaseResource`                   |
| `app/Console/Commands/BaseCommand.php`         | `HasBaseCommand`                    |

```php
// app/Repositories/BaseRepository.php — thin shell
namespace App\Repositories;
use App\Traits\Bases\HasBaseRepository;
use Illuminate\Database\Eloquent\Model;

class BaseRepository {

    use HasBaseRepository;

    public function __construct ( protected Model $model ) {

    }

}
```

```php
// app/Services/CategoryService.php — concrete stays near-empty
namespace App\Services;
use App\Repositories\CategoryRepository;

class CategoryService extends BaseService {

    public function __construct ( protected CategoryRepository $repository ) {

        parent::__construct($repository);

    }

}
```

All API output flows through `BaseResource` / a Support response helper into a **uniform `success` /
`fail` JSON envelope** (match vsample's `Helpers/Response.php` shape when first building it).

**Role / tenant "tag" (Octane-safe).** The active panel role + `tenant_id` + super flag live in
Laravel **`Context`** (request-scoped), set by the panel middleware, read by the base
controller/service to compute role-specific scopes/permissions. Roles are **many-to-many**; the panel
route group declares the expected role and the middleware verifies membership (multi-role users
supported). NEVER use long-lived singletons/statics or container `app('store')` bindings for this.

**Database conventions.**
- **UUIDv7** primary keys everywhere.
- **`tenant_id`** on every tenant-owned table; composite uniques `unique(tenant_id, …)`; hot indexes
  lead with `tenant_id`. Migrations are central, reversible, additive-first.
- **RLS** is defense-in-depth: transaction-local `set_config('app.tenant_id', ?, true)` (never session
  `SET`), app connects as a **non-owner** role, tables `FORCE ROW LEVEL SECURITY`. The Eloquent global
  scope (`BelongsToTenant`) is the *primary* isolation; RLS catches what code forgets.
- Money: **double-entry ledger, integer minor units** (never floats). Idempotency keys on financial
  endpoints. Per-plan rate limiting.

**Autoload.** PSR-4 `App\ → app/` for normal classes (file name = class name). For the `index.php`
folder convention in `app/support` & `app/traits`, use **classmap** with clean class names:
`support/str/index.php` → `namespace App\Support; class Str` → call `App\Support\Str::x()`; internal
files in that folder use `namespace App\Support\Str`. **Run `composer dump-autoload` after adding a
new support/trait file** (classmap is static). Ugly FQCNs are hidden behind curated global helpers.

**Tooling & gates.**
- **NO formatter (Pint is removed / never run).** Why: the required hand-style below is intentionally
  not PSR-12 / Pint-compatible, and consistency with the owner's hand matters more than PSR-12.
- **Gates = Larastan + tests + `declare(strict_types=1)`.** `phpstan.neon`: **level 8** with
  `missingType.iterableValue` suppressed (`ignoreErrors: [{ identifier: missingType.iterableValue }]`),
  `vsample` excluded. A change is "done" only when `phpstan` is green and tests pass. Never suppress
  errors with `@phpstan-ignore`, baselines, casts, or `any`-style widening — fix the root cause.

**CODE STYLE CONTRACT — match it exactly; code must be indistinguishable from the owner's hand.**
- 4-space indent. K&R braces (opening brace on the same line).
- **Declarations and control structures: a space before `(` AND spaces inside it:**
  `public function index ( Request $req ): JsonResponse {`, `if ( $cond )`, `match ( $x )`,
  `foreach ( $a as $b )`, `catch ( \Throwable $e )`. (Native function *calls* use no inner spaces:
  `array_merge($a, $b)` — match the surrounding code.)
- **Breathing bodies:** a blank line right after a method's opening `{` and right before its `}`.
- **NEVER a one-line function/method body** — always the multi-line breathing form, even for a single
  statement or an empty body. No `function x () { return $y; }`, no `) {}`.
- `namespace` then `use` lines immediately (no blank line between); blank line before the class.
- Multiple properties on one line sharing a modifier; align `=>` in multi-line array literals.
- Heavy use of `match`, arrow fns `fn() =>`, ternaries, `??`, destructuring `[$a, $b] = …`,
  `compact()`, inline guard clauses (`if ( !$id ) return …;`).
- `declare(strict_types=1);` at the top of every file (added automatically by stubs). Full param &
  return types. Array-generic PHPDoc (`@return list<int>`) is **optional** — only where it adds real
  value; never forced.
- **NO comments or docblocks** except absolute necessity (a one-line type-only `@param`/`@return`
  where genuinely needed is allowed — that is typing, not prose).
- **Naming:** clear, concise nouns; never verbose self-describing file names. Model traits `HasXxx`,
  base traits `HasBaseXxx`, concrete `XxxService` / `XxxRepository` / `XxxController`.

Example of the exact style:

```php
<?php

declare(strict_types=1);

namespace App\Support;

class Cast {

    public static function string ( mixed $value ): ?string {

        if ( is_array($value) || is_object($value) ) return null;

        $value = trim((string) $value);

        return in_array($value, ['', 'null', 'undefined'], true) ? null : $value;

    }

}
```

---

## BLOCK 3 — How To Build (working method & execution)

**Build SYSTEMS, not layers. (systems-first, vertical — NEVER layer-by-layer.)**
Do not pre-build a whole layer (no "build all of Support first"). Pick a system and drive it through
the layers. A system distributes its requirements across the layers as you go.

**Order for a system** (example: `auth`):
1. **Migrations** — tables (e.g. users, roles, permissions, pivots) with UUIDv7, `tenant_id`,
   composite uniques.
2. **Models** (+ trait DNA).
3. **Traits** needed by the models.
4. **Repository** (`fields()` + overrides), **Service** (overrides only), **Controller** (thin),
   **FormRequest** (mandatory validation), **Resource**.
5. **Middleware** + **routes** (explicit reusable route blocks per panel).
6. **Postman collection** entry in the mirror file (same change).

While doing the above, when you need a helper for strings / cache / numbers / lists / network /
io / db: **go to `app/Support` — use it if it exists; if not, create it in the right file; if the
right file/folder doesn't exist, create `folder/index.php`** (then `composer dump-autoload`). Same
rule for traits. Build only what the current system needs.

**ALWAYS tour `vsample` first for the system you're building.** Trace how that same system was done
there — follow its footprints across models / traits / services / repositories / routes / migrations,
see how the "magic" was wired and the approach taken. Use it to regain confidence in the automation,
surface ideas you'd otherwise miss, and understand the intent. Then build **ours fresher / stronger /
safer**. `vsample` is old and weaker — **it is NEVER the implementation, only a source of intent and
ideas.** Keep going back and forth to it throughout the work.

**Honor the contracts (Block 2) on every line:**
- Exact code style. **Zero comments.** Clear file names. `declare(strict_types=1)`. Larastan green.
  No formatter.
- Routes are **explicit** reusable route blocks per panel (NOT glob/reflection auto-registration).
  They expand the standard resource action set with `has:<permission>` middleware, are deterministic,
  and **`route:cache`-safe** (no route closures — dispatch through controllers). Each resource you add
  → add its folder + requests to the matching `routes/collections/<panel>.json` with request body,
  headers (`Authorization: Bearer {{access_token}}`, `Accept: application/json`, `Locale`, and
  `Idempotency-Key: {{$guid}}` on writes), and saved response examples. The `apis ↔ collections`
  mirror stays 1:1, updated in the same change.

**Multi-tenant & Octane rules (non-negotiable — these are correctness, not gold-plating):**
- `BelongsToTenant` global scope is **fail-closed** and primary; RLS is defense-in-depth.
- No per-request state in singletons/statics. Tenant context lives in `Context`; reset tenant-scoped
  state on Octane `RequestTerminated`.
- Queued jobs carry `tenant_id` in the payload, restore tenant context at job start, reset after.
- Redis cache keys are namespaced per tenant. `super` uses an **audited** `withoutTenancy()` escape hatch.

**Security / quality (always):**
- Validation is **mandatory** on every write (FormRequest). Authorization via real, hand-rolled RBAC
  (Gate/policies) — **never trust client-supplied permissions**.
- **No silent error-swallowing** (no empty `catch`). Keyset pagination. Bounded / whitelisted search.
- Untrusted input is hostile: validate at the boundary, parameterize queries.

**Pragmatism — strongest practices, but NO over-engineering ("بدون أفورة").**
Not 100% sacred, not 100% secure — the bar is "serves its purpose excellently in production". Delete
before adding; reuse before introducing a dependency. **Build it ourselves — no new external libraries
except in extreme necessity** (auth, RBAC, search/cache/payment providers are hand-built). The only
"don't roll your own" exceptions: cryptography and money rounding/ledger primitives — use core /
battle-tested code there.

**Process.**
- Do **not** execute build work unless asked; when planning, plan. Confirm before any outward or
  irreversible action.
- After a task, report: gate results (command, exit code, error count), what changed, any deviation
  and why, anything left unverified.
