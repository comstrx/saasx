# 0020 — support/queue † — dispatch + tenant-stamped jobs

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/queue/` · Facade: `App\Support\Queue` (`app/Support/queue/index.php`).
Depends on: **0011-support-context** (`Tenant` stamps/restores the tenant tag across jobs). **† swappable adapter.**

## Goal
Dispatch behind a neutral interface, with the **`Tenant` piece that stamps `tenant_id` into the payload and
restores/resets the tenant `Context` at job start/end** (`arch.md` §10, `tolerance.md` sacred). Horizon/Redis default.

## Build
- `index.php` → `namespace App\Support; class Queue` (manager/facade): dispatch/dispatchSync/later/onQueue.
- Pieces (`namespace App\Support\Queue`): `Driver` (interface), `RedisDriver` (Laravel/Horizon concrete backend),
  `Dispatch` (push a job via the driver), `Payload` (envelope incl. tenant stamp), `Tenant` (stamp current
  `Context::tenantId()` into payload; restore tenant `Context` on job start, reset after), `Retry` (bounded retry/backoff config).
- Keep the neutral `Driver` interface even though only the Redis/Horizon backend exists today.
- Facade `Queue` **shadows Illuminate `Queue`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
No 1:1 analog; tour `vsample/app/Helpers/*` for hand/intent, build to §5.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Tenant stamp/restore is mandatory (jobs must not leak/lose tenant). Idempotent, bounded retries. No business logic.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Queue` resolves; `Driver` + `RedisDriver` + manager + `Tenant` present; `composer lint` exits 0.
