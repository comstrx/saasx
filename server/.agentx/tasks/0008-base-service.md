# 0008 — `HasBaseService` engine trait + `BaseService` shell

- Requirement: `0003-base-engine-traits.md` (clears `0001-compliance-floor.md`: uniform envelope inputs, cache tenant-keyed, Octane-safe).
- Deliverable type: lib
- Order: 0007 (`HasBaseRepository`).

## Responsibility
The orchestration engine: one uniform read pipeline (build options → search → resource), cache-by-query-shape with tag invalidation, and transactional writes — concrete services hold only genuine domain overrides.

## Path
- `app/Traits/Bases/HasBaseService.php` (engine).
- `app/Services/BaseService.php` (thin shell: `use HasBaseService;`, `__construct(protected BaseRepository $repository)`).

## Public interface
- Engine `HasBaseService`:
  - `index(array $params, array $scopes = [], array $permissions = []): mixed` · `show(string $id, array $scopes = [], array $permissions = []): mixed` · `statistics(array $params, array $scopes = [], array $permissions = []): array` — call the repository; wrap reads in `successRemember`.
  - `store(array $data): mixed` · `update(string $id, array $data): mixed` · `delete(string $id): bool` · `deleteMany(array $ids): int` — delegate to the repository inside `App\Support\Database::transaction`, then bust cache.
  - `buildParams(array $params = [], array $scopes = [], array $permissions = [], array $callbacks = []): array` — the single options struct (`id,text,page,limit,sortBy,filter,field,scope,permission,callback`) per `abstraction-engine.md`.
  - `successRemember(string $tag, array $key, \Closure $fn): mixed` — cache keyed by query shape via `App\Support\Cache::remember`; `deleteCache(string $tag): void` on every write (tag/index invalidation, never `flush`).
  - `resource(): class-string` — the Resource the pipeline hydrates into (concrete declares or it is derived from the model name).

## Invariants
- Business logic is a **pipeline over `App\Support\*` + the repository** — no native PHP/Laravel inline (`design.md §1`).
- Cache keys are tenant-prefixed (via `App\Support\Cache`) and keyed by query shape; writes invalidate by tag only.
- Writes are transactional; heavy/external work is offloaded to `App\Support\Queue`, never run inline.
- Octane-safe (no per-request statics); ids UUIDv7 `string`; fail-closed.
- A concrete service carries only overrides; `declare(strict_types=1)`; exact hand-style; zero comments; array returns shape-tagged.

## Acceptance criteria
- A concrete service `extends BaseService` with no overrides yields full CRUD + cached reads + tag-busting writes.
- The same `buildParams` options struct feeds index/show/statistics; a write busts exactly its tag (no full flush).
- No native primitive in the engine or a concrete service; `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0007. Precedes 0011 (controller calls the service).
