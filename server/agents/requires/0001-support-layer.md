# 0001 — Complete the `app/Support/` layer (production-ready foundation)

Finish the entire `app/Support/` native / infrastructure std-lib to **production quality**, fully
implementing the canonical 24-domain map in `contracts/arch.md` §5. Support is the base of the dependency
stack (`support → traits → bases → …`); the owner has chosen to lay it **complete first**, as the project's
foundation, before any system is built on top of it.

## Note on systems-first (owner-sanctioned exception)

`overview.md` / `design.md` / `tolerance.md` mandate **systems-first — build only what a system needs, no
speculative breadth**. This requirement is a **deliberate, owner-sanctioned exception for the Support layer
ONLY**, and only because Support is pure native/infra with **zero business logic**, sits at the bottom of the
stack, and is depended on by every layer above. It is the one foundation pass we build whole. The
systems-first rule stays in full force for every other layer — traits, bases, repositories, services,
controllers, … remain per-system. Do **not** treat this as license to pre-build anything beyond Support.

## Scope — build the §5 map, every domain

Implement every domain in the `contracts/arch.md` §5 Support map. Each domain = a folder with an `index.php`
public facade (`namespace App\Support; class <Name>` → `App\Support\<Name>::x()`) plus internal PascalCase
pieces (`namespace App\Support\<Name>`):

```
arr   cache†  cast   context  database  date   event†  file
http  json    lock†  log      mail      net    num     parse
queue†  request  response  security  storage†  str   throttle†  validate
```

- **`†` domains are swappable adapters** (`design.md` §6): a `Driver` interface + at least one concrete
  driver (`RedisDriver` / `LocalDriver` / `S3Driver` / …) + a manager in `index.php`. **Keep the neutral
  interface even where only one backend exists today** — adding a backend later must be ONE file. The `†`
  set: `cache, event, lock, queue, storage, throttle`.
  - `cache` exposes the full DSL: get/read/set/update/remember/refresh/forget/**index**/reset/flush with
    indexed (tag) partial invalidation. `cache/Tag` (never `Index` — collides with `index.php`).
  - `event` exposes `App\Support\Event::publish(event, payload, key)`; default driver Redis/Horizon;
    `Outbox` piece present for durable delivery later. No real broker in v1.
  - `storage` = `s3` driver everywhere (MinIO dev / AWS prod), tenant-namespaced keys, signed `TemporaryUrl`.
  - `throttle` = per-plan rate limiting. `lock` = distributed lock (serves idempotency). `queue` `Tenant`
    piece stamps/restores tenant context across jobs.
- **`response/`** — build `App\Support\Response` to the exact envelope in `arch.md` §7
  (`{status:true, data, …}` / `{status:false, message, errors}`), with `Envelope` / `Failure` /
  `Pagination` / `Meta` pieces. (It was just removed — rebuild it here.)
- **`str/`** — **already built; it is the reference hand for style.** Keep it. You MAY harden it to
  production (edge cases, types, missing helpers a domain needs) but **do NOT break its public surface** or
  alter its hand-style.

## Intra-layer dependencies (sequence tasks accordingly)

- `context` is the **single source of truth** for the active role/tenant/super tag (Octane-safe wrapper over
  Laravel `Context`); `database/Rls` and `queue/Tenant` read from it — build `context` before them.
- `http` SSRF-guards outbound via `net/Ip` — build `net` before `http`.
- `mail` = Mailgun **HTTP API** transport, **always queued** (never SMTP). `num/Money` = integer minor-units
  math only. `log/Redact` never logs secrets. `security` **wraps core crypto** — no DIY crypto.

## Constraints (all contracts apply, every line)

- **Zero business logic** in Support — native/infra helpers only (`arch.md` §5).
- Exact hand-style (`style.md`), clear concise names (`naming.md`), `declare(strict_types=1)` everywhere,
  reserved-keyword avoidance (`Boolean`/`Casing`/`Matches`/`cache/Tag`), facade-shadowing rule (never
  alias-import both Illuminate's and ours in one file). **Zero comments.**
- **Tour `vsample/app/Helpers/*` first** for the intent of each domain, then build ours stronger / cleaner
  (`vsample.md`) — never copied verbatim.
- `index.php` folder convention; run **`composer dump-autoload`** after adding files (classmap is static).
- No new external libraries except crypto / money primitives (`tools.md`).

## Out of scope

Traits, bases, models, migrations, routes, any business wiring. **Support layer only** — do not consume it
from business code yet. Build only the §5 domains; **no speculative domains beyond the map.**

## Acceptance

- Every domain in the §5 map exists: folder + `index.php` facade + its pieces; each `†` domain has a `Driver`
  interface + ≥1 concrete driver + a manager in `index.php`.
- Zero business logic in any Support class; no class name is a reserved keyword.
- `composer dump-autoload` clean; every `App\Support\<Name>` facade resolves and is callable.
- **Gate green: `composer verify` exits 0** (phpstan level 8, no suppressions, route boot OK).
