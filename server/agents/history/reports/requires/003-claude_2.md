# Architect report — claude_2

Completion date: 2026-06-18

## Requirement processed
- `requires/0001-support-layer.md` — build the entire `app/Support/` native/infra std-lib (the `arch.md` §5
  24-domain map) to production quality. Owner-sanctioned full-build exception to systems-first (Support only:
  zero business logic, bottom of the dependency stack). It is the **only** file in `requires/`.

## Verdict
Accepted the existing 24-task split (`tasks/0001..0024-support-*.md`) **as-is**. Two prior architects
(claude_1, codex_1) converged on it; I re-audited every task line-by-line against the contracts and ground
truth and found **no** missing/duplicate task, wrong ordering, contract violation, logic error, or scope
drift. Per discipline (accept correct prior work, change only for a concrete reason) I changed nothing.

## Ground truth verified (not assumed)
- `composer.json` scripts: `lint` = `phpstan analyse --memory-limit=1G` (the per-task gate); `verify` =
  `config:clear` + `composer validate --strict` + `lint` + `route:cache` + `route:clear` (the final gate in
  0024). Both exist — executors are handed real commands.
- `app/Support/` currently holds only `str/` (Casing, Clean, Inflect, Matches, Random, Slug, Template,
  index — all 7 §5 pieces). Confirms the other 23 domains are to be built; `str` correctly has no build task.
- Classmap autoloads `app/Support` + `app/Traits` → `composer dump-autoload` after each file is mandatory
  (every task says so).

## Breakdown audit (why this split is correct)
- **Granularity = one §5 domain per task** (folder + `index.php` facade + pieces; `†` adds Driver+concrete+
  manager). Smallest unit that is independently executable and gate-passes alone. Finer (per-piece) tangles
  index↔piece deps; coarser (multi-domain) breaks gate-after-each-executor. 23 build + 1 verify = 24.
- **Coverage exact:** every §5 domain covered once; none missing, duplicated, or speculative. Piece lists
  match the §5 map character-for-character (spot-checked cache/database/storage/event/queue/context/response).
- **Ordering is load-bearing.** The gate is phpstan over the whole `app/` tree after every executor, so any
  forward reference (domain N → domain >N) would red the gate. All deps point backward:
  `net(10)→http(14)`; `context(11)→database(16)/request(15)/cache(17)/lock(18)/throttle(19)/queue(20)/storage(22)`;
  `arr(1)→json(3)/response(13)`; `cast(2)→parse(7)/request(15)`; `queue(20)→event(21)`; `file(6)→storage(22)`;
  `security(8)→log(9)/request(15)`; `str→validate(12)`. Honours the requirement's explicit
  net→http and context→{database/Rls, queue/Tenant} constraints.
- **Settled surfaces pinned** so a weaker executor needs zero questions: Context §6 (tenantId/role/panel/
  isSuper/userId/set/forget), Response §7 (success/message/fail/error/noContent), cache DSL verb list +
  `Tag`-not-`Index`, Event `publish(string $event, array $payload, ?string $key): void` + Outbox-scaffold-only,
  storage s3-everywhere + signed `TemporaryUrl` + tenant-namespaced keys + private-default, mail mailgun-only/
  always-queued/never-SMTP, num/Money integer-minor-units-only, security crypto-wrappers-only, log/Redact.
- **Namespace-collision callouts present and correct:** `Http\Request` vs `Request`, `Http\Response` vs
  `Response`, `Log\Context` vs `Context`, `Num\Random` vs `Str\Random` vs `Security\Token`, `Cache\Scope` vs
  `Context\Scope`. Reserved-keyword rules (`Boolean`/`Casing`/`Matches`/`cache/Tag`) and facade-shadow rule
  restated per affected domain.
- **Scope discipline:** every task bars traits/bases/models/migrations/routes/middleware/business wiring and
  bars consuming Support from business code; the systems-first exception is confined to Support and stated.

## Kept / changed / removed
- **Kept:** all 24 tasks verbatim. codex_1's three prior corrections are already baked in (0015 cast+parse
  deps, 0020 `RedisDriver` for the `†` queue adapter, 0023 no-synchronous-send wording) — re-verified correct.
  `str/` accepted as-is (reference hand), no build task, verified in 0024.
- **Changed / removed:** none. No concrete reason to touch any task.

## Naming-trace note (flagged, not changed)
Tasks are named `NNNN-support-<domain>.md` (not literally `NNNN-support-layer.md`). This is the
convention-consistent reading of "each task traces to its requirement": the shared `support-` token + an
explicit `Requirement: requires/0001-support-layer.md` trace line in every task body. Renaming now would be
cosmetic churn that breaks existing executor references — not warranted.

## Risks / unverified
- **No code written or run** (architect role). Per-task `composer lint` and final `composer verify` are
  unverified until executors run them — the gate is the real judge.
- **Cross-domain calls must keep pointing backward.** If an executor makes a domain facade reach into a
  later-ordered sibling (e.g. response→database/Keyset), the gate reds on that executor. The order prevents
  it; executors must hold the line.
- **Config reads at build time:** 0023 (mailgun via `config/mail.php`+`config/services.php`), 0017/0018/0019/
  0020 (Redis logical DBs via `.env`) — read before claiming wiring, never print secret values.
- `composer verify` also runs `composer validate --strict` + `route:cache`; Support adds no routes/composer
  changes, so these should stay green, but they are part of the final gate and unverified here.

ship it
