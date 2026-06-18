# contracts/arch.md — Architecture (LAW)

> Where things live and how a request flows. The structural law. Pair with `design.md` (how to think).
> Both re-read every turn. Code in this file is the **exact hand** — copy its spacing (`style.md`).

## 1 — Layers

Repository pattern, layered. Two views of one stack:

- **Build / dependency order (inner → outer):**
  `support → traits → bases → repository → service → controller → request → middleware → route`
- **Runtime request flow (outer → inner):**
  `route → middleware → request (validation) → controller → service → repository → model (+ traits) → support`

Each layer depends only on layers **inner** to it. A controller never touches a model directly; it goes
through its service → repository. Support has **zero** business logic and depends on nothing in `app` except
sibling Support. Traits sit on Support; bases sit on traits.

## 2 — Code structure is FLAT (not modular domains)

All classes live one level deep in their layer folder: `app/Models/*`, `app/Repositories/*Repository.php`,
`app/Services/*Service.php`, `app/Http/Controllers/*Controller.php`, `app/Http/Requests/*`,
`app/Http/Resources/*`. A single unified `XxxController` serves all panels; behaviour differs by the
**active panel role** read from `Context` (§6).

## 3 — The Base engine (CORE PATTERN — this IS the magic)

The real logic of each layer lives in a `HasBaseXxx` **trait** under `app/Traits/Bases/`
(`namespace App\Traits\Bases`). Each layer has a thin **`BaseXxx` shell class** that does nothing but `use`
its trait. Concrete classes **extend** the shell and stay almost empty — declaring only what is unique
(`fields()`, an override). **Put new shared behaviour in the trait, NEVER in a concrete class.**

| Shell class (its file) | `use`s trait (`App\Traits\Bases\…`) |
|------------------------|-------------------------------------|
| model in `app/Models/…` | `HasBaseModel` (+ DNA traits) |
| `app/Repositories/BaseRepository.php` | `HasBaseRepository` |
| `app/Services/BaseService.php` | `HasBaseService` |
| `app/Http/Controllers/Controller.php` (base, `abstract`) | `HasBaseController` |
| `app/Http/Requests/BaseRequest.php` | `HasBaseRequest` |
| `app/Http/Resources/BaseResource.php` | `HasBaseResource` |
| `app/Console/Commands/BaseCommand.php` | `HasBaseCommand` |

**Canonical layer skeletons** (the exact shape; ids are **UUIDv7 `string`**, never `int`):

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
// app/Repositories/CategoryRepository.php — concrete = declaration only (fields() + overrides)
namespace App\Repositories;
use App\Models\Category;

class CategoryRepository extends BaseRepository {

    public function __construct ( Category $model ) {

        parent::__construct($model);

    }
    /** @return array<string, mixed> */
    public function fields ( array $data = [] ): array {

        return [
            'name'        => $data['name'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'description' => $data['description'] ?? null,
        ];

    }

}
```
```php
// app/Services/CategoryService.php — concrete stays near-empty (overrides only)
namespace App\Services;
use App\Repositories\CategoryRepository;

class CategoryService extends BaseService {

    public function __construct ( protected CategoryRepository $repository ) {

        parent::__construct($repository);

    }

}
```
```php
// app/Http/Controllers/CategoryController.php — thin: bind the service, declare differences only
namespace App\Http\Controllers;
use App\Services\CategoryService;

class CategoryController extends Controller {

    public function __construct ( protected CategoryService $service ) {

        parent::__construct($service);

    }

}
```
```php
// app/Models/Category.php — bare noun + DNA traits; declares relations/casts/fillable
namespace App\Models;
use App\Traits\Bases\HasBaseModel;
use App\Traits\Dna\HasTenant;
use App\Traits\Dna\HasRelations;
use Illuminate\Database\Eloquent\Model;

class Category extends Model {

    use HasBaseModel, HasTenant, HasRelations;

