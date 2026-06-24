# Requirements — SaasX server

Two requirements for the next run, in one file. The manager splits this into ordered, single-concern files
under `.agentx/requires/` at intake — drop more blocks here over time.

---

## Requirement 1 — Complete the `app/Support/` layer (the foundation)

Finish the entire `app/Support/` native / infrastructure std-lib to **production quality** — the canonical
24-domain map. Support is the base of the dependency stack (`support → traits → bases → …`); we lay it
**complete first**, as the project's foundation, before any system is built on top of it. This is the one
**owner-sanctioned exception** to systems-first, justified only because Support is pure native/infra with
**zero business logic** and is depended on by every layer above. It is NOT license to pre-build anything else.

**Scope — every domain.** Each domain = a folder with an `index.php` public facade
(`namespace App\Support; class <Name>` → `App\Support\<Name>::x()`) plus internal PascalCase pieces:

```
arr   cache†  cast   context  database  date   event†  file
http  json    lock†  log      mail      net    num     parse
queue†  request  response  security  storage†  str   throttle†  validate
```

- **`†` domains are swappable adapters**: a `Driver` interface + ≥1 concrete driver
  (`RedisDriver`/`LocalDriver`/`S3Driver`/…) + a manager in `index.php`. **Keep the neutral interface even
  where only one backend exists today** — adding a backend later must be ONE file. `†` set:
  `cache, event, lock, queue, storage, throttle`.
  - `cache` — full DSL: get/read/set/update/remember/refresh/forget/**index**/reset/flush with indexed (tag)
    partial invalidation; the tag piece is `cache/Tag` (never `Index` — collides with `index.php`).
  - `event` — `App\Support\Event::publish(event, payload, key)`; default driver Redis/Horizon; `Outbox` piece
    present for durable delivery later; no real broker in v1.
  - `storage` — `s3` driver everywhere (MinIO dev / AWS prod), tenant-namespaced keys, signed `TemporaryUrl`.
  - `throttle` — per-plan rate limiting. `lock` — distributed lock (serves idempotency). `queue/Tenant`
    stamps/restores tenant context across jobs.
- **`response/`** — `App\Support\Response` to the exact envelope (`{status:true, data, …}` /
  `{status:false, message, errors}`), with `Envelope`/`Failure`/`Pagination`/`Meta` pieces.
- **`str/`** is **already built — the reference hand for style.** Keep it; you MAY harden it to production
  (edge cases, types, missing helpers) but **never break its public surface** or alter its hand-style.

**Intra-layer dependencies (sequence accordingly).** `context` is the single source of truth for the active
role/tenant/super tag (Octane-safe wrapper over Laravel `Context`); `database/Rls` and `queue/Tenant` read it —
build `context` first. `http` SSRF-guards outbound via `net/Ip` — build `net` before `http`. `mail` = Mailgun
**HTTP API**, **always queued** (never SMTP). `num/Money` = integer minor-units math only. `log/Redact` never
logs secrets. `security` **wraps core crypto** — no DIY crypto.

**Constraints.** Zero business logic in Support (native/infra only). Exact hand-style, clear concise names,
`declare(strict_types=1)` everywhere, reserved-keyword avoidance, facade-shadowing rule, **zero comments**.
**Tour `vsample/app/Helpers/*` first** for each domain's intent, then build ours stronger — never copied.
`index.php` folder convention; run `composer dump-autoload` after adding files. No new external libraries except
crypto / money primitives.

**Out of scope.** Traits, bases, models, migrations, routes, any business wiring — Support layer only; do not
consume it from business code yet; no speculative domains beyond the map.

**Acceptance.**
- Every domain exists: folder + `index.php` facade + its pieces; each `†` domain has a `Driver` interface + ≥1
  driver + a manager.
- Zero business logic in any Support class; no class name is a reserved keyword.
- `composer dump-autoload` clean; every `App\Support\<Name>` facade resolves and is callable.
- **Gate green** (`composer verify` exits 0 — Larastan level 8, no suppressions, route boot OK).

---

## Requirement 2 — The traits / DNA layer (the engine)

Build the **traits layer** that turns near-empty concrete classes into a full auto-API: the **Base engine
traits** (`HasBaseXxx`) and the **DNA traits** (`HasXxx`), all composed on top of the Support DSL — never
re-implementing native work a Support domain already owns. This is the heart of the "magic": a new resource is
`migration + Model (use traits) + Repository::fields() + Service (overrides only)`, and the engine materializes
the rest from the schema + naming conventions.

**Base engine traits** — one per layer, each the shared behaviour the concrete shells inherit:
`HasBaseModel`, `HasBaseRepository`, `HasBaseService`, `HasBaseController`, `HasBaseRequest`, `HasBaseResource`.
They derive CRUD, search, stats, pagination, the uniform envelope, permission gating, and tenant scope — so a
concrete class declares only what is unique. **Nothing native lives here**: string/array/cache/db/etc. work is
delegated to `app/Support/*`.

**DNA traits** — single-responsibility model mix-ins, each a thin declaration over the engine:
- **`HasTenant`** — the fail-closed tenant global scope + `tenant_id` stamping; `withoutTenancy()` is the only
  (audited) escape hatch. This is the multi-tenant spine.
- **Relations** — schema-derived relations + deep/nested relation dispatch (auto-discovered, cached), so
  relations, eager-loads, and routes are **derived, not hand-written**; `preventLazyLoading()` as the tripwire.
- **RBAC** — roles + permissions + per-record special permissions, hand-rolled, fail-closed; **never trust
  client-supplied permissions**.
- **Engagements (design-aware)** — the one-line social traits (likes/views/comments/favorites/files/…) over a
  per-kind morph table, gated by `allow_*` permissions; declare now, wire as systems need them.

**Discipline.** DERIVE, never repeat: a shape written twice belongs in a Base trait or the Support layer.
Concrete classes stay near-empty; **all magic lives in the traits, never in a concrete class**. Build **only the
traits the v1 systems actually need** — no speculative breadth (Support was the lone foundation exception; this
layer is systems-first again). **Tour `vsample/app/Traits/*` first** for the intent of each trait, then build
ours cleaner/stronger — never copied. Exact hand-style, `declare(strict_types=1)`, zero comments.

**Acceptance.**
- `HasBaseModel/Repository/Service/Controller/Request/Resource` exist and a real resource built on them yields a
  full CRUD API with **zero per-method native code** in the concrete classes.
- `HasTenant` enforces fail-closed isolation end-to-end; cross-tenant reads/writes are impossible without the
  audited escape hatch.
- Relations, routes, and permissions are derived from the schema/conventions, not hand-listed.
- No native/infrastructure work is re-implemented in a trait that a `app/Support/*` domain already provides.
- **Gate green** (`composer verify` exits 0).
