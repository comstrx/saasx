# 0006 — `HasBaseModel` engine trait (the read/query DSL)

- Requirement: `0003-base-engine-traits.md` (clears `0001-compliance-floor.md`: keyset pagination, no N+1, Octane-safe, fail-closed).
- Deliverable type: lib
- Order: 0001 (Support built domains green — uses `Database`, `Cast`, `Parse`, `Arr`).

## Responsibility
The model-layer engine: from a model's declared schema, materialize the uniform read/query DSL (search, filter, sort, keyset pagination, statistics, resource hydration) that the repository and service funnel every read through.

## Path
- `app/Traits/Bases/HasBaseModel.php` (the executor MAY compose focused internal traits, but a model gains the whole DSL via `use HasBaseModel;`).

## Public interface
Query macros/scopes the upper layers rely on (UUIDv7 `string` ids throughout):
- `scopeSearch(Builder $q, ?string $text = null, array $filter = [], array $field = [], ?string $sortBy = null, ?int $page = null, ?int $limit = null, array $scope = [], array $permission = [], array $callback = []): Builder` — applies the request-derived filter DSL (`column@op` over `>= <= in notin between like`, `sort@asc|desc|newest|oldest`), all `hasColumn`-guarded.
- `scopeWhereScope(Builder $q, array $scope): Builder` — applies role-driven scope constraints (`['active'=>true,'vendor_id'=>...]`).
- `getResource(Builder $q, class-string $resource, bool $one = false): mixed` — hydrate into the given Resource; list = keyset-paginated (via `Database::encodeCursor`/`decodeCursor`/`Keyset`), single = first-or-fail. Eager-loads via the optional relations hook below.
- `getStats(Builder $q, array $opts = []): array` — allow-listed aggregates (count/sum/avg over `hasColumn` columns).
- `getItems(Builder $q, array $opts = []): \Illuminate\Support\Collection` — raw scoped items.
- `hasColumn(string $column): bool` — schema membership, cached in an Octane-safe boot-derived `static` keyed by table.
- Seam (consumed, not owned here): if `method_exists($this,'getWithRelations')`, `getResource` calls it to apply auto eager-load + requested includes (provided by `HasRelations`, task 0014). Absent → no includes, never an error.

## Invariants
- **Nothing native**: string/array/number/db/cast work is delegated to `App\Support\{Arr,Cast,Parse,Database,Str,Num}` — the trait never re-implements a Support capability, never touches `DB::` directly.
- Octane: only immutable boot-derived metadata (schema/columns) is cached in `static`; never per-request/tenant state.
- Filtering/sorting is allow-listed and `hasColumn`-guarded; an unknown/over-wide filter is skipped and logged (`App\Support\Log`), never silently applied, never an open query surface.
- Pagination is keyset (not OFFSET); a list read issues no per-row query (N+1-free once relations hook is present).
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape tags.

## Acceptance criteria
- A bare model `use HasBaseModel;` gains `search/whereScope/getResource/getStats/getItems/hasColumn` with zero per-model code.
- `getResource(...)` returns a keyset-paginated payload for a list and a single record for `$one=true`; filters resolve only declared columns.
- No native primitive (`array_*`, `preg_*`, raw `DB::`) in the trait; `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0001. Precedes 0007 (repository builds on this DSL).
