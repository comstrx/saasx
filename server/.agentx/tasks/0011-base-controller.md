# 0011 — `HasBaseController` engine trait + abstract `Controller` shell

- Requirement: `0003-base-engine-traits.md` (clears `0001-compliance-floor.md`: thin controller, role from `Context`, uniform envelope, `route:cache`-safe).
- Deliverable type: lib
- Order: 0008 (`HasBaseService`), 0009 (`HasBaseResource`), 0010 (`HasBaseRequest`).

## Responsibility
The thin controller engine that serves all panels from one class: read role/tenant from `Context`, assemble role-driven scopes/permissions, call one service method, return a Resource — no query, no business branch.

## Path
- `app/Traits/Bases/HasBaseController.php` (engine).
- `app/Http/Controllers/Controller.php` (the abstract base controller, `use HasBaseController;` — Laravel convention).

## Public interface
- Uniform action set (every concrete `XxxController` inherits; all return `Illuminate\Http\JsonResponse` via `App\Support\Response`):
  - `index(Request $req)` · `statistics(Request $req)` · `store(BaseRequest $req)` · `show(Request $req, string $id)` · `update(BaseRequest $req, string $id, ?string $column = null)` · `delete(Request $req, string $id)` · `deleteMany(Request $req)`.
  - `related(Request $req, string $id, string $relation)` / `showRelated(...)` — nested-relation actions that resolve `{relation}` against the model's derived map and **fail closed (404)** on unknown. Seam: resolution is provided by `HasRelations` (task 0014) via `resolveRelation()`/`isRelation()`; until 0014 lands the action returns 404 for any relation (never a closure, never a silent wrong result).
  - `defaultScopes(bool $strict = false): array` · `defaultPermissions(): array` — assembled by `match(App\Support\Context::role())`; threaded to the service. Reads role/tenant/user from `App\Support\Context` ONLY.

## Invariants
- Controller is thin: authorize (via route middleware) → resolve a Form Request → call ONE service method → return a Resource. No query building, no business logic.
- Role/tenant/user come from `App\Support\Context` — never request-bound global helpers, never per-request statics (Octane-safe).
- Permissions are threaded as data; resolution/gating is the `has:` middleware (task 0018) — the controller does not resolve RBAC.
- Nested-relation dispatch is a real action, fail-closed (404), `route:cache`-safe (string handlers, no closures); no empty `catch`.
- `declare(strict_types=1)`; exact hand-style; zero comments; ids UUIDv7 `string`.

## Acceptance criteria
- A concrete `XxxController extends Controller` with zero per-method code yields the full gated action set returning the uniform envelope.
- `defaultScopes`/`defaultPermissions` vary by `Context::role()`; an unknown nested relation 404s.
- No native query or business branch in the controller; `composer verify` exits 0 (route boot OK).

## Deliverable type
lib

## Order
After 0008, 0009, 0010. Nested-relation resolution is completed by 0014.
