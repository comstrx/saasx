# Server

> Run **one command** `php artisan new:model ...` → you get **Model + Repository + Service + Controller + Resource + Request + Migration + Dynamic Routes** wired to powerful **Traits/DSLs** (search, permissions, tenancy, storage, relations, stats, caching).

> Most CRUD & reporting works out-of-the-box; add business logic in the Service when you need it.

---

## Table of Contents

1. Why this approach
2. Architecture map
3. Request → DB lifecycle
4. Quickstart
5. Core building blocks
  * HasBaseModel (traits bundle)
  * Repository
  * Service
  * Controller
  * Resource & Request
  * Dynamic Routes
  * Job: ExecuteJob
6. The `new:model` generator (fields, options, examples)
7. Search DSL & Statistics
8. Permissions (Entity & Special)
9. Customization (override/extend)
10. Performance & caching
11. FAQ & common pitfalls
12. Cheatsheets

---

## 1) Why this approach

* **Productivity**: new domains ship with almost zero manual boilerplate.
* **Consistency**: \~70 modules follow the same lifecycle and conventions.
* **Extensibility**: when something is special, you override in Repository/Service, not everywhere.

---

## 2) Architecture (high-level)

```
HTTP Request
   ↓
Dynamic Route + Middlewares (role/permissions/tenant)
   ↓
Generic Controller
   ↓
BaseService (caching, related, stats, files, permissions)
   ↓
BaseRepository (clean I/O, query building)
   ↓
Eloquent Model (HasBaseModel traits bundle)
   ↓
Resource (output shaping) / Request (validation)
```

**Support Layer (DSLs inside traits):**

* **Search DSL** (filters/sort/text/date/relations)
* **Relations DSL** (auto relations from \*\_id + preferences)
* **Permissions DSL** (entity + per-record special)
* **Tenancy DSL** (global scope + guarded writes)
* **Storage DSL** (files/images/qrcodes)
* **Cache DSL** (keys/tags + auto invalidation)
* **Helpers DSL** (formatting, parsing, dates…)
* **Statistics DSL** (time buckets & label grouping)

---

## 3) Lifecycle (Request → DB)

1. **Route** (built dynamically) matches `/v1/admin/{resource}` ( and for other roles ).
2. **Middleware** enforces auth/role/tenant.
3. **Controller** (generic) gathers scopes/permissions/filters.
4. **Service** does CRUD, related endpoints, permissions ops, files, stats; calls **Repository** for reads/writes.
5. **Repository** builds the query & normalizes payloads.
6. **Model** (HasBaseModel) provides: search, relations, tenancy, storage, permissions, logs.
7. **Resource** formats JSON (with translations & relations). **Request** validates.
8. **Writes** clear tagged caches; **Reads** use `remember()`.

---

## 4) Quickstart

Generate a fully wired module:

```bash
php artisan new:model Product \
  --fields="name:string:translation=true:tiny=true; code:string:unique; status:enum:values=[valid,invalid,none]; owner_id:integer:default=0" \
  --options="image=true; files=true; permissions=true; model=true; controller=true; request=true; resource=true; repository=true; service=true; migration=true"
```

Run migrations:

```bash
php artisan migrate
```

Your admin endpoints are live under:

```
/v1/admin/products
```

You’ll have: `index, store, show, update, delete, delete.all, statistics, download, permissions/*, files, image, related/*, ...`

---

## 5) Core building blocks

### 5.1 HasBaseModel (traits bundle)

Every model `use HasBaseModel;` gets:

* **HasFillable**: generates `fillable`, `casts`, `searchable`, `filterable` from the DB schema.
* **HasRelations (+Deep)**: auto-discovers relations from `*_id` columns + **relation preferences** to steer chains.
* **HasMultiTenancy**: global scope on tenant column (default `store_id`); guarded create/delete across tenants; joins are tenant-aware.
* **HasFileStorage**: upload/delete files, single image helpers, QR code support.
* **Permissions Workflow**:

  * **Entity** permissions (public per module)
  * **Special** permissions (per record override)

* **Search Workflow**: Builder macros (`getResource()`, `getStats()`, …) + unified search DSL.
* **Statistics**: time-bucket aggregations (day/week/month/quarter/year/7years) & label counts.
* **Booted Logs**: on `created/updated` handle files, toggle active, dispatch logs/notifications if user is present.

> Disable features per model with:
>
> ```php
> protected array $disabledTraits = ['relations', 'tenancy', ...];
> ```

### 5.2 BaseRepository

* Standard API: `query(), findOrFail(), create(), update(), delete(), updateOrCreate(), dbTransaction(...)`.
* `fields(array $data)` to normalize/shape payloads before writes.
* Respects tenancy/scopes automatically.

