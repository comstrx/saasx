# Complete the Support std-lib foundation

Finish the entire `app/Support/` native / infrastructure std-lib to production quality — the canonical 24-domain
map. Support is the base of the dependency stack (`support → traits → bases → …`); it is laid **complete first**,
as the project's foundation, before any layer is built on top of it. This is the one owner-sanctioned exception
to systems-first build order, justified only because Support is pure native/infra with **zero business logic**
and is depended on by every layer above. It is not license to pre-build anything else.

## What is required
Every domain present as a folder with an `index.php` public facade (`App\Support\<Name>::x()`) plus its internal
PascalCase pieces, across the full map:

```
arr  cache†  cast  context  database  date  event†  file
http  json  lock†  log  mail  net  num  parse
queue†  request  response  security  storage†  str  throttle†  validate
```

- **`†` domains are swappable adapters** (`cache, event, lock, queue, storage, throttle`): a `Driver` interface
  + ≥1 concrete driver + a manager in `index.php`. Keep the neutral interface even where only one backend exists
  today — adding a backend later must be ONE file.
  - `cache` — full DSL (get/read/set/update/remember/refresh/forget/index/reset/flush) with indexed (tag) partial
    invalidation; the tag piece is `cache/Tag` (never a reserved/colliding name).
  - `event` — `publish(event, payload, key)`; default driver Redis/Horizon; an `Outbox` piece present for durable
    delivery later; no real broker in v1.
  - `storage` — `s3` driver everywhere (MinIO dev / AWS prod), tenant-namespaced keys, signed `TemporaryUrl`.
  - `throttle` — per-plan rate limiting. `lock` — distributed lock (serves idempotency). `queue/Tenant`
    stamps/restores tenant context across jobs.
- **`response/`** — the exact uniform envelope (`{status:true, data, …}` / `{status:false, message, errors}`).
- **`context`** is the single Octane-safe source of truth for the active role/tenant/super tag; `database/Rls`
  and `queue/Tenant` read it. `http` SSRF-guards outbound via `net/Ip`. `mail` is the Mailgun **HTTP API**,
  always queued (never SMTP). `num/Money` is integer minor-units math only. `log/Redact` never logs secrets.
  `security` wraps core crypto — no DIY crypto.
- **`str/`** is already built and is the reference hand for style — keep it; it may be hardened to production
  (edge cases, types, missing helpers) but its public surface and hand-style must not change.

## Constraints
Zero business logic in any Support class (native/infra only); no class name is a reserved keyword;
`declare(strict_types=1)` everywhere; exact hand-style; clear concise names; facade-shadowing rule respected;
zero comments. No new external libraries except the crypto / money primitives. Do not consume Support from
business code yet; no speculative domains beyond the map. Tour `vsample/app/Helpers/*` for each domain's intent
first, then build ours stronger — never copied.

## Acceptance
- Every domain exists: folder + `index.php` facade + its pieces; each `†` domain has a `Driver` interface + ≥1
  driver + a manager.
- Zero business logic in any Support class; no reserved-keyword class names.
- `composer dump-autoload` clean; every `App\Support\<Name>` facade resolves and is callable.
- Gate green (Larastan level 8, no suppressions, route boot OK).
