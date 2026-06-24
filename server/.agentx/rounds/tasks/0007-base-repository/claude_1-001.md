# Task 0006 — `HasBaseModel` engine trait (the read/query DSL)

Executor: claude_1. First/only executor (no prior `0006` work; the file held my finished `0005` report, now overwritten). `app/Traits/` and `app/Models/` were empty — greenfield engine layer.

## What I implemented (2 files)
- **`app/Traits/Bases/HasBaseModel.php`** — the model-layer read/query DSL: a model `use`s it and gains the whole pipeline with zero per-model code. Public surface (frozen interface honored):
  - `scopeSearch(...)` — applies the request-derived filter DSL: text search, `column@op` filters, role scope, callbacks, sort; stashes keyset limit/sort.
  - `scopeWhereScope(Builder, array)` — role-driven scope constraints (`['active'=>true,'vendor_id'=>...]`), scalar→`where`, array→`whereIn`.
  - `scopeWithCursor(Builder, ?string)` — stashes the incoming keyset cursor (the seam the repository/controller feeds the request cursor into).
  - `getResource(Builder, class-string<JsonResource>, bool $one)` — list = keyset-paginated `{items: Resource::collection, meta:{limit,count,has_more,cursor}}`; single = first-or-fail `{item: Resource::make}`.
  - `getStats(Builder, array)` — `{count, sum:{…}, avg:{…}}`, every column `hasColumn`-guarded.
  - `getItems(Builder, array)` — raw scoped `Support\Collection`.
  - `hasColumn(string)` — schema membership, cached in an Octane-safe `static` keyed by `table.column`.
  - Seam: `withRelations()` calls `getWithRelations()` if the model composes `HasRelations` (task 0014); absent → no includes, never an error.
- **`app/Models/BaseModel.php`** — `abstract class BaseModel extends Model { use HasBaseModel; }`, the model-layer base shell.

## The `BaseModel` shell — necessary addition (flagged)
PHPStan emits `trait.unused` for a trait no class consumes, and `app/Models` was empty (the first real models land in 0015). The trait cannot be gate-analyzed in isolation, and acceptance #1 ("a bare model `use HasBaseModel`") requires a consumer. `BaseModel` is the **model-layer base shell** — exactly parallel to `BaseRepository`/`BaseService`/… in `arch.md §3` — and the least domain-committal consumer possible (pure infrastructure, no schema). It makes the trait analyzed/green and demonstrates the acceptance. **For task 0015:** concrete models may `extends BaseModel` (and add `HasTenant`/`HasRelations`) instead of the contract's inlined `extends Model use HasBaseModel` — both are equivalent; I left the shell so the engine trait has a stable home. Not a contract violation (the `Category` example is illustrative of "near-empty declaration").

## Bug found & fixed (probe caught it; static analysis could not)
Keyset page 2 returned the same rows as page 1. Root cause: `encodeCursor` used `getAttribute('created_at')` → a **Carbon cast** that JSON-encodes to ISO-8601 (`…T…Z`), while the column stores `Y-m-d H:i:s`; `created_at < '<ISO>'` then matched every row (space `0x20` sorts before `T`). Fixed by encoding the cursor from **`getRawOriginal($column)`** — the column's stored representation — so the comparison is apples-to-apples. Verified: page1 `Echo,Delta` → page2 `Charlie,Bravo`, zero overlap.

## Key decisions (the concrete WHY)
- **Nothing native** — all string/array/number/db/cast work goes through `App\Support\{Cast,Database,Log,Num,Parse,Str}`; the trait never touches `DB::`/`array_*`/`preg_*`/`json_*` (grep-verified). Operator dispatch is an allow-list `match` (no `in_array`), membership is a static boolean cache over `Database::hasColumn`.
- **Fail-closed + logged, never silent** — unknown filter column/operator, bad value, invalid callback, unknown stats column are skipped and `Log::warning`’d (no empty `catch`, no open query surface). Sort/scope/filter resolve only declared columns (`hasColumn`/`Database::columns` allow-list).
- **Keyset, not OFFSET** — order by `{sortColumn, id}`, fetch `limit+1` to detect `has_more`, encode the next cursor via `Database::encodeCursor`; the incoming cursor decodes via `Database::decodeCursor` and applies the standard row-comparison window (`col </> v OR (col = v AND id </> id)`).
- **Octane-safe state** — only immutable schema (`$columnExists`) lives in a `static`; per-query keyset limit/sort/cursor live on the transient per-query model instance (dies with the request, never a static/singleton).
- **`@mixin Model`** so `$this->getTable()/getFillable()/getRawOriginal()` resolve under Larastan; `Builder<Model>` generics on every query method (proper typing, no suppression).
- **Frozen-signature notes:** `page` is accepted but keyset uses the cursor (page-offset is not the mechanism); `field` is interpreted as the text-search column allow-list (falls back to `fillable`); `permission` is stashed (`$searchPermissions`) as the seam the RBAC DNA (0016+) consumes — no permission logic here (out of scope).
- **`getResource` returns Resource objects + meta** (not `toArray(request())`) so serialization defers to the response/envelope layer and the engine touches no request global.

## Acceptance criteria — all met (sqlite probe)
- ✅ `Widget extends BaseModel` gained `search/whereScope/getResource/getStats/getItems/hasColumn` with zero per-model code.
- ✅ `getResource` list → keyset payload (two non-overlapping pages, `has_more`, `cursor`); `$one=true` → single first-or-fail (`Delta`). Filters resolve only declared columns (`price@>=`, `between`, `like` work; unknown `nope@>=` skipped while `name@like` still applied). `whereScope(active=true)`→3; sort `oldest`/`newest` correct; `getStats` count=5/sum=1225/avg=245 (unknown `avg.nope` skipped); `getItems`=5.
- ✅ No native primitive in the trait; `composer verify` exits 0.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Traits/` + `app/Models/` new.

## Remaining risks
- **`BaseModel` shell vs. 0015** — flagged above; concrete models should `extends BaseModel` (or inline the trait). No collision (additive), but the 0015 executor should be aware.
- **Default sort assumes a `created_at` column** — `applySort` falls back to `id` when absent (`hasColumn`-guarded), so timestamp-less models still paginate by id; keyset correctness there relies on UUIDv7's lexical time-ordering.
- **Relations seam inert until 0014** — `getResource`/`getItems` issue no per-row query, but auto eager-load only activates once `HasRelations::getWithRelations` exists; until then a Resource that lazy-loads a relation could N+1 (mitigated later by `preventLazyLoading` in 0014).
- **Cursor stability** — keyset assumes the sort column value + id are stable and the same `keysetSort` is used to encode and decode; a client mixing sort between pages invalidates the cursor (standard keyset caveat).

ship it
