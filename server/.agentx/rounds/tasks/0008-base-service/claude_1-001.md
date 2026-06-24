# Task 0007 — `HasBaseRepository` engine trait + `BaseRepository` shell

Executor: claude_1. First/only executor (no prior `0007` work; the file held my finished `0006` report, now overwritten). `app/Repositories` was empty; `HasBaseModel`/`BaseModel` from 0006 are present.

## What I implemented (2 new files + 1 fix to 0006)
- **`app/Repositories/BaseRepository.php`** — thin shell: `use HasBaseRepository;`, `__construct(protected BaseModel $model)`.
- **`app/Traits/Bases/HasBaseRepository.php`** — the data-access engine. A concrete repo declares only `fields()` (+ overrides) and gains:
  - `index/show/statistics` — build one query via `read()` and funnel through the `HasBaseModel` DSL (`search`→`getResource`/`getStats`); `read()` also wires the **incoming keyset cursor** from `params['cursor']` into `withCursor()` (the seam 0006 left open).
  - `store/update/delete/deleteMany` — map input through `fields()`, run inside `App\Support\Database::transaction`, dispatch boot hooks.
  - `fields()` (default `[]`), `query(scopes)` (base query + `whereScope`), boot-hook dispatch.

## Fix to 0006 (genuine defect surfaced here — stated per "replace what is wrong, say why")
`HasBaseModel` annotated its query methods `Builder<Model>`. `Builder`'s `TModel` is **invariant**, so a real consumer's `Builder<ConcreteModel>` is NOT assignable to `Builder<Model>` — the repository couldn't pass its query to `getResource`/`getStats` without a gate error. The correct annotation is `Builder<static>` (the model's own builder); I changed all 23 occurrences, plus `getItems` `@return Collection<int, static>`. This is a latent typing bug in 0006, not a workaround — behavior is unchanged, the types are now correct. Verified: HasBaseModel still green standalone and the repository now type-checks.

## Key decisions (the concrete WHY)
- **Model typed `BaseModel`, not `Illuminate\…\Model`** (deviates from the `arch.md §3` skeleton's `Model`): the engine calls the `HasBaseModel` DSL (`search`/`getResource`/`whereScope`/`withCursor`/`getStats`), which only exists on `BaseModel`. Typing the base `Model` would fail the gate. `BaseModel` IS-A `Model`; concrete models `extends BaseModel` (consistent with the 0006 shell). **Flag for 0015.**
- **`fields()` is the single write-allow-list** — `store` persists the full `fields($data)` (declared keys, null defaults = create); `update` persists `writable($data)` = `fields()` ∩ keys actually present in `$data` (partial update). Presence uses `Arr::has` (backed by `array_key_exists`, so a client can explicitly null a column by sending the key). `forceFill($this->fields(...))` means input outside `fields()` (e.g. a forged `id`/`evil`) never reaches the model — mass-assignment safe regardless of `$fillable`.
- **Writes are transactional** via `Database::transaction` (its `@template` makes the typed closure return flow to `store/update`'s `Model`/`bool`/`int` gate-clean). `deleteMany` loops per-model so soft-deletes, model events, and boot hooks fire correctly (N queries — fine for typical batch sizes; chunk if huge).
- **Boot hooks via `method_exists`** — `createBoot`/`updatedBoot`/`deletedBoot`/`booted` run only if the concrete declares them (gate-clean `method_exists` narrowing); an undeclared hook is silently skipped (verified: `update` with no `updatedBoot` ran without error).
- **Resource by convention** — `resource()` derives `App\Http\Resources\<Model>Resource` and `is_subclass_of`-guards it (narrows to `class-string<JsonResource>`, fails loud if absent); a concrete repo may override it.
- **Nothing native** — all input mapping/casting/parsing goes through `App\Support\{Arr,Cast,Database,Parse,Str}`; no `array_*`/`preg_*`/`json_*`/`DB::` (grep-verified). Tenant scope stays the model's (`HasTenant`, 0012) — the repository never disables a global scope.

## Acceptance criteria — all met (sqlite probe)
- ✅ `WidgetRepository extends BaseRepository` declaring only `fields()` yielded working `index/show/statistics/store/update/delete/deleteMany` with zero per-method native code.
- ✅ Input outside `fields()` not persisted: a forged `id` was replaced by a generated UUIDv7 and `evil` never reached the model; partial `update(price)` preserved `name`/`active`.
- ✅ Declared `createBoot` ran on `store`; an undeclared `updatedBoot` was skipped (no error). `index` returned a keyset payload (`Delta,Charlie`, `has_more`, `cursor`); `show` returned the single item; `statistics` count=4/sum=925; `delete`→true; `deleteMany`→3; `query(active=true)`→scoped count.
- ✅ `composer verify` exits 0.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Repositories/`, `app/Traits/`, `app/Models/`.

## Remaining risks
- **`store` requires the model to generate its UUIDv7 PK** — the repository does not invent ids (correct separation; id/tenant stamping is `HasTenant`/0012's job). Until 0012 lands, a model without a `creating` id hook will fail `save()` on a null PK. Flagged dependency; the probe supplied the hook.
- **Model typed `BaseModel`** — concrete models must `extends BaseModel`; flagged for 0015 (consistent with the 0006 shell decision).
- **`forceFill` + `fields()`** makes the model's `$fillable` redundant for repo writes (still guards any direct `::create`); intentional — `fields()` is the single allow-list per the contract.
- **`resource()` convention** needs `App\Http\Resources\<Model>Resource` (task 0009+); throws loud until those exist, so `index/show` are not callable end-to-end until a resource is present (write paths and `statistics`/`getItems` are).
- **`deleteMany` N+1** by design (per-model events/hooks); acceptable for typical sizes, revisit with chunking if a bulk hard-delete path is ever needed.

ship it
