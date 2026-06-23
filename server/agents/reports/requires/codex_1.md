# Architect report — codex_1

Completion date: 2026-06-18

## Requirements processed
- `agents/requires/0001-support-layer.md` — complete the full `app/Support/` native/infra layer as the owner-sanctioned Support-only exception to systems-first. Scope is exactly the 24-domain map from `agents/contracts/arch.md` §5; no traits, bases, models, migrations, routes, business wiring, or speculative domains.

## Task breakdown
- Existing task split accepted: `agents/tasks/0001-support-arr.md` through `agents/tasks/0024-support-verify.md`.
- The split is one independently executable task per Support domain, plus final full-layer verification. This is the smallest coherent unit because each domain is a folder with an `index.php` facade and its pieces, and each `†` adapter domain needs its driver contract plus at least one concrete driver together to stay gate-clean.
- `str/` has no build task because the requirement says it is already built and is the reference hand; `0024-support-verify.md` verifies its public surface and only allows adding a missing helper if an executed Support domain genuinely needs it.

## How and why each split works
- `0001-support-arr` builds array structure primitives first because `json` and `response` may delegate to it.
- `0002-support-cast` builds mixed-to-typed coercion early because `parse` and `request` use it.
- `0003-support-json` follows `arr` for dot path, shaping, and merge over decoded arrays.
- `0004-support-num` is independent and limited to numeric primitives, with `Money` as integer minor-units math only.
- `0005-support-date` is independent Carbon wrapping with no business calendar rules.
- `0006-support-file` is independent local path/content machinery and later supports `storage`.
- `0007-support-parse` follows `cast` and parses wire formats only, distinct from validation.
- `0008-support-security` is independent crypto wrapping only, no DIY algorithms.
- `0009-support-log` follows `security` and `arr` so redaction and context merging have existing primitives.
- `0010-support-net` precedes `http` because outbound HTTP must SSRF-guard through `Net\Ip`.
- `0011-support-context` precedes database, request, cache, lock, throttle, queue, and storage because it is the Octane-safe tenant/role tag source.
- `0012-support-validate` depends only on built `str` slug helpers and stays at predicate/rule-object level.
- `0013-support-response` follows `arr` and rebuilds the one approved API envelope from `arch.md` §7.
- `0014-support-http` follows `net` and keeps outbound client behavior SSRF-guarded.
- `0015-support-request` follows `cast`, `parse`, `security`, `net`, and `context` because it names all five for typed input, locale, fingerprint, tenant hint, and tag reading.
- `0016-support-database` follows `context` because `Rls` reads the active tenant and must use transaction-local `set_config`.
- `0017-support-cache` follows `context` for tenant-scoped keys and includes the full DSL plus `Tag`, not `Index`.
- `0018-support-lock` follows `context` for scoped lock keys and remains a Redis-backed distributed lock adapter.
- `0019-support-throttle` follows `context` for scoped limiter keys and carries no plan business rules.
- `0020-support-queue` follows `context` for tenant stamp/restore and now explicitly includes `RedisDriver` as the required concrete driver.
- `0021-support-event` follows `queue` because the default event driver is Redis/Horizon delivery, with only an Outbox scaffold and no real broker.
- `0022-support-storage` follows `context` and `file` for tenant-namespaced keys and file/path primitives.
- `0023-support-mail` is independent in Support, but now explicitly requires queued delivery only through `mailgun`/`failover`, never SMTP and never synchronous send.
- `0024-support-verify` depends on all build tasks and performs the full acceptance: all 24 facades resolve, adapter domains have driver interfaces and concrete drivers, reserved keywords are avoided, `str` remains intact, and `composer verify` exits 0.

## Kept
- Kept the 24-task structure because it covers every required Support domain exactly once and preserves the contract dependencies: `net→http`, `context→database/request/cache/lock/throttle/queue/storage`, `queue→event`, `file→storage`, `arr→json/response`, `cast→parse/request`.
- Kept individual task gates at `composer lint` and final acceptance at `composer verify`; this matches incremental executor flow while preserving the requirement's final gate.
- Kept all prior scope guards against business logic, traits/bases/models/routes, copying from `vsample`, new dependencies, formatter use, tests, reserved-keyword class names, and facade-shadow conflicts.

## Changed
- `agents/tasks/0015-support-request.md`: added missing dependencies on `0002-support-cast` and `0007-support-parse`. Reason: the task explicitly uses `App\Support\Cast` and `Parse\Locale`; omitting them made the ordering contract incomplete.
- `agents/tasks/0020-support-queue.md`: added `RedisDriver` to the build list and done criteria. Reason: `queue` is a `†` adapter domain, and every `†` domain must include a `Driver` interface plus at least one concrete driver.
- `agents/tasks/0023-support-mail.md`: changed the wording from caller-queued mail to no synchronous delivery path. Reason: the contracts say mail is always queued and sent through Mailgun HTTP API, never SMTP.

## Removed
- Nothing removed. No duplicate task, speculative domain, or out-of-scope task was found.

## Risks / unverified
- No project code was written; only architecture task/report documents changed.
- I did not run `composer lint` or `composer verify` because this was a planning pass over docs. Executors must run the per-task and final gates named in the task files.
- The final implementation still depends on executors reading `vsample` for intent before writing Support/trait files, reading config before claiming subsystem wiring, and keeping cross-domain calls pointed only at already-built dependencies.

ship it
