# 0016 — Permission resolver (the authority-locked cascade)

- Requirement: `0006-rbac-dna.md` (clears `0001-compliance-floor.md`: server-authoritative, fail-closed, tenant-scoped cache, no N+1).
- Deliverable type: lib
- Order: 0015 (RBAC schema + models), 0001 (`App\Support\Cache`).

## Responsibility
Resolve one permission down the four-scope authority cascade to `{allow, locked, source}` — fail-closed, tenant-scoped, cached — the hot, stateless core every gate and panel reads.

## Path
- `app/Traits/Dna/Permissions/Resolver.php` (RBAC subsystem folder; placed in the DNA layer, NOT `app/Support` — resolution is permission business logic, and `app/Support` is zero-business-logic by law). The executor may add focused siblings (`Cascade`, `Authority`).

## Public interface
- `Resolver::resolve(string $tenantId|null, string $permissionKey, ?string $role = null, ?string $targetType = null, ?string $targetId = null, ?string $userId = null): array{allow: bool, locked: bool, source: string}`.
- `Resolver::allows(...): bool` — the effective `allow` only (what the gate uses).
- `Resolver::matrix(string $scope, ...): array` — the editable settings map a tenant admin renders (each entry carrying `locked`).
- Cache: resolved sets cached per `tenant+permission+scope` via `App\Support\Cache` with tag invalidation; any write busts the affected tag (never `flush`).

## Invariants
- **Locked wins from the top:** highest-authority `locked` match (global→tenant→entity→item) decides; else most specific explicit `allow` (item+actor > item > entity > tenant > global); else catalog default; else **deny**. "No rule" is never "allowed".
- `super` outranks `tenant`; a `super` `locked=true` row is final (tenant cannot override → rendered faded). Authority/identity come from `App\Support\Context`, NEVER the request body.
- Tenant-scoped: a non-global `permission_settings` row missing `tenant_id` is a cross-tenant grant — rejected. Resolution is N+1-free: resolve the set once per (tenant, entity), reuse across a page.
- Stateless + Octane-safe (cache, not statics, for resolved verdicts — those are per-tenant). `declare(strict_types=1)`; exact hand-style; zero comments; array return shape-tagged (`array{allow:bool,locked:bool,source:string}`).

## Acceptance criteria
- A missing rule resolves to `allow=false` (fail-closed); a super `locked` row is final over a tenant override; the most-specific allow wins when nothing is locked.
- A grant/lock change busts exactly its tag; a second resolve reflects it; no per-row resolution on a list.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0015. Precedes 0017 (DNA composes the resolver) and 0018 (gate calls it).
