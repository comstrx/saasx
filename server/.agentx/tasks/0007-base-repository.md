# 0007 — `HasBaseRepository` engine trait + `BaseRepository` shell

- Requirement: `0003-base-engine-traits.md` (clears `0001-compliance-floor.md`: additive schema mapping, fail-closed, no N+1).
- Deliverable type: lib
- Order: 0006 (`HasBaseModel` read DSL).

## Responsibility
The data-access engine: turn `Repository::fields()` + optional boot hooks into full CRUD over the model, funnelling reads through the `HasBaseModel` DSL — concrete repositories declare only `fields()` and overrides.

## Path
- `app/Traits/Bases/HasBaseRepository.php` (engine).
- `app/Repositories/BaseRepository.php` (thin shell: `use HasBaseRepository;`, `__construct(protected Model $model)`).

## Public interface
- Shell `BaseRepository` per the `arch.md §3` skeleton (constructor takes the bound `Model`).
- Engine `HasBaseRepository`:
  - `fields(array $data = []): array` — the declared write-shape (default `[]`; concrete repos override).
  - `index(array $params = [], array $scopes = [], array $permissions = [], array $callbacks = []): mixed` · `show(string $id, array $scopes = [], array $permissions = []): mixed` · `statistics(array $params, array $scopes, array $permissions): array` — all build one options struct and call the model DSL (`search`→`getResource`/`getStats`).
  - `store(array $data): Model` · `update(string $id, array $data): Model` · `delete(string $id): bool` · `deleteMany(array $ids): int` — map input through `fields()`, run inside `App\Support\Database::transaction`.
  - Boot-hook dispatch via `method_exists`: `createBoot`/`updatedBoot`/`deletedBoot`/`booted` — run only the hook a concrete declares.
  - `query(array $scopes = []): Builder` — base query with `whereScope` applied.

## Invariants
- Reads/writes flow through the model + `App\Support\*`; no native primitives, no inline `DB::` query building.
- `fields()` is the single write-allow-list; input outside it is ignored (mass-assignment safe); ids are UUIDv7 `string`.
- Tenant scope is the model's (`HasTenant`); the repository never disables a global scope.
- Writes are transactional and idempotent at the data layer; reads are keyset + eager-loaded (no N+1).
- A concrete repository carries no engine logic — only `fields()` + genuine overrides. `declare(strict_types=1)`; exact hand-style; zero comments; array returns shape-tagged.

## Acceptance criteria
- A concrete repo `extends BaseRepository` declaring only `fields()` yields working `index/show/statistics/store/update/delete/deleteMany` with zero per-method native code.
- Input keys absent from `fields()` are not persisted; a declared `createBoot` runs on store, an undeclared one is skipped.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0006. Precedes 0008 (service orchestrates the repository).
