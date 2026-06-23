# 0019 — support/throttle † — per-plan rate limiting

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/throttle/` · Facade: `App\Support\Throttle` (`app/Support/throttle/index.php`).
Depends on: 0011-support-context (per-tenant limit keys, optional). **† swappable adapter.**

## Goal
Rate-limiting primitive behind a neutral interface — the mechanism per-plan limits will use later (`arch.md` §5).
The plans/limits themselves are business (out of scope); this is the limiter only. Swappable: add a backend = ONE file.

## Build
- `index.php` → `namespace App\Support; class Throttle` (manager/facade): hit/tooManyAttempts/remaining/clear/availableIn.
- Pieces (`namespace App\Support\Throttle`): `Driver` (interface), `RedisDriver` (concrete), `Limit`
  (a limit value object: max attempts + window key).
- Keep the neutral `Driver` interface even with one backend.

## Tour first (intent only — vsample.md)
No 1:1 analog; tour `vsample/app/Helpers/*` for hand/intent, build to §5.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- No plan/business limits hard-coded here — the limiter takes a `Limit`. No business logic.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Throttle` resolves; `Driver` + `RedisDriver` + manager present; `composer lint` exits 0.
