# 0017 — support/cache † — full DSL + indexed (tag) invalidation

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/cache/` · Facade: `App\Support\Cache` (`app/Support/cache/index.php`).
Depends on: 0011-support-context (per-tenant key scoping). **† swappable adapter.**

## Goal
Neutral cache DSL with **indexed (tag) partial invalidation** — invalidate one tag without flushing everything
(`design.md` §6, `arch.md` §5). Redis first, **swappable: adding a backend = ONE Driver file.** Keys namespaced per tenant.

## Build
- `index.php` → `namespace App\Support; class Cache` (the manager/facade — the ONLY thing callers touch). Full DSL:
  `get/read/set/update/remember/refresh/forget/index/reset/flush` with indexed (tag) partial invalidation.
- Pieces (`namespace App\Support\Cache`): `Driver` (the interface/contract), `RedisDriver` (concrete backend),
  `Key` (per-tenant key building via `Context`), `Tag` (the tag index — **`Tag`, never `Index`**, which collides with
  `index.php`), `Entry` (value+ttl wrapper), `Scope` (tenant/namespace scope).
- Keep the neutral `Driver` interface even though only Redis exists today (the contract that makes the swap one file).
- Facade `Cache` **shadows Illuminate `Cache`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
`vsample/app/Helpers/Cache.php` for the owner's cache/tag intent — build ours stronger, swappable, per-tenant.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Per-tenant key namespacing is mandatory (`arch.md` §10). Reserved-keyword avoidance (`Tag`). No business logic.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Cache` resolves with the full DSL; `Driver` interface + `RedisDriver` + manager present; `composer lint` exits 0.
