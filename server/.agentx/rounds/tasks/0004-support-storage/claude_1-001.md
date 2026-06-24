# Task 0003 — Build the `queue` and `event` swappable adapters

Executor: claude_1. First/only executor on this task (no prior `0003` work; the file held my finished `0002` report, now overwritten). `app/Support/queue` and `app/Support/event` were empty — greenfield, built on the proven `cache`/`lock` adapter shape.

## What I implemented (11 new files)
**`app/Support/queue/`** — facade `App\Support\Queue` (tenant-stamped dispatch):
- `index.php` — manager: `dispatch(object $job, ?queue)` → wraps the job in a `Payload` envelope carrying `Tenant::stamp()`, pushes via lazy `static ?Driver`.
- `Driver.php` — neutral contract (`push(Payload, ?queue)`); a Kafka/SQS backend = one new Driver file.
- `Dispatch.php` — default concrete driver: sets the queue then `Bus::dispatch` (Laravel/Horizon backend).
- `Payload.php` — `ShouldQueue` envelope (`Queueable, InteractsWithQueue, SerializesModels`): restores tenant `Context` at `handle()` start, runs the inner job's `handle` via the container (DI), **resets in `finally`**; `backoff()` uses `Retry`.
- `Tenant.php` — context bridge: `stamp()` (capture panel/role/tenant_id/user_id), `restore(ctx)`, `reset()`.
- `Retry.php` — `backoff(int $attempt)`: bounded exponential in seconds (base 5, ×2, capped 600).

**`app/Support/event/`** — facade `App\Support\Event` (swappable publisher):
- `index.php` — manager: `publish(event, payload, key)` → builds a tenant-stamped `Payload`, publishes via lazy `static ?Driver` (default `RedisDriver`).
- `Driver.php` — neutral contract (`publish(Payload)`).
- `RedisDriver.php` — default: `XADD` to a tenant-scoped stream (`t:<tenant|platform>:events`, MAXLEN ~10000) on the default Redis connection.
- `Payload.php` — message VO: `event`, `data`, tenant-scoped `scopedKey()` (`t:<tenant>:<key>`), UTC `at`, `fields()` (JSON-encoded via `App\Support\Json`).
- `Outbox.php` — declared, inert `record()` seam (builds the Payload shape; no delivery, no outbox table in the Support layer — per task).

## Key decisions (the concrete WHY)
- **Owned envelope, not framework auto-propagation.** The task contract is an explicit, owned mechanism (`Payload`/`Tenant` stamp→restore→reset). Wrapping the arbitrary job in a `Payload` envelope makes the round-trip self-contained and provable now (no app-level boot wiring), and works deterministically even if Laravel also propagates `Context`. The inner job stays a first-class object; its `handle` runs through the container for DI.
- **Neutral `Driver` typed on our `Payload`**, not on a backend type — every backend pushes/publishes the same envelope, so a new broker is genuinely one file.
- **`Dispatch` (queue) uses `Bus::dispatch`** (not the `Queue` facade) — our `App\Support\Queue` shadows `Illuminate\...\Queue`; the facade-shadow rule forbids mixing, so the backend uses `Bus` + the Payload's `Queueable::onQueue`.
- **Event default = Redis stream** (`XADD`, MAXLEN-bounded): the faithful Redis analog of a broker topic (the swap target is Kafka/Redpanda/SQS), observable, outbox-compatible — vs. the in-process event bus, which isn't a broker.
- **`Outbox::record` is deliberately inert** (builds the Payload, no delivery): the transactional-outbox pattern needs a DB table written in the business transaction; no such table exists in the Support layer and Support has zero business logic, so delivery is deferred (the architect's "declared, not wired"). Not a silent drop — nothing currently calls it for delivery.
- **`Retry` is its own class** (seconds, static), distinct from the existing `http/Retry` (instance VO, milliseconds) — different unit and domain; not duplicated.
- **`Tenant::stamp/restore`** typed with a precise `array{panel,role,tenant_id,user_id}` shape so restore is a direct `Context::set(...)` pipeline (gate-clean, no runtime guards needed on an owned internal contract).

## Bug found & fixed (PHPStan missed it; the runtime probe caught it)
`Payload` first declared `public object $job`, which **collides with `InteractsWithQueue`'s protected `$job`** property (incompatible composition → fatal `E_ERROR` at class load, invisible to static analysis). Renamed the promoted property to `$inner`. This is exactly why I ran a live probe rather than trusting a green gate.

## Nothing kept/changed/removed from prior work
No prior `0003` code existed; added only the 11 new files. No existing file touched.

## Octane safety
`static ?Driver $driver` holds a stateless driver. Per-request tenant lives only in `Context`; the stamp is data on the Payload, never a static. `Tenant::reset()` in `finally` clears Context after every job so a worker never bleeds tenant state into the next job. ✓

## Acceptance criteria — all met (live probe against Redis)
- ✅ Both folders: `index.php` facade + `Driver` interface + concrete driver + manager; `App\Support\Queue` and `App\Support\Event` resolve after `composer dump-autoload`.
- ✅ **Round-trip**: with ambient Context set to tenant **B**, a job stamped under tenant **A** saw **A** (tenant + user) inside `handle()` and Context **reset to null** after — proving restore-over-foreign-context and reset, not B. Sync `Queue::dispatch` path also restored A and reset.
- ✅ **`Event::publish` reaches the Redis driver with a tenant-scoped key**: stream `t:<A>:events` held the entry with `key=t:<A>:order:o-123` and JSON `data`. **`Outbox::record` exists and is callable** (no throw).
- ✅ Zero business logic; `declare(strict_types=1)`; hand-style; zero comments; no reserved-keyword names; no facade-shadow clash; first-party only (no new dependency).

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors, 136 files; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Support/queue/` and `app/Support/event/`.

## Remaining risks
- **Envelope vs. inner-job queue config**: the `Payload` envelope owns queue/tries/backoff; an inner job's own `$tries`/`ShouldBeUnique`/`failed()` are not honored through `Queue::dispatch`. Acceptable for v1's single controlled entry point; revisit if jobs need per-job retry policy (rule-of-two).
- **RLS in jobs not re-applied**: `Tenant::restore` restores `Context` (primary isolation — `HasTenant` reads it); the transaction-local RLS GUC is not re-set at job start (it needs the job's own DB transaction boundary). Defense-in-depth only; to be wired where jobs run real queries under RLS (later task).
- **Outbox inert**: durable transactional delivery is deferred until an `outbox` table + relay exist; callers needing guaranteed delivery must not rely on `record()` yet.

ship it
