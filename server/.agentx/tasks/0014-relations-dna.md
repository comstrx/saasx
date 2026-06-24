# 0014 — `HasRelations` DNA (schema-derived relations + nested dispatch)

- Requirement: `0005-relations-dna.md` (clears `0001-compliance-floor.md`: no N+1, fail-closed, `route:cache`-safe).
- Deliverable type: lib
- Order: 0006 (`HasBaseModel` read pipeline hook), 0011 (`HasBaseController` related actions).

## Responsibility
Derive a model's relation surface from its declared methods: auto-discover relations, auto eager-load to kill N+1, honour requested includes, and resolve nested-relation endpoints fail-closed.

## Path
- `app/Traits/Dna/HasRelations.php` (the executor may compose internal pieces; a model gains it via `use HasRelations;`).
- `app/Providers/AppServiceProvider.php` (or a dedicated provider): wire `Model::preventLazyLoading()` in non-production boot only.

## Public interface
- `relations(): array<string, string>` — the discovered relation map (name → related class), reflected once and cached in an Octane-safe boot-derived `static` per model.
- `isRelation(string $name): bool` · `resolveRelation(string $name): ?\Illuminate\Database\Eloquent\Relations\Relation` — used by `HasBaseController::related/showRelated` (fail-closed: unknown → null → 404).
- `getWithRelations(Builder $q, array $includes = []): Builder` — the seam `HasBaseModel::getResource` calls (auto eager-load discovered + allow-listed requested includes). Allow-list bounds includes to the discovered map.
- `scopeWithIncludes(Builder $q, array $includes): Builder`.

## Invariants
- Relations are DERIVED from declared Eloquent methods (reflection, cached) — never a hand-listed include map per endpoint; declaring a relation once is the whole integration.
- N+1 is eliminated: list reads eager-load the needed relations; `preventLazyLoading()` is the dev tripwire (never enabled in production hot path).
- Nested dispatch is fail-closed (unknown relation 404s), allow-listed to the discovered map, `route:cache`-safe (controller action, never a closure), no empty `catch` (a genuine error is logged via `App\Support\Log`).
- Octane-safe: only the immutable relation map is `static`; never per-request state. No external relation library; built on `App\Support\*` + Eloquent.
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns shape-tagged.

## Acceptance criteria
- A model `use HasRelations;` exposes its discovered relations; a list endpoint eager-loads and issues no per-row query.
- An unknown nested relation 404s; a known one returns the related Resource through the uniform envelope.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0006 and 0011 (completes the controller's nested-relation seam).
