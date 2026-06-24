# Task 0009 — `HasBaseResource` engine trait + `BaseResource` shell

Executor: claude_1. First/only executor (no prior `0009` work; the file held my finished `0008` report, now overwritten). `app/Http/Resources` was empty; `App\Support\Response` (the envelope) and the full engine are present.

## What I implemented (2 files)
- **`app/Http/Resources/BaseResource.php`** — thin shell `extends Illuminate\…\JsonResource`, `use HasBaseResource;`.
- **`app/Traits/Bases/HasBaseResource.php`** — the output-shaping engine. A concrete Resource declaring only `fields()` gains:
  - `toArray(Request)` — `shape(fields) + relations`: declared fields with null columns hidden, plus loaded relations rendered through their own Resource.
  - `fields(Request)` — default = the model's visible attributes (`attributesToArray()`); concrete overrides.
  - static `single()`/`list()` — envelope helpers that route through `App\Support\Response` so single/collection/paginated all emit `{status:true, data, …}`.
  - `relations()`/`renderRelation()`/`resourceFor()` — render each **loaded** relation via the convention Resource (`<Model>` → `App\Http\Resources\<Model>Resource`), falling back to the model's array if no Resource exists.

## Key decisions (the concrete WHY)
- **One envelope, owned by `App\Support\Response` — never a second.** The trait does not override `with()`/`$wrap` to self-emit an envelope. Resources are pure shaping; `single()`/`list()` wrap the resource(s) via `Response::success`. Critically, a nested `JsonResource` serializes through `jsonSerialize()` (which applies **no** `$wrap` and **no** `with()`), so `Response::success(static::make($model))` yields exactly `{status:true, data:{…fields}}` with **no double `data` wrap** — verified. This is why I left `$wrap`/`with()` untouched.
- **Loaded relations only → no N+1, no force-load.** `relations()` iterates `$this->resource->getRelations()`, which reads only already-loaded relations and never touches an accessor, so shaping cannot trigger a lazy query. Verified under `Model::preventLazyLoading(true)`: shaping a fresh model raised nothing and omitted the unloaded relation.
- **Null columns hidden** via `Arr::whereNotNull` — the polymorphic-catalog behaviour ("hide null type-columns"). A concrete `fields()` controls exactly which keys are candidates.
- **Read-only, gate-clean.** `$this->resource instanceof Model` narrows the `mixed` JsonResource payload before calling model methods (no data access, no side effects). Convention resolution uses `is_subclass_of` to narrow to `class-string<JsonResource>`. No native `array_*`/`preg_*`/`json_*`, no `DB::` (grep-verified) — only `App\Support\{Arr,Response,Str}`.
- **`collection()` left as the standard JsonResource static** (returns an `AnonymousResourceCollection`), because `HasBaseModel::getResource` (0006) depends on that object — overriding it to return a response would break the read pipeline. The envelope-emitting path is the `single()`/`list()` helpers.

## Acceptance criteria — all met (sqlite probe)
- ✅ `WidgetResource extends BaseResource` declaring only `fields()` rendered inside the uniform envelope for **single** (`{status:true, data:{…}}`), **collection** (`data:[…]`), and **paginated** (`data:[…], meta:{cursor,has_more}`).
- ✅ A null `note` column was omitted; a loaded `category` relation rendered via `CategoryResource` (`data.category.label = Tools`); an **unloaded** relation was not force-loaded (no `category` key, no lazy-load under `preventLazyLoading`).
- ✅ No native primitive / no data access in a Resource; `composer verify` exits 0.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Http/Resources/`, `app/Traits/`.

## Remaining risks
- **`shape()` hides ALL null values by default**, not only polymorphic type-columns — intended for this archetype (smaller payloads, null type-columns gone), but a legitimately-null field (e.g. a nullable `description`) is also omitted. A concrete `fields()`/`shape()` override controls this; flagged.
- **Relations appear only when loaded** — correct (no N+1), but a relation must be eager-loaded to show. Until `HasRelations` (0014) wires auto eager-load into `getResource`, relations render only when explicitly `->load()`ed; this is the intended seam, not a defect.
- **`resourceFor` convention** needs `App\Http\Resources\<Model>Resource`; absent → falls back to the related model's `attributesToArray()`/`toArray()` (no error, but unshaped).
- **Envelope dual path** — both `single()`/`list()` and a controller calling `Response::success` directly produce the same uniform envelope (nested serialization is wrap-free); 0011 may use either.

ship it
