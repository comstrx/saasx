# Task 0002 — Build the `lock` and `throttle` swappable adapters

Executor: claude_1. First and only executor on this task (no prior `0002` work in `.agentx/reports/tasks/`; the file held my finished `0001` audit report, now overwritten). `app/Support/lock` and `app/Support/throttle` were empty — greenfield build on the proven `cache` adapter template.

## What I implemented (7 new files)
**`app/Support/lock/`** — facade `App\Support\Lock` (distributed mutex, serves idempotency):
- `index.php` — manager: `block/acquire/release/get` + tenant-prefixed `key()` + lazy `static ?Driver $driver`.
- `Driver.php` — neutral interface (`mutex(key,ttl): Mutex`, `forget(key)`); swapping a backend = one new Driver file.
- `RedisDriver.php` — wraps first-party `\Illuminate\Support\Facades\Cache::lock()` (uses the default redis store → `lock_connection` = Redis DB 7 per `config/cache.php`).
- `Mutex.php` — wraps `\Illuminate\Contracts\Cache\Lock`; `acquire/release/block`.

**`app/Support/throttle/`** — facade `App\Support\Throttle` (per-plan rate limiting):
- `index.php` — manager: `attempt/tooMany/hit/clear/retryAfter` + tenant-prefixed `key()` + lazy `static ?Driver $driver`.
- `Driver.php` — neutral interface (`hit/tooMany/availableIn/clear`).
- `RedisDriver.php` — wraps first-party `Illuminate\Cache\RateLimiter` constructed on the dedicated `rate_limit` store (Redis DB 6).

## Key design decisions (the concrete WHY)
- **Reuse first-party primitives, not raw `SET NX`/Lua.** Laravel ships atomic owner-token locks (`Cache::lock` → Lua compare-and-delete release, `block` with try/finally) and `RateLimiter` (hit/decay/availableIn). `tools.md` mandates first-party Laravel + "reuse before introducing"; rolling my own Lua would duplicate tested code. The neutral `Driver` interface still wraps them, so swapping the backend stays a one-file change.
- **`Mutex` wraps the Illuminate `Lock` object** so the owner token lives in that object → `acquire`/`release` on the same Mutex are owner-safe; `block()`/`get($cb)` release in `finally` (verified: re-acquire after `block` succeeds). The `Lock` **contract** exposes `get/block/release/forceRelease` but not `acquire`, so `Mutex::acquire()` uses `(bool) $lock->get()` (no-callback acquire) — keeps the engine on the contract, gate-clean at L8 (`Repository::lock()` is a magic `__call` PHPStan would reject; the `Cache` facade `@method lock()` is typed).
- **Standalone `Lock::release($key)` is a force-release (DEL)**, because the facade is static and the per-acquire owner isn't retained across calls. The owner-safe path is `block()` / a held `get()` Mutex — which is exactly what the idempotency middleware will use. Deliberate and pragmatic, not gold-plated (no cross-request owner storage invented).
- **`block($key,$seconds,$fn)`**: `$seconds` is one knob = lock TTL and max wait; contends → `LockTimeoutException`; `$fn` throw → released in `finally`. Caller sets TTL > work time (standard distributed-lock caveat; no auto-extension built — would be speculative).
- **Throttle on the dedicated `rate_limit` connection** (`new RateLimiter(Cache::store('rate_limit'))`) so counters land in Redis DB 6, honoring "logical DBs split by concern" rather than the default `RateLimiter` facade (cache DB 1).
- **Tenant prefix mirrors `cache/Scope`** exactly — `t:<tenantId|platform>:<lock|throttle>:<key>` via a private `key()` reading `App\Support\Context::tenantId()`. No new shared helper introduced (would churn task 0001's green `cache` files); the one-liner matches the established per-domain pattern.
- **Dropped the suggested `Limit.php`** (and a `Driver::attempts`) — no consumer exists and the frozen interface (`attempt/tooMany/hit/clear/retryAfter`) is complete; adding them would be speculative abstraction (`tolerance.md`). Task explicitly leaves the final piece list to the executor.

## Nothing kept/changed/removed from prior work
No prior `0002` code existed; I added only the 7 new files. No existing file was touched (task 0001's audited domains left green and untouched).

## Octane safety
`static ?Driver $driver` holds a **stateless** RedisDriver (no instance state — `Mutex` and `RateLimiter` are built per call). Per-request tenant lives only in `Context`, read at `key()` time. No request/tenant state in any static. ✓

## Acceptance criteria — all met
- ✅ Both folders have `index.php` facade + `Driver` interface + `RedisDriver` + manager; `App\Support\Lock` and `App\Support\Throttle` resolve after `composer dump-autoload`.
- ✅ **Contended lock is mutually exclusive** (probe: acquire#1 `true`, #2 same key `false`, release, #3 `true`; `block` ran the closure and auto-released). **Throttle over window denies + reports `retryAfter`** (hit→1,2; `tooMany(2)` true, `tooMany(5)` false; `retryAfter` 60; over-limit `attempt` threw; `clear` reset; under-limit `attempt` ran).
- ✅ **Keys observably tenant-prefixed** — real Redis keys: `saasx-database-t:<tenant-uuid>:lock:<key>` (lock DB 7) and `…t:<tenant-uuid>:throttle:<key>` (rate_limit DB 6).
- ✅ Zero business logic; `declare(strict_types=1)`; hand-style; zero comments; no reserved-keyword class names; no facade-shadow clash (Illuminate `Cache` referenced fully-qualified, never `use`d alongside ours); no new external library.

## Gate
`composer verify` → **exit 0** (composer.json valid; phpstan level 8 → No errors, 125 files; `route:cache` boots and clears). Functional probe passed against live Redis, then removed (no stray files; `git status` shows only the 7 new Support files).

## Remaining risks
- **Lock TTL vs. work time**: if a critical section outruns the lock TTL the lock auto-expires and a second worker can enter — the standard distributed-lock contract; callers pick TTL > max work. No lease-extension (would be speculative for v1).
- **`Throttle::attempt` deny** throws a plain `\RuntimeException`; the `Retry-After` value is fetched via `retryAfter($key)`. A structured throttle exception carrying `retryAfter` belongs with the rate-limit middleware (later task) — added then under rule-of-two, not now.
- **`tooMany($key,$max,$window)`** keeps `$window` in the frozen signature though `RateLimiter` sets decay at `hit` time and ignores it at check — signature honored, behavior correct.

ship it
