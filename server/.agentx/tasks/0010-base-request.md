# 0010 — `HasBaseRequest` engine trait + `BaseRequest` shell

- Requirement: `0003-base-engine-traits.md` (clears `0001-compliance-floor.md`: mandatory boundary validation, untrusted input is hostile).
- Deliverable type: lib
- Order: 0001 (`App\Support\Validate`, `App\Support\Context`). Independent of 0006–0009.

## Responsibility
The boundary-validation engine: mandatory Form Request validation for every write, with shared rule plumbing — concrete requests declare only `rules()` (and per-type overrides).

## Path
- `app/Traits/Bases/HasBaseRequest.php` (engine).
- `app/Http/Requests/BaseRequest.php` (thin shell extending `Illuminate\Foundation\Http\FormRequest`, `use HasBaseRequest;`).

## Public interface
- Engine `HasBaseRequest`:
  - `rules(): array` — concrete declares; default `[]`.
  - `authorize(): bool` — returns `true` by default (access is gated at the route by the `has:<permission>` middleware, task 0018 — the request does NOT re-implement RBAC). May read `App\Support\Context` for shape-level checks only.
  - `validated($key = null, $default = null): mixed` — the validated write payload the controller hands to the service.
  - shared rule helpers built on `App\Support\Validate` (e.g. tenant-scoped `exists`/`unique` via `Rule` objects) so uniqueness/existence checks include `tenant_id`.
  - `failedValidation(...)` routes errors into the uniform fail envelope via `App\Support\Response`.

## Invariants
- Validation runs on every write at the boundary; a write without a Form Request is a defect.
- Identity/authority is read from `App\Support\Context`, never trusted from the body; `unique`/`exists` rules are tenant-scoped (`Rule::exists(...)->where('tenant_id', Context::tenantId())`) to avoid cross-tenant validation leaks.
- Validation failures emit the uniform `{status:false, message, errors}` envelope.
- No business logic in a request; `declare(strict_types=1)`; exact hand-style; zero comments; array returns shape-tagged.

## Acceptance criteria
- A concrete Request `extends BaseRequest` declaring only `rules()` validates writes and returns the uniform fail envelope on invalid input.
- A tenant-scoped `unique`/`exists` helper rejects a value from another tenant.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0001. Precedes 0011 (controller routes through the Request). No dependency on RBAC (0015–0018).
