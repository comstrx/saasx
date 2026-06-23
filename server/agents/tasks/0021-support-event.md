# 0021 — support/event † — publish abstraction (outbox-ready)

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/event/` · Facade: `App\Support\Event` (`app/Support/event/index.php`).
Depends on: 0020-support-queue (default delivery via Redis/Horizon). **† swappable adapter. No real broker in v1.**

## Goal
All domain-event publishing flows through `App\Support\Event::publish(event, payload, key)` behind a swappable `Driver`
(`design.md` §6, `arch.md` §5). Default driver = Redis/Horizon; `Outbox` piece present for durable delivery later.
**Do not build Kafka/Redpanda/SQS** — adding one = ONE Driver file later.

## Build
- `index.php` → `namespace App\Support; class Event` with `publish(string $event, array $payload, ?string $key): void`.
- Pieces (`namespace App\Support\Event`): `Driver` (interface), `RedisDriver` (default backend), `Payload` (event
  envelope), `Pending` (buffer/flush within a unit of work), `Key` (partition/dedupe key), `Outbox` (durable-delivery
  scaffold — interface/shape present, not wired to a table in v1).
- Keep the neutral `Driver` interface even with one backend.
- Facade `Event` **shadows Illuminate `Event`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
`vsample/app/Events/*` (e.g. `ChatEvent`) for intent — build the swappable publish abstraction, not concrete events.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- No concrete business events here; no broker beyond Redis/Horizon in v1. No business logic.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Event::publish(...)` resolves; `Driver` + `RedisDriver` + manager + `Outbox` present; `composer lint` exits 0.
