# 0009 — `HasBaseResource` engine trait + `BaseResource` shell

- Requirement: `0003-base-engine-traits.md` (clears `0001-compliance-floor.md`: Resources only, one uniform envelope, never a raw model).
- Deliverable type: lib
- Order: 0001 (`App\Support\Response`). Independent of 0006–0008; ordered here for build flow.

## Responsibility
The output-shaping engine: every response flows through one uniform success/fail envelope; concrete resources declare only their field map.

## Path
- `app/Traits/Bases/HasBaseResource.php` (engine).
- `app/Http/Resources/BaseResource.php` (thin shell extending `Illuminate\Http\Resources\Json\JsonResource`, `use HasBaseResource;`).

## Public interface
- Engine `HasBaseResource`:
  - `toArray($request): array` — default shaping: declared fields, null type-columns hidden, included relations rendered through their own Resource.
  - `fields($request): array` — the concrete's field map (default = the model's visible attributes); concrete overrides.
  - static `collection(...)` and the envelope helpers route through `App\Support\Response` so list/single/paginated all emit `{status:true, data, …}`; failures emit `{status:false, message, errors}`.
- The envelope itself is owned by `App\Support\Response` (built) — this trait composes it, never defines a second envelope.

## Invariants
- Output is ALWAYS the uniform envelope via `App\Support\Response`/`BaseResource` — never an ad-hoc array, never a raw model.
- Null type-specific columns are hidden; relations render via their Resource (no leaking of unloaded relations → no N+1 trigger).
- No data access or side effects in a Resource (read-only shaping).
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns shape-tagged; ids UUIDv7 `string`.

## Acceptance criteria
- A concrete Resource `extends BaseResource` declaring only `fields()` renders inside the uniform envelope for single, collection, and paginated payloads.
- A null column is omitted; an unloaded relation is not force-loaded by shaping.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0001. Precedes 0011 (controller returns Resources).
