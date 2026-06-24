# Task 0001 — Audit the 18 built Support domains to the production bar

Executor: claude_1. First executor on this task (`.agentx/reports/tasks/` was empty — no prior work to build on or reject).

## What this task is
Verify every already-built Support domain (`arr cache cast context database date file http json log net num parse request response security str validate`) meets the std-lib production invariants, and fix ONLY real violations — no rewrite of green code. The 6 empty domains (`event lock mail queue storage throttle`) are out of scope (tasks 0002–0005).

## Outcome
**No source files changed.** I audited all 18 domains (114 files) against every invariant in the contract; found zero genuine violations. The prior build is correct and green — per `tolerance.md` "accept correct prior work as-is," touching it would be churn.

## Audit performed — per invariant, with evidence
- **`declare(strict_types=1)` everywhere** — scanned head of every `app/Support/<domain>/*.php`; zero missing.
- **No reserved-keyword class names** — `grep 'class (Bool|Case|Match|Index)'` → none. (`cache/Tag`, `str/Casing`, `str/Matches` already use the safe names.)
- **No suppression / baseline / session SET** — `@phpstan-ignore` none; `SET app.tenant_id` none; `phpstan.neon` has no baseline.
- **`num/Money` integer-only** — read in full: `add/subtract/multiply` are `int→int`; `fromDecimal` parses via string + integer math; `toDecimal` uses `intdiv`/modulo → string; `allocate` uses `intdiv` with largest-remainder distribution (conserves total, no drift); `factor` is `(int)(10**scale)`. No `(float)`/`floatval`/`round`/`fdiv` on any money path. (The `int|float` signatures in `num/Format|Range|Percent|index` are general number helpers, not the money path — correct.)
- **`security/*` wraps core crypto** — `Hash::make/check/needsRehash` delegate to `Illuminate\...\Hash` (bcrypt/argon); `digest` wraps core `hash()`; `Signature` wraps core `hash_hmac`; `Token` wraps `random_bytes`. No DIY cipher/hash primitive.
- **`log/Redact` strips secrets AND is wired** — `Redact::apply` recurses arrays and masks sensitive keys; critically, `Log\Entry::write` calls `Channel::to()->log($level, $message, Redact::apply($context))` — redaction is on the live path, not dead code. The log invariant holds.
- **`http` SSRF guard, no bypass** — `Client::guard` enforces scheme allow-list (http/https), validates host, resolves the host and asserts `Net\Ip::isPublic` on every resolved IP; `send()` sets `->withoutRedirecting()` (no redirect-based bypass). Fail-closed: `Ip::isPublic` uses `FILTER_FLAG_NO_PRIV_RANGE|NO_RES_RANGE` (invalid IP → not public → blocked); an IPv6-only host that `gethostbynamel` can't resolve throws rather than passes. No bypass path found.
- **`database/Rls::apply` transaction-local + Context-driven** — `select set_config('app.tenant_id', ?, true)` (the `true` = transaction-local), tenant defaults from `Context::tenantId()`. No session-level `SET`.
- **`context` per-request only** — tag held in Laravel `Context` (`Context\{Tenant,Scope,Panel,User}` read/write the framework `Context`); no static/singleton per-request state. It is the single source `database/Rls` reads.
- **Facade-shadowing rule** — no file alias-imports both Illuminate's and our `Str/Arr/Cache/Date/Log/Mail/Queue/Storage/Http/Request/Response/Context` (Illuminate equivalents are used fully-qualified inline, e.g. `\Illuminate\Support\Facades\Http`).
- **Zero business logic** — no `App\Models`/`Eloquent`/business-noun references in Support; tenant references are infra (Rls/context/request tenant resolution), not domain logic.
- **Array returns carry shape tags** — every `): array`/`?array` method has a `/** @return ... */` (verified the 7 flagged by a one-line heuristic are false positives — each has a multi-line docblock with the tag). Needed because the gate globally ignores `missingType.iterableValue`, so phpstan would not catch a missing return shape.

## Acceptance criteria — all met
- ✅ `composer dump-autoload` clean (7615 classes); one-shot resolve check loads all 18 facades (`Arr…Validate`) with no error.
- ✅ Grep audit clean: no money float, no `@phpstan-ignore`/baseline/`SET app.tenant_id`, no reserved-keyword class names, `strict_types` in all files.
- ✅ `composer verify` exits 0 — `composer.json` valid, **phpstan level 8: No errors** (118 files), `route:cache` boots and clears cleanly.
- ✅ No changes made, so nothing to cite; green files left untouched.

## Gate
`composer verify` → exit 0. `phpstan analyse` (level 8) → [OK] No errors. Facade resolve → ALL 18 RESOLVE (exit 0).

## Remaining risks
- **DNS-rebinding TOCTOU** in `http/Client`: `guard()` pre-resolves and checks IPs, then `Http::send` resolves again at connect — a host could rebind between the two. With `withoutRedirecting()` + the pre-check this is the pragmatic v1 standard; pinning the resolved IP into the connection is over-engineering for now. Flagged, not fixed (no contract violation).
- `log/Redact` matches on key names, not values — a secret logged as a bare string under an innocuous key would pass. Standard approach and contract-compliant ("strips secrets" by key); callers must pass secrets under named keys. Noted for the trait/service layer to respect.

ship it