### 5.3 BaseService

* CRUD: `index, show, store, update, delete, deleteMultiple, setDeleted…`
* **Related** endpoints: `related, showRelated, statisticsRelated, downloadRelated` (for any relation name).
* **Caching** helpers: `remember/successRemember/successDownload/deleteCacheTag` using model-derived tags.
* **Async jobs**: dispatch `ExecuteJob` for background work.
* **Hooks**: `initialize()`/`boot()` to set default cache tag/key/minutes per service.
* **Writes** always call `deleteCache()` for the relevant tag.

### 5.4 Controller (generic)

* Applies default **scopes** and **permissions** per role (admin/vendor/client/guest).
* Delegates all CRUD/related/permissions/files to the Service.
* Dynamic `related{Relation}()` methods are resolved automatically.

### 5.5 Resource & Request

* **Resource**:

  * `data()` + `tiny()` with auto-localized fields .
  * Embeds image/files/qrcodes/relations/permissions/translation if enabled.
* **Request**:

  * Builds validation rules from fields (required/unique/enum/exists/…).

### 5.6 Dynamic Routes

* A route registrar loops over `App\Http\Controllers\*` and registers standardized endpoints using controller metadata (e.g. `global_route`, `route_name`).
* Covers CRUD, related, permissions, attachments, stats, downloads.
* Production-ready with `php artisan route:cache`.

### 5.7 Job: ExecuteJob

* Runs any callback **Closure / `[Class, method]` / `"Class@method"`** inside the correct **tenant** (`store_id`) context.
* Good for logs/notifications/expensive tasks.

---

## 6) `php artisan new:model` generator

**Outputs**: Model, Repository, Service, Controller, Resource, Request, Migration.
Prevents overwriting existing files; creates folders when missing.

### Fields DSL (examples)

* `name:string:translation=true:tiny=true:label=Title`
* `code:string:unique`
* `status:enum:values=[valid,invalid,none]`
* `owner_id:integer:default=0:index`
* `related:morph` (polymorphic)
* `price:decimal(10,2):default=0`
* `city_id:integer` → **Resource** auto-links `city` relation (and will use `CityResource::info` if found).

### Options

* `image=true` or `files=true` to include image/files helpers in Resource.
* `permissions=true`, `multitenancy=true`, `softdelete=true`, `timestamp=true`.
* Toggle file generation: `model=false`, `resource=false`, etc.

### How mapping works

* **Migration**: parses `type`, `default`, `index/unique`, `enum(values=[])`, `morph`, `decimal(precision,scale)`…
* **Request**: builds rules from field metadata (required/unique/exists/enum…).
* **Resource**: generates consistent `data()` and `tiny()` with optional --.
* **Routes**: picked up automatically by the route loop.

---

## 7) Search DSL & Statistics

Single entry point via query params:

```
?search=...&filters[...]&sort=...&page=&limit=
```

### Text search

* Numbers match `id` directly.
* Otherwise tokenized LIKE across `searchable` columns (from schema or overrides).

### Column filters (`column@operator=value`)

* Equality: `status@=valid`
* Ranges: `price@between=[10,100]`, `price@notin=[5,9]`
* Dates:

  * **Keywords**: `created_at@thismonth`, `@today`, `@yesterday`, `@lastweek`, `@expired`, `@notexpired`
  * **Range**: `created_at@2024-01..2024-02`
  * **Granular**: `@=2024-01-02 12:30` matches the minute; also supports `year`, `time`, weekdays
* LIKE: `name@like=pro max` (tokenized)
* Relations: `user.email@like=gmail.com`
* Nullability: `deleted=null` or `deleted=not null`
* Set ops: `@in`, `@notin`

### Sorting

* `sort=newest|oldest|{column}@asc|{column}@desc`

### Statistics

* `period`: `day|week|month|quarter|year|7years`
* `type`: `period` (count) or `label` (group by column) or `sum/avg/max/min` for a column
* Auto fills missing buckets.

---

## 8) Permissions

Two layers:

1. **Entity (public per module)**

   * Defined via config & synced with `syncPermissions()`
   * APIs: `Model::allowPermission('export')`, `denyPermission`, `allowedEntityPermissions()`, …

2. **Special (per record)**

   * `item->allow('publish')` / `item->deny('delete')`
   * `allowedPermissions()` / `deniedPermissions()`
   * Access check merges public + special with a clear rule (special overrides).

Routes can require permissions via middleware like `has:permission_name`.

---

## 9) Customization (override/extend)