    protected $fillable = ['name', 'category_id', 'description'];

}
```

`BaseService`, `Controller` (base), `BaseRequest`, `BaseResource`, `BaseCommand` follow the same shape: a thin
shell that `use`s its `HasBaseXxx` trait, holding the constructor that wires the inner layer. All repeated
work lives in the trait. A concrete class that grows real logic is a smell — push it down into the engine.

## 4 — `app/Traits/` layout (exactly two sub-folders, nothing loose at root)

- **`app/Traits/Bases/`** (`namespace App\Traits\Bases`) — the `HasBaseXxx` engine traits (§3): the reusable
  logic for every layer. One per layer.
- **`app/Traits/Dna/`** (`namespace App\Traits\Dna`) — opt-in model **DNA**: a giant capability a model gains
  by `use`-ing the trait, e.g. `HasRoles`, `HasPermissions`, `HasFiles`, `HasSearch`, `HasCache`,
  `HasRelations`, `HasState`, `HasTenant` (illustrative, **not** exhaustive — add what a system needs in the
  owner's naming style; `naming.md`).

Every trait in **both** folders is built **on top of the Support DSL** — it calls `App\Support\…` and never
re-implements native/infra work. Traits carry layer/model **behaviour**; Support carries the std-lib **power**.

## 5 — `app/Support/` layout & canonical domain map

First level = **folders only**, never loose files. Each feature folder's **`index.php` is the public adapter /
final workflow** you call from outside (internal PascalCase files are siblings). Even a one-file helper becomes
`folder/index.php`. Support is **native / infrastructure helpers ONLY — ZERO business logic**. `†` = swappable
adapter (a `Driver` interface + concrete `RedisDriver`/`LocalDriver`/… + a manager in `index.php`; swap the
backend by adding ONE Driver file — `design.md` §6).

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
├── response/    Response    Envelope Failure Pagination Meta               uniform success/fail JSON envelope (build to §7 shape)
├── security/    Security    Token Hash Signature Secret Sanitize Encrypt   wrappers only — no DIY crypto
├── storage/ †   Storage     Driver LocalDriver S3Driver ObjectKey Upload Visibility TemporaryUrl
├── str/         Str         Casing Slug Clean Matches Random Template Inflect   (BUILT — mirror its hand)
├── throttle/ †  Throttle    Driver RedisDriver Limit                       per-plan rate limiting
└── validate/    Validate    Rule Shape Field Type Message                  predicates + Laravel Rule objects (Uuid7, Slug, …)
```

This map is the **contract for naming/shape**, NOT a build list. Files are created **on demand**
(systems-first): build only what the current system needs. `str/` already exists — **extend, never
duplicate**; mirror its exact hand (it is the reference hand for style). `response/` is **not built yet** —
build it to the §7 envelope shape.

Rules:
- **Before writing ANY `support/` or `trait/` file, tour `vsample`'s `app/Helpers/*` + `app/Traits/*` first**
  — for intent only, then implement ours stronger with stronger names, building only what the system needs
  (`vsample.md`).
- No class name may be a reserved keyword — `Boolean` (not `Bool`), `Casing` (not `Case`), `Matches` (not
  `Match`), `cache/Tag` (not `Index`, which collides with `index.php`). See `naming.md`.
- Facades intentionally shadow Illuminate equivalents (`Str`, `Arr`, `Cache`, `Date`, `Log`, `Mail`, `Queue`,
  `Storage`, `Http`, `Request`, `Response`, `Context`). **Never alias-import both Illuminate's and ours in one file.**
- `cache`, `lock`, `throttle`, `queue`, `event`, `storage` are the swappable adapters (`†`).
- `context` is the single source of truth for the active role/tenant/super tag; `database/Rls` and
  `queue/Tenant` read from it.

## 6 — Role / tenant "tag" via `Context` (Octane-safe — non-negotiable)

The active panel role + `tenant_id` + super flag live in Laravel **`Context`** (request-scoped), wrapped by
`App\Support\Context`. The panel middleware **sets** the tag; the base controller/service **reads** it to
compute role-specific scopes/permissions. Roles are **many-to-many**; the panel route group declares the
expected role and the middleware verifies membership (multi-role users supported).

`App\Support\Context` is the **only** accessor — its surface (read everywhere, written by middleware only):

```
Context::tenantId(): ?string      // null for super (cross-tenant)
Context::role(): string           // the active panel role for this request
Context::panel(): string          // super|admin|vendor|affiliate|delivery|client|guest
Context::isSuper(): bool
Context::userId(): ?string
Context::set(panel, role, tenantId, userId): void   // middleware only
Context::forget(): void           // reset on Octane RequestTerminated
```

**NEVER** use long-lived singletons, static properties, request-bound globals, or container `app('store')`
bindings for per-request state (`vsample`'s `user_role()`/`user_id()` globals are the anti-pattern — do not
port). Reset tenant-scoped state on Octane `RequestTerminated`.

## 7 — Response envelope (the new contract — NOT vsample's flat shape)

All API output flows through `BaseResource` / `App\Support\Response` into a **uniform** envelope. Build
`App\Support\Response` (in `app/Support/response/index.php`) to exactly this shape — one envelope, do not
invent a second:

- `success → { status: true, data, …extra }`
- `fail → { status: false, message, errors }`

`App\Support\Response::success($data, $status, $extra)` / `::message($text)` / `::fail($errors, $status, $msg)`
/ `::error($key, $msg, $status)` / `::noContent()`.

## 8 — Routes (explicit, reusable blocks, `route:cache`-safe — NOT vsample's glob/closures)

- Panels: `routes/apis/<panel>.php`, included by `routes/api.php`, prefix `/v1`, per-panel name + middleware.
- The **repeated route shapes are reusable blocks defined in `routes/apis/shared.php`** as clearly-named
  functions, **invoked explicitly** inside each panel file. NOT `glob()`/reflection auto-registration, NOT
  route closures as handlers (closures break `route:cache`). Every handler is a **`'method'` string** on a
  `->controller(...)` group → cacheable. `shared.php` is loaded **once** (before the panel files); guard
  definitions with `function_exists` so `route:cache` rebuilds cleanly.
- Provide **multiple** blocks, not one — e.g. `resource()` (the standard CRUD action set), `engagements()`
  (social: like/dislike/favorite/report/comment/reply), `account()`, `chat()`. Block names are the
  implementer's choice (clear nouns/verbs; do **not** resurrect `vsample`'s `cycle`/`helpers` as a contract).

