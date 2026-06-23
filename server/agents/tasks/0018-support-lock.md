# 0018 — support/lock † — distributed lock

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/lock/` · Facade: `App\Support\Lock` (`app/Support/lock/index.php`).
Depends on: 0011-support-context (scoped lock keys, optional). **† swappable adapter.**

## Goal
Distributed lock (Redis) behind a neutral interface; **serves idempotency** (`arch.md` §5). Swappable: add a backend = ONE file.

## Build
- `index.php` → `namespace App\Support; class Lock` (manager/facade): acquire/release/block/get with owner token + ttl.
- Pieces (`namespace App\Support\Lock`): `Driver` (interface), `RedisDriver` (concrete), `Mutex` (acquire→run→release
  helper with safe release on the owner token only).
- Keep the neutral `Driver` interface even with one backend.

## Tour first (intent only — vsample.md)
No 1:1 analog; tour `vsample/app/Helpers/*` for hand/intent, build to §5.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Locks are owner-token-checked on release (no foreign unlock); bounded wait/ttl; no business logic.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Lock` resolves; `Driver` + `RedisDriver` + manager present; `composer lint` exits 0.