* **Service** → where business rules live (e.g., `ProductService::order`, `coupon`, `checkout`). Keep generic lifecycle in BaseService.
* **Repository** → normalize payloads in `fields()`; add `boot/createBoot/updatedBoot` hooks if needed.
* **Controller** → override `requestForm()` to use a custom Request for specific actions.
* **Model** → steer relations with:

  ```php
  protected array $relationPreference = [
    'country' => 'category.city.country',
    'city'    => 'category.city',
  ];
  ```

  Disable features with `$disabledTraits`.

---

## 10) Performance & caching

* **Route caching**: `php artisan route:cache`.
* **Reads**: `remember()/successRemember()` with **tag/key/minutes** configured in Service.
* **Writes**: always invalidate via `deleteCache()`.
* **N+1**: set `withRelations` and `withAggregates` in the Model for default eager loads/aggregations.
* **Tenancy**: enforced on base queries and joined tables when they share the tenant column.

---

## 11) FAQ & common pitfalls

* **Why dynamic routes?**
  To remove boilerplate and guarantee consistency across \~70 modules. With route caching, overhead is negligible.

* **Onboarding a new dev?**
  Read this README, open any generated module—models look “empty” by design because power lives in traits. Custom behavior goes to Service/Repository.

* **How to disable a feature per model?**
  `$disabledTraits` (e.g. `['relations']`).

* **Debugging?**
  Business logic is in Services (thin, explicit). Shared behavior is tested once in bases/traits. Logs + `ExecuteJob` help trace background work.

* **Custom endpoints?**
  Add a method in Service, then a thin wrapper in Controller. For relations, sticking to the naming convention lets routes resolve automatically.

---

## 12) Cheatsheets

### A) Admin routes (typical)

```
GET    /v1/admin/{resource}                    → index
POST   /v1/admin/{resource}                    → store
GET    /v1/admin/{resource}/{id}               → show
PUT    /v1/admin/{resource}/{id}/{column?}     → update (single column or full)
DELETE /v1/admin/{resource}/{id}               → delete
DELETE /v1/admin/{resource}                    → deleteMultiple (ids[])

GET    /v1/admin/{resource}/statistics         → statistics
POST   /v1/admin/{resource}/download           → download

POST   /v1/admin/{resource}/{id}/image         → updateImage
DELETE /v1/admin/{resource}/{id}/image         → deleteImage
POST   /v1/admin/{resource}/{id}/files         → uploadFiles
DELETE /v1/admin/{resource}/{id}/files         → deleteFiles

GET    /v1/admin/{resource}/{id}/permissions           → allPermissions
POST   /v1/admin/{resource}/{id}/permissions/allow     → allowPermission
POST   /v1/admin/{resource}/{id}/permissions/deny      → denyPermission

# generic related
GET    /v1/admin/{resource}/{id}/{related}             → related{Related}()
GET    /v1/admin/{resource}/{id}/{related}/{relId}     → showRelated{Related}()
GET    /v1/admin/{resource}/{id}/{related}/statistics  → statisticsRelated{Related}()
POST   /v1/admin/{resource}/{id}/{related}/download    → downloadRelated{Related}()
```

### B) Common query params

```
?search=iphone
&sort=newest                 # or oldest or price@asc
&page=1&limit=20
&filters[status@=]=valid
&filters[price@between]=[10,100]
&filters[created_at@thismonth]=1
&filters[user.email@like]=gmail.com
&filters[deleted]=not null
```

### C) Disable features in a model

```php
class Order extends Model {
    use HasBaseModel;

    protected array $disabledTraits = ['relations']; // example
    protected array $relationPreference = [
        'country' => 'city.country',
    ];
}
```

### D) Repository/Service customization

```php
class ProductRepository extends BaseRepository {
    public function fields(array $data = []){
        $d = optional($data);
        return [
            'name'    => $d['name'],
            'price'   => float($d['price']),
            'city_id' => integer($d['city_id']),
            // ...
        ];
    }
}

class ProductService extends BaseService {
    public function __construct(
        protected ProductRepository $productRepository,
        protected OrderService $orderService,
        // ...
    ){
        parent::__construct($productRepository);
    }

    public function order(int $id, array $scopes = []){
        // custom business flow
    }
}
```

---

## Closing

This codebase is a **meta-framework on top of Laravel**: it gives you \~95% of a module’s lifecycle for free.
The remaining \~5% (business logic) lands cleanly in Services/Repositories. Keep modules “empty” on purpose, and let the bases/DSLs do the heavy lifting.

If you need something special:

* put custom business rules in **Service**,
* shape inputs in **Repository**,
* steer relations or toggle features in the **Model**,
* and rely on the shared bases for the rest.
