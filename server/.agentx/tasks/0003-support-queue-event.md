# 0003 — Build the `queue` and `event` swappable adapters

- Requirement: `0002-support-foundation.md` (clears `0001-compliance-floor.md`: heavy work queued/idempotent/tenant-stamped, Octane-safe).
- Deliverable type: lib
- Order: 0001 (built domains green). Independent of 0002.

## Responsibility
Provide tenant-stamped job dispatch (`Queue`, restoring tenant `Context` across the job boundary) and a swappable event publisher (`Event`, Redis/Horizon default, outbox-ready) — both behind a neutral `Driver`.

## Path
- `app/Support/queue/{index.php, Driver.php, Dispatch.php, Payload.php, Tenant.php, Retry.php}` — facade `App\Support\Queue`.
- `app/Support/event/{index.php, Driver.php, RedisDriver.php, Payload.php, Outbox.php}` — facade `App\Support\Event`.

## Public interface
- `App\Support\Queue`:
  - `dispatch(object $job, ?string $queue = null): void` — stamps the current `tenant_id`/role into the payload (`Payload`/`Tenant`).
  - `Tenant::stamp(): array` (capture ctx) · `Tenant::restore(array $ctx): void` (rehydrate at job start) · `Tenant::reset(): void` (on finish).
  - `Retry::backoff(int $attempt): int` — bounded exponential backoff.
- `App\Support\Event`:
  - `publish(string $event, array $payload = [], ?string $key = null): void` — through the active `Driver` (default `RedisDriver`); `key` is the tenant-scoped idempotency/partition key.
  - `Outbox::record(string $event, array $payload, ?string $key): void` — durable-delivery hook, present but inert until a system opts into transactional delivery.
- `Driver` (each): neutral contract; adding Kafka/Redpanda/SQS = ONE new `Driver` file.

## Invariants
- A dispatched job carries `tenant_id`; `handle()` restores tenant `Context` at start and resets after — an unstamped/leftover-tenant job is corruption (`tenancy-playbook.md`).
- Event keys and queue payloads are tenant-scoped; no broker in v1 (Redis/Horizon default); `Outbox` is declared, not wired into delivery yet.
- Octane-safe: tenant/role state lives only in `Context`, never a static; listeners/bindings are registered at boot, never per-request.
- Zero business logic; `declare(strict_types=1)`; exact hand-style; zero comments; no reserved-keyword names; first-party only.

## Acceptance criteria
- Both folders exist with `index.php` facade + `Driver` interface + a concrete driver + manager; `App\Support\Queue` and `App\Support\Event` resolve and are callable after `composer dump-autoload`.
- A round-trip proves a job dispatched under tenant A restores tenant A inside `handle()` and resets after (not tenant B).
- `Event::publish` reaches the Redis driver with a tenant-scoped key; `Outbox::record` exists and is callable.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0001.