```php
// routes/apis/shared.php — reusable blocks; loaded once; route:cache-safe (string handlers only)
use Illuminate\Support\Facades\Route;

if ( !function_exists('resource') ) {

    function resource ( string $name, string $controller ): void {

        Route::prefix($name)->name("$name.")->controller($controller)->group(function () use ( $name ) {

            Route::middleware("has:view_$name")->group(function () use ( $name ) {

                Route::get('', 'index')->name('index');
                Route::get('statistics', 'statistics')->name('statistics')->middleware('has:allow_statistics');
                Route::post('download', 'download')->name('download')->middleware('has:allow_downloads');
                Route::post('', 'store')->name('store')->middleware("has:add_$name");
                Route::delete('', 'deleteMany')->name('delete.many')->middleware("has:delete_$name");

            });
            Route::prefix('{id}')->whereUuid('id')->middleware("has:view_$name")->group(function () use ( $name ) {

                Route::get('', 'show')->name('show');
                Route::get('{relation}', 'related')->name('related');
                Route::get('{relation}/{related}', 'showRelated')->whereUuid('related')->name('related.show');
                Route::delete('', 'delete')->name('delete')->middleware("has:delete_$name");

                Route::middleware("has:edit_$name")->group(function () {

                    Route::put('{column?}', 'update')->name('update');
                    Route::post('image', 'updateImage')->name('image');
                    Route::delete('image', 'deleteImage')->name('image.delete');
                    Route::post('files', 'uploadFiles')->name('files');
                    Route::delete('files', 'deleteFiles')->name('files.delete');

                });

            });

        });

    }

}
```
```php
// routes/apis/admin.php — declare the panel group, invoke blocks explicitly
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;

Route::middleware(['tenant', 'panel:admin'])->prefix('v1/admin')->name('admin.')->group(function () {

    resource('products', ProductController::class);
    resource('orders', OrderController::class);
    engagements('products', ProductController::class);

});
```

- **The standard uniform action set** (what `resource()` exposes for every resource, all gated):
  `index` · `statistics` (`has:allow_statistics`) · `download` (`has:allow_downloads`) · `store` (`has:add_*`)
  · `deleteMany` (`has:delete_*`) · `show` · `related` / `showRelated` (nested relations) · `update`
  (`has:edit_*`) · `delete` (`has:delete_*`) · `updateImage`/`deleteImage`/`uploadFiles`/`deleteFiles`
  (`has:edit_*`) · permissions sub-group (`has:view_permissions` / `has:edit_permissions`).
- **Nested relations are `route:cache`-safe:** `related`/`showRelated` are real **controller actions** that
  resolve the `{relation}` segment against the model's **derived** relations and dispatch (fail-closed → 404
  on an unknown relation). The magic lives in the controller/service, **never** in a route closure.
- **Mirror:** each resource you add → add its folder + requests to `routes/collections/<panel>.json` with
  request body, headers (`Authorization: Bearer {{access_token}}`, `Accept: application/json`, `Locale`, and
  `Idempotency-Key: {{$guid}}` on writes), and saved response examples. The **`apis ↔ collections` mirror
  stays 1:1, updated in the same change.**

## 9 — Database conventions

- **UUIDv7** primary keys everywhere (`support/database/Uuid`). Ids are `string` in every signature.
- **`tenant_id`** on every tenant-owned table; composite uniques `unique(tenant_id, …)`; hot indexes lead with
  `tenant_id`. Migrations are **central, reversible, additive-first**; no destructive drop in the same release
  as code that still reads the column. (The default Laravel framework tables — `jobs`, `failed_jobs`,
  `personal_access_tokens` — are infra, not tenant-owned; align identity tables to UUIDv7/`tenant_id` when you
  build the identity system.)
- **RLS** is defense-in-depth: transaction-local `set_config('app.tenant_id', ?, true)` (**never** session
  `SET`), app connects as a **non-owner** role, tables `FORCE ROW LEVEL SECURITY`. The Eloquent global scope
  (`BelongsToTenant`) is the **primary** isolation; RLS catches what code forgets.
- Money: **double-entry ledger, integer minor units** (never floats). Idempotency keys on financial endpoints.
  Per-plan rate limiting.

## 10 — Multi-tenant & Octane rules (correctness, not gold-plating)

- `BelongsToTenant` global scope is **fail-closed** and primary; RLS is defense-in-depth.
- No per-request state in singletons/statics. Tenant context lives in `Context`; reset tenant-scoped state on
  Octane `RequestTerminated`.
- Queued jobs carry `tenant_id` in the payload, restore tenant context at job start, reset after
  (`support/queue/Tenant`).
- Redis cache keys are namespaced per tenant. `super` uses an **audited** `withoutTenancy()` escape hatch.
