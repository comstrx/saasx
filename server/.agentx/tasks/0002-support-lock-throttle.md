# 0002 — Build the `lock` and `throttle` swappable adapters

- Requirement: `0002-support-foundation.md` (clears `0001-compliance-floor.md`: Octane-safe, tenant-keyed, no secrets).
- Deliverable type: lib
- Order: 0001 (built Support domains confirmed green — uses none of the other empty domains).

## Responsibility
Provide a distributed mutex (`Lock`, serving idempotency) and per-plan rate limiting (`Throttle`), each behind a neutral `Driver` interface with a Redis backend.

## Path
- `app/Support/lock/{index.php, Driver.php, RedisDriver.php, Mutex.php}` — facade `App\Support\Lock`.
- `app/Support/throttle/{index.php, Driver.php, RedisDriver.php, Limit.php}` — facade `App\Support\Throttle`.
(Final piece list is the executor's call; the `Driver` interface + ≥1 concrete driver + the `index.php` manager are mandatory, per the `arch.md §5` map.)

## Public interface
- `App\Support\Lock`:
  - `block(string $key, int $seconds, \Closure $fn): mixed` — acquire, run, release (auto-release on throw).
  - `acquire(string $key, int $ttl): bool` · `release(string $key): void` · `get(string $key, int $ttl): Mutex`.
- `App\Support\Throttle`:
  - `attempt(string $key, int $max, int $window, \Closure $fn): mixed` — runs `$fn` if under limit, else throws/returns a deny.
  - `tooMany(string $key, int $max, int $window): bool` · `hit(string $key, int $window): int` · `clear(string $key): void` · `retryAfter(string $key): int`.
- `Driver` (each domain): the neutral contract its `RedisDriver` implements; swapping a backend is ONE new `Driver` file + config.

## Invariants
- Every Redis key is tenant-prefixed (read tenant from `App\Support\Context`); an unprefixed key is a cross-tenant leak.
- Octane-safe: no per-request state in statics/singletons; the lock is connection-safe under a long-lived worker.
- `Lock` is reentrancy-correct and always releases on exception (no orphaned lock); idempotency middleware can build on `block()`.
- Zero business logic — pure infra. `declare(strict_types=1)`, exact hand-style, zero comments, no reserved-keyword class names.
- Built only on `App\Support\*` + first-party Laravel/Redis — no new external library.

## Acceptance criteria
- Both folders exist with `index.php` facade + `Driver` interface + `RedisDriver` + manager; `App\Support\Lock` and `App\Support\Throttle` resolve and are callable after `composer dump-autoload`.
- A lock contended on the same key is mutually exclusive; a throttle over its window denies and reports `retryAfter`.
- Keys observably carry the tenant prefix.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0001.
