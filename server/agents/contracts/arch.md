# contracts/arch.md — Architecture (LAW)

> Where things live and how a request flows. This file is the structural law. Pair it with
> `design.md` (how to think). Both are re-read every turn.

## 1 — Layers

Repository pattern, layered. Two views of one stack:

- **Build / dependency order (inner → outer):**
  `support → traits → bases → repository → service → controller → request → middleware → route`
- **Runtime request flow (outer → inner):**
  `route → middleware → request (validation) → controller → service → repository → model (+ traits) → support`

Each layer depends only on the layers **inner** to it. A controller never touches a model directly; it
goes through its service → repository. Support has **zero** business logic and depends on nothing in `app`
except sibling Support. Traits sit on top of Support; bases sit on top of traits.

## 2 — Code structure is FLAT (not modular domains)

All classes live one level deep in their layer folder:
`app/Models/*`, `app/Repositories/*Repository.php`, `app/Services/*Service.php`,
`app/Http/Controllers/*Controller.php`, `app/Http/Requests/*`, `app/Http/Resources/*`.
A single unified `XxxController` serves all panels; behavior differs by the **active panel role** (§6).

## 3 — The Base engine (CORE PATTERN — this IS the magic)

The real logic of each layer lives in a `HasBaseXxx` **trait** under `app/Traits/Bases/`
(`namespace App\Traits\Bases`). Each layer has a thin **`BaseXxx` shell class** that does nothing but
`use` its trait. Concrete classes **extend** the shell and stay almost empty — declaring only what is
unique (e.g. `fields()`, an override). **Put new shared behaviour in the trait, NEVER in a concrete class.**

| Shell class (its file) | `use`s trait (`App\Traits\Bases\…`) |
|------------------------|-------------------------------------|
| model in `app/Models/…` | `HasBaseModel` (+ DNA traits) |
| `app/Repositories/BaseRepository.php` | `HasBaseRepository` |
| `app/Services/BaseService.php` | `HasBaseService` |
| `app/Http/Controllers/Controller.php` (base) | `HasBaseController` |
| `app/Http/Requests/BaseRequest.php` | `HasBaseRequest` |
| `app/Http/Resources/BaseResource.php` | `HasBaseResource` |
| `app/Console/Commands/BaseCommand.php` | `HasBaseCommand` |

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

## 4 — `app/Traits/` layout (exactly two sub-folders, nothing loose at root)

- **`app/Traits/Bases/`** (`namespace App\Traits\Bases`) — the `HasBaseXxx` engine traits (§3): the
  reusable logic for every layer. One per layer.
