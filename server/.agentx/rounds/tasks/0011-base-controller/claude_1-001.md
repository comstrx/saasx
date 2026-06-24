# Task 0010 — `HasBaseRequest` engine trait + `BaseRequest` shell

Executor: claude_1. First/only executor (no prior `0010` work; the file held my finished `0009` report, now overwritten). `app/Http/Requests` was empty; `App\Support\{Validate,Context,Response}` are present.

## What I implemented (2 files)
- **`app/Http/Requests/BaseRequest.php`** — thin shell `extends Illuminate\Foundation\Http\FormRequest`, `use HasBaseRequest;`.
- **`app/Traits/Bases/HasBaseRequest.php`** — the boundary-validation engine. A concrete Request declaring only `rules()` gains:
  - `rules()` default `[]`; `authorize()` returns `true` (access is gated at the route by the `has:` middleware, 0018 — the request does NOT re-implement RBAC).
  - `uniqueInTenant(table, column, ignore)` / `existsInTenant(table, column)` — tenant-scoped `Rule::unique`/`exists` `->where('tenant_id', Context::tenantId())` so uniqueness/existence checks include `tenant_id`.
  - `failedValidation()` / `failedAuthorization()` — route errors into the uniform `{status:false, message, errors}` envelope via `App\Support\Response` (HTTP 422 / 403).
  - `validated()` — inherited from `FormRequest` (returns only the ruled keys — the mass-assignment-safe payload the controller hands the service).

## Key decisions (the concrete WHY)
- **Authority from `Context`, never the body.** The tenant-scoped helpers read `Context::tenantId()` at rule-build time and constrain `unique`/`exists` to that tenant, so a cross-tenant value can't satisfy validation — verified both directions.
- **Tenant-scoped `unique`/`exists` built on `Illuminate\Validation\Rule` + `Context`, in the request engine.** `App\Support\Validate` provides predicate rules (`uuid7`/`slug`) but no `unique`/`exists` Rule-object builder, and these helpers must read `Context` (a request-boundary concern), so they live in `HasBaseRequest` rather than Support. Concrete requests still compose `Validate::uuid7()`/`slug()` alongside them.
- **One envelope on failure, owned by `App\Support\Response`.** `failedValidation` throws `HttpResponseException(Response::fail(errors, 422))` and `failedAuthorization` throws `Response::error('authorization', …, 403)` — never Laravel's default validation response, never a second envelope.
- **`validated()` left to `FormRequest`** — it already returns exactly the ruled keys; re-implementing it would be risky duplication. Combined with the repository's `fields()` allow-list (0007), input is filtered twice (boundary + write-shape).
- **No business logic, no data access** beyond the validator's own `unique`/`exists` queries; `declare(strict_types=1)`, hand-style, zero comments. No `array_*`/`preg_*`/`json_*`/`DB::` (grep-verified).

## Acceptance criteria — all met (sqlite probe, real validator)
- ✅ `ThingRequest extends BaseRequest` declaring only `rules()` validated writes; missing `required` → uniform `{status:false, message, errors.name}` envelope; valid input passed and `validated()` returned only ruled keys (un-ruled `extra` excluded).
- ✅ **Tenant-scoped `unique`** — `'taken'` (seeded under tenant A) is rejected under A but **accepted under B** (not taken there). **Tenant-scoped `exists`** — `ref='taken'` is **rejected under B** (exists only in A) and accepted under A. Cross-tenant validation leak prevented.
- ✅ `composer verify` exits 0.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Http/Requests/`, `app/Traits/`.

## Remaining risks
- **`uniqueInTenant`/`existsInTenant` scope to `Context::tenantId()`**, which is `null` for `super`/platform context → they then scope to `tenant_id IS NULL` (correct for platform-level uniqueness). A `super` cross-tenant write that targets a tenant via a validated body `tenant_id` will need the helper to scope to that body value instead — a concrete super-panel Request should pass it explicitly (e.g. an `inTenant($id)` variant) when that flow lands. Flagged.
- **The request does not gate access** (`authorize()` returns `true`) — RBAC is the route `has:` middleware (0018). A write reaching the controller without a `FormRequest` is a defect; routing every write through a `BaseRequest` is the controller/route layer's responsibility (0011).
- **`failedValidation`/`failedAuthorization` typed `: void`** (accepted by the gate; both always throw) — honoring the "return type on every signature" rule over the framework's untyped override.
- **`validated()` excludes un-ruled keys** — a field a concrete forgets to add to `rules()` silently won't reach the service; intended (allow-list), but concrete `rules()` must be complete.

ship it
