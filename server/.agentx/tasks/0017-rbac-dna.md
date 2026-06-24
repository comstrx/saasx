# 0017 — RBAC DNA traits (`HasRoles` + `HasPermissions`)

- Requirement: `0006-rbac-dna.md` (clears `0001-compliance-floor.md`: server-authoritative, fail-closed, never trust client).
- Deliverable type: lib
- Order: 0016 (resolver), 0015 (models).

## Responsibility
The opt-in capabilities: a model/actor gains roles + the permission cascade (incl. per-record special permissions) by `use`-ing a trait — a thin declaration over the resolver, never a parallel mechanism.

## Path
- `app/Traits/Dna/HasRoles.php` — many-to-many roles + membership checks.
- `app/Traits/Dna/HasPermissions.php` — the facade composing `app/Traits/Dna/Permissions/*` (`General`, `Special`, `Sync`, … the executor's split) over the resolver.

## Public interface
- `HasRoles`: `roles(): BelongsToMany` · `hasRole(string|array $role): bool` · `isSuper(): bool` · `isSupervisor(): bool` — membership read server-side.
- `HasPermissions` (for an actor or a governable model):
  - `can(string $key, ?Model $item = null): bool` — effective `allow` (fail-closed; what the gate uses).
  - `setting(string $key, ?Model $item = null): array{allow:bool,locked:bool,source:string}` — the tri-state for the frontend.
  - `settings(string $scope): array` — the editable matrix (each entry carrying `locked`).
  - tenant writes: `grant(string $key, string $scope, mixed $ref = null, bool $lock = false): static` · `revoke(...)` — refuse if a higher authority locked it.
  - super writes: `force(string $key, string $scope, bool $allow, bool $lock = true): static`.
  - `hasOrFail(string $key, ?Model $item = null): static` — 403 (fail-closed) for the edge.

## Invariants
- Authority/identity from `App\Support\Context` ONLY — client-supplied roles/permissions are never trusted.
- A tenant write to a permission a higher authority locked is rejected; `allow` gates access, `locked` gates editability (the two are never conflated).
- Per-record/special permissions resolve through the SAME cascade (one walk), not a second table/mechanism.
- Resolution is cached/tenant-scoped via the resolver (no per-row N+1). Octane-safe. `declare(strict_types=1)`; exact hand-style; zero comments; array returns shape-tagged.

## Acceptance criteria
- The `App\Models\User` from task 0015 mounts `use HasRoles, HasPermissions;` and resolves its effective set against its assigned roles (via `user_roles`); `can()` is fail-closed. A model gains item-level governance the same way (`use HasPermissions;`).
- A tenant `grant` on a super-locked permission is refused; a `force` by super sets+locks and renders faded in `setting()`.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0016, 0015. Precedes 0018 (middleware uses `can`/`hasOrFail`).
