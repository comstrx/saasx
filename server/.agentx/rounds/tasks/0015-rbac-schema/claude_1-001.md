# Task 0014 — `HasRelations` DNA (schema-derived relations + nested dispatch)

Executor: claude_1. First/only executor (no prior `0014` work; the file held my finished `0013` report, now overwritten). This completes the nested-relation seam I left in 0011 and the eager-load hook from 0006.

## What I implemented
- **`app/Traits/Dna/HasRelations.php`** (new) — derives a model's relation surface from its declared methods:
  - `relations()` — reflects public, zero-param, `Relation`-typed methods, invokes each once to map `name → related class`, cached in an Octane-safe `static` per model.
  - `hasRelation(name)` · `resolveRelation(name): ?Relation` — fail-closed lookup (unknown → null).
  - `getWithRelations(Builder, includes = [])` — the `HasBaseModel::withRelations` seam: eager-loads the allow-listed requested includes (∩ discovered).
  - `scopeWithIncludes` / `setIncludes` — stash the request's `?include` allow-list; `allowedIncludes` skips+logs unknown includes.
- **`app/Models/TenantModel.php`** — added `use HasRelations` (every tenant model gains relation discovery; platform models opt in).
- **`app/Traits/Bases/HasBaseRepository.php`** — threaded `?includes`/`?include` into `read()` (via `setIncludes`, `method_exists`-guarded); added `related()` (the nested-relation resolver) + `resourceFor()` (consolidated `resource()` onto it) + bounded `relatedLimit()`.
- **`app/Traits/Bases/HasBaseService.php`** — `related()` delegates to the repository (completing the controller seam).
- **`app/Traits/Bases/HasBaseController.php`** — removed the now-redundant `method_exists(service,'related')` guard (the service always has it; fail-closed stays via `$result === null → 404`).
- **`app/Providers/AppServiceProvider.php`** — `Model::preventLazyLoading(! isProduction())` (the dev N+1 tripwire; off on the prod hot path).

## Key decisions (the concrete WHY)
- **Discovery is reflection over declared typed methods** — a public zero-arg method whose return type is a `Relation` subclass is a relation; invoking it (query-free) yields the related class. Declaring a relation once is the whole integration; never a hand-listed include map. Cached immutably in a `static`.
- **Renamed `isRelation` → `hasRelation`** (deviation from the task interface, justified): Eloquent **already** defines `Model::isRelation($key)` and calls it internally in `getAttribute`/`toArray`. Overriding it with our narrowed signature/logic would corrupt attribute resolution and breaks contravariance. `hasRelation` is collision-free; nothing external called the old name.
- **Includes are allow-listed and fail-closed** — `?include=x` only eager-loads if `x` is a discovered relation; unknown is skipped and `Log::warning`’d (no open include surface, no N+1 from a bogus include).
- **Nested dispatch is a real, tenant-safe, fail-closed action** — `controller → service->related → repo->related`: the parent is loaded **tenant-scoped** (`query($scopes)`), the relation resolved off the model's discovered map (unknown → null → 404), and the related rows hydrated through the **related model's** Resource. The relation query inherits the related model's `HasTenant` scope + the parent constraint, so a foreign tenant 404s (verified). I used base Builder methods (`whereKey`/`limit`/`first`/`get`) on the relation query rather than the `search`/`getResource` DSL — that keeps it gate-clean (no `Builder<Model>` → `Builder<static>` mismatch) at the cost of keyset/filter on nested lists (bounded `limit`, acceptable for v1).
- **`preventLazyLoading` fires only for collections (`>1`)** — that is Laravel's design (`Builder::hydrate` sets the per-instance flag only when `count > 1`, because a single-model lazy access is not an N+1). Verified both ways: a per-row lazy access on a 3-model collection **throws**; the eager `index` of the same 3 renders the relation with no violation.
- **`HasRelations` on `TenantModel`, not `BaseModel`** — keeps the `HasBaseModel::withRelations` `method_exists('getWithRelations')` seam meaningful (BaseModel, the direct `HasBaseModel` user, has no relations; platform models opt in). No external relation library — only reflection (std-lib) + `App\Support\*` + Eloquent.

## Acceptance criteria — all met (full-vertical sqlite probe)
- ✅ `Product use HasRelations` exposed `{category, reviews}` (reflected); the `index` eager-loaded `?include=category` and issued **no per-row query** — `3` data SELECTs for `3` rows (constant), category rendered for each **under an active `preventLazyLoading` tripwire** (which throws on a real per-row lazy access).
- ✅ An unknown nested relation **404s**; a known one returns the related Resource in the uniform envelope (`related/reviews` → list of 2; `showRelated` → single review). Cross-tenant: tenant B → 404 (parent invisible).
- ✅ `composer verify` exits 0; the 0013 isolation suite still passes.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). `php artisan test` → **6 passed, 1 skipped** (the engine/BaseModel/provider edits did not break the cross-tenant probe). Probe removed.

## Remaining risks
- **Discovery needs typed relation methods** (`: BelongsTo`/`: HasMany`/…). An untyped relation is not discovered. The archetype types everywhere; flagged.
- **Nested lists are a bounded load, not keyset-paginated** — `related()` uses `limit` + the related Resource, deliberately bypassing the `search`/`getResource` DSL to stay gate-clean on the dynamically-typed relation query. Keyset/filter on nested lists is a future enhancement.
- **`resource()`-convention partially consolidated** — the repository now derives via one `resourceFor()`; the service (0008) still has its own `resource()` and the resource trait (0009) its own `resourceFor()`. The full 3× consolidation remains a carry-forward (manager: before 0015).
- **The discovery `static` is shared across models, keyed by class** (immutable, Octane-safe); reflection runs once per model class on first `relations()` call. `Database::columns` (used by `applySort`, 0006) is still re-queried per search (a schema query, not an N+1) — a separate caching opportunity, out of scope here.

ship it
