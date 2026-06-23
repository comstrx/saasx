# Architect report — claude_1

Completion date: 2026-06-18

## Requirement processed
- `requires/0001-support-layer.md` — build the entire `app/Support/` native/infra std-lib (the `arch.md` §5
  24-domain map) to production quality. Owner-sanctioned full-build exception to systems-first (Support only:
  zero business logic, bottom of the dependency stack, depended on by every layer above).

## Breakdown — 24 tasks (`tasks/0001..0024-support-*.md`)
One task per Support domain (the atomic, independently-buildable, gate-passing unit), plus a final acceptance
task. 23 build tasks + 1 verify. `str/` is **not** a build task — it is already built and is the reference hand;
it is verified in 0024. Each task carries: requirement trace, folder/facade/namespace, the exact §5 piece list
with one-liners, `†` Driver+concrete+manager requirement, the vsample intent source, the settled contract
surface to honour (Context §6, Response §7, cache DSL, etc.), constraints (strict_types, hand-style, zero
comments, array-return phpdoc, reserved-keyword + facade-shadow rules, zero business logic), `composer
dump-autoload`, and a concrete "done when" (facade resolves + `composer lint` exits 0).

| # | domain | notes |
|---|--------|-------|
| 0001 | arr | primitive |
| 0002 | cast | primitive; `Cast::string` = style.md canonical hand |
| 0003 | json | uses arr |
| 0004 | num | Money = integer minor-units only, never float |
| 0005 | date | wraps Carbon |
| 0006 | file | native path/content; underneath storage |
| 0007 | parse | `Boolean` not `Bool` |
| 0008 | security | crypto wrappers only (sanctioned exception) |
| 0009 | log | `Redact` mandatory |
| 0010 | net | SSRF `Ip` primitive — **before http** |
| 0011 | context | Octane-safe tag, §6 surface — **before database/request/queue/cache/storage/throttle** |
| 0012 | validate | Rule objects (Uuid7/Slug) |
| 0013 | response | rebuild to §7 envelope; reject vsample flat shape |
| 0014 | http | SSRF-guarded — **after net** |
| 0015 | request | inbound reader — after context/net/security |
| 0016 | database | UUIDv7 + transaction-local Rls (reads context) + Keyset |
| 0017 | cache † | full DSL + `Tag` (not Index) indexed invalidation, per-tenant keys |
| 0018 | lock † | distributed lock, serves idempotency |
| 0019 | throttle † | per-plan limiter mechanism |
| 0020 | queue † | `Tenant` stamps/restores tenant ctx |
| 0021 | event † | `publish(event,payload,key)`, Outbox scaffold, no broker v1 |
| 0022 | storage † | s3 everywhere, tenant-namespaced keys, signed TemporaryUrl |
| 0023 | mail | mailgun HTTP API only, never SMTP |
| 0024 | verify | full-layer acceptance: all 24 facades resolve, no reserved keywords, `composer verify` exit 0, str intact |

## How/why split this way
- **Granularity = one domain per task.** A Support domain (folder + `index.php` facade + pieces, `†` adds
  Driver+concrete+manager) is the smallest coherent unit that is independently executable and passes the gate
  on its own. Finer (per-piece) tasks would tangle index↔piece deps and over-fragment; coarser (multi-domain)
  tasks break "independently executable" and the gate-after-each-executor model. This is the smallest correct
  breakdown — no over-engineering, no scope creep.
- **Ordering is load-bearing, not cosmetic.** The gate (`composer lint`, phpstan level 8) analyses the whole
  `app/` tree after every executor, so a domain that references a not-yet-built sibling would red the gate.
  The order makes every cross-domain reference point to an already-built domain, and honours the requirement's
  explicit sequence constraints: **net→http**, **context→{database/Rls, queue/Tenant, request/Tenant,
  cache/Scope, storage keys}**, plus security→request, arr→{json,response}, cast→parse, queue→event, file→storage.
- **Settled decisions pinned into tasks** so a weaker executor needs zero questions: Context's exact §6 surface,
  Response's exact §7 five-method envelope, the cache DSL verb list + `Tag` naming, Event's `publish` signature +
  Outbox-only-scaffold, storage s3-everywhere + signed URLs, mail mailgun-only. Reserved-keyword and
  facade-shadow rules restated per affected domain.

## Kept / changed / removed
- **Kept:** nothing pre-existing under `tasks/` (it was empty) — no prior architect work to accept or reject.
  `str/` accepted as-is per the requirement (reference hand) — deliberately given no build task.
- **Changed/removed:** none. No contract violations, duplicates, mis-orderings, or scope drift found to correct.

## Scope discipline
- Tasks stay inside Support: every task explicitly bars traits/bases/models/migrations/routes/middleware and
  business wiring (the requirement's "out of scope"), and bars consuming Support from business code. The
  systems-first exception is confined to Support and stated as such in each task.

## Risks / unverified
- **No code was run or written** (architect role) — task acceptance gates (`composer lint` / `composer verify`)
  are unverified until executors run them. The gate is the real judge.
- **Intra-Support coupling is a design intent, not yet proven.** If an executor implements a domain facade that
  references a later-ordered sibling (e.g. response reaching into database/Keyset), the gate will red on that
  executor; the order is set to prevent this, but executors must keep cross-domain calls pointing backward. Flagged.
- **`config/mail.php` + `config/services.php` (mailgun) and Redis logical DBs** must be read by the executor at
  build time (task 0023/0017+ say so) — never assume wiring or print secrets.
- `composer verify` also runs `composer validate --strict` and `route:cache`; Support adds no routes/composer
  changes, so these should stay green, but they are part of the final gate and unverified here.

ship it