- **`app/Traits/Dna/`** (`namespace App\Traits\Dna`) — opt-in model **DNA**: a giant capability a model
  gains by `use`-ing the trait, e.g. `HasRoles`, `HasPermissions`, `HasFiles`, `HasSearch`, `HasCache`,
  `HasRelations`, `HasState`, `HasTenant` (names illustrative, **not** exhaustive — add what a system
  needs, in the owner's naming style; see `naming.md`).

Every trait in **both** folders is built **on top of the Support DSL** — it calls `App\Support\…` and
never re-implements native/infra work. Traits carry layer/model **behaviour**; Support carries the
std-lib **power** they lean on.

## 5 — `app/Support/` layout & canonical domain map

First level = **folders only**, never loose files. Each feature is a folder whose **`index.php` is the
public adapter / final workflow** you call from outside (internal PascalCase files are siblings). Even a
one-file helper becomes `folder/index.php`. Support is **native / infrastructure helpers ONLY — ZERO
business logic**. `†` = swappable adapter (a `Driver` interface + concrete `RedisDriver`/`LocalDriver`/…
+ a manager in `index.php`; swap the backend by adding ONE Driver file).

```
app/Support/
├── arr/         Arr         Dot Shape Filter Map Group Sort Tree
├── cache/   †   Cache       Driver RedisDriver Key Tag Entry Scope        full DSL + indexed (tag) partial invalidation
├── cast/        Cast        Scalar Collection Enum                        mixed -> typed scalar/enum/array
├── context/     Context     Tenant Panel User Scope Meta                  Octane-safe wrapper over Laravel Context (the role/tenant/super tag)
├── database/    Database    Uuid Transaction Rls Query Schema Column Sort Keyset
├── date/        Date        Clock Range Format Parse
├── event/   †   Event       Driver RedisDriver Payload Pending Key Outbox  Event::publish(event,payload,key); Redis/Horizon default, outbox-ready
├── file/        File        Path Name Mime Size Hash Stream
├── http/        Http        Client Request Response Header Status Retry    outbound; SSRF guard via net/Ip
├── json/        Json        Encode Decode Path Shape Merge
├── lock/    †   Lock        Driver RedisDriver Mutex                       distributed lock (serves idempotency)
├── log/         Log         Context Channel Entry Redact                   Redact = never log secrets
├── mail/        Mail        Mailer Message Address                         always queued, Mailgun API transport
├── net/         Net         Ip Url Domain Host Port                        Domain = tenant subdomain resolution
├── num/         Num         Money Percent Range Format Random              Money = integer minor-units math only; the ledger is business
├── parse/       Parse       Csv Query Boolean Number Locale
├── queue/   †   Queue       Driver Dispatch Payload Tenant Retry           Tenant = stamp/restore tenant ctx across jobs
├── request/     Request     Input Header Fingerprint Idempotency Locale Tenant
├── response/    Response    Envelope Failure Pagination Meta               uniform success/fail JSON envelope
├── security/    Security    Token Hash Signature Secret Sanitize Encrypt   wrappers only — no DIY crypto
├── storage/ †   Storage     Driver LocalDriver S3Driver ObjectKey Upload Visibility TemporaryUrl
├── str/         Str         Casing Slug Clean Matches Random Template Inflect
├── throttle/ †  Throttle    Driver RedisDriver Limit                       per-plan rate limiting
└── validate/    Validate    Rule Shape Field Type Message                  predicates + Laravel Rule objects (Uuid7, Slug, …)
```

This map is the **contract for naming/shape**, not a build list. Files are created **on demand**
(systems-first): build only what the current system needs. The map already lists `response/` and `str/`
which exist — extend, don't duplicate.

Rules:
- No class name may be a reserved keyword — `Boolean` (not `Bool`), `Casing` (not `Case`), `Matches` (not
  `Match`), `cache/Tag` (not `Index`, which collides with `index.php`). See `naming.md`.
- Facades intentionally shadow Illuminate equivalents (`Str`, `Arr`, `Cache`, `Date`, `Log`, `Mail`,
  `Queue`, `Storage`, `Http`, `Request`, `Response`, `Context`). **Never alias-import both in one file.**
- `cache`, `lock`, `throttle`, `queue`, `event`, `storage` are the swappable adapters (`†`).
- `context` is the single source of truth for the active role/tenant/super tag; `database/Rls` and
  `queue/Tenant` read from it.

## 6 — Role / tenant "tag" (Octane-safe — non-negotiable)

The active panel role + `tenant_id` + super flag live in Laravel **`Context`** (request-scoped), wrapped
by `App\Support\Context`. The panel middleware **sets** the tag; the base controller/service **reads** it
to compute role-specific scopes/permissions. Roles are **many-to-many**; the panel route group declares
the expected role and the middleware verifies membership (multi-role users supported).

**NEVER** use long-lived singletons, static properties, or container `app('store')` bindings for
per-request state. Reset tenant-scoped state on Octane `RequestTerminated`.

## 7 — Response envelope (the new contract — NOT vsample's flat shape)

All API output flows through `BaseResource` / `App\Support\Response` into a **uniform** envelope:
- `success → { status: true, data, …extra }`
- `fail → { status: false, message, errors }`

(Already implemented in `app/Support/response/`. Use it; do not invent a second shape.)

## 8 — Routes (explicit, reusable, `route:cache`-safe — NOT vsample's glob)

- Panels: `routes/apis/<panel>.php`, included by `routes/api.php`, prefix `/v1`, per-panel name + middleware.
- Routes are **explicit reusable route blocks** per panel — NOT glob/reflection auto-registration and
  NOT route closures (closures break `route:cache`). Dispatch through controllers.
- The standard resource action set is expanded with `has:<permission>` middleware, deterministic.
- Shared endpoint groups (the action set common to many resources, or to several panels) live in a
  **reusable block** — e.g. a helper/block in an `apis/*.php` file — invoked inside each resource/panel
  that shares it. Do **not** hardcode the name; pick a clear one (see `naming.md`). The intent: write the
  resource action set **once**, apply it everywhere, stay `route:cache`-safe.
- Each resource you add → add its folder + requests to the matching `routes/collections/<panel>.json`
  with request body, headers (`Authorization: Bearer {{access_token}}`, `Accept: application/json`,
  `Locale`, and `Idempotency-Key: {{$guid}}` on writes), and saved response examples. The
  **`apis ↔ collections` mirror stays 1:1, updated in the same change.**

## 9 — Database conventions

- **UUIDv7** primary keys everywhere (`support/database/Uuid`).
- **`tenant_id`** on every tenant-owned table; composite uniques `unique(tenant_id, …)`; hot indexes lead
  with `tenant_id`. Migrations are **central, reversible, additive-first**; no destructive drop in the
  same release as code that still reads the column.
- **RLS** is defense-in-depth: transaction-local `set_config('app.tenant_id', ?, true)` (**never** session
  `SET`), app connects as a **non-owner** role, tables `FORCE ROW LEVEL SECURITY`. The Eloquent global
  scope (`BelongsToTenant`) is the **primary** isolation; RLS catches what code forgets.
- Money: **double-entry ledger, integer minor units** (never floats). Idempotency keys on financial
  endpoints. Per-plan rate limiting.

## 10 — Multi-tenant & Octane rules (correctness, not gold-plating)

- `BelongsToTenant` global scope is **fail-closed** and primary; RLS is defense-in-depth.
- No per-request state in singletons/statics. Tenant context lives in `Context`; reset tenant-scoped
  state on Octane `RequestTerminated`.
- Queued jobs carry `tenant_id` in the payload, restore tenant context at job start, reset after
  (`support/queue/Tenant`).
- Redis cache keys are namespaced per tenant. `super` uses an **audited** `withoutTenancy()` escape hatch.
</content>
