# 0018 — RBAC edge middleware (`Has` + `Role`)

- Requirement: `0006-rbac-dna.md` (clears `0001-compliance-floor.md`: server-side authorization, `route:cache`-safe, fail-closed).
- Deliverable type: lib
- Order: 0017 (RBAC DNA), 0011 (`Controller` action set).

## Responsibility
The thin edge gates: a fine-grained permission gate (`has:<permission>`) and a coarse role-membership gate (`role:<role>`), both server-authoritative and `route:cache`-safe.

## Path
- `app/Http/Middleware/Has.php` — the `has:` permission gate.
- `app/Http/Middleware/Role.php` — the role-membership gate.
- Register both as route-middleware aliases in `bootstrap/app.php` (string aliases — no closures).

## Public interface
- `Has` (`has:view_products`): resolves effective `allow` for the authenticated actor via `HasPermissions::can()` (the resolver), 403s on deny. CRUD keys derive from the resource segment (`view_/add_/edit_/delete_<resource>`); cross-cutting keys (`allow_statistics`, `allow_comments`, …) are passed explicitly.
- `Role` (`role:admin`): asserts the actor holds the panel's expected role via `HasRoles::hasRole()` (multi-role users supported); 403 on miss.
- Both read actor/tenant/role from `App\Support\Context`; both are string-referenced middleware (`route:cache`-safe).

## Invariants
- Fail-closed: deny on any unresolved/denied permission or missing role; never trust a client-supplied role/permission.
- `locked` is NOT consulted by the gate (it governs editability, not access).
- `route:cache`-safe: string middleware, no closures, no boot-time globbing; registered as aliases at boot.
- Octane-safe (no per-request statics). `declare(strict_types=1)`; exact hand-style; zero comments.

## Acceptance criteria
- A request lacking the permission gets 403; one holding it passes; the derived CRUD keys gate index/store/update/delete.
- `role:` rejects an actor without the panel role; multi-role actors pass on any held role.
- `php artisan route:cache` succeeds with the middleware applied; `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0017, 0011.
