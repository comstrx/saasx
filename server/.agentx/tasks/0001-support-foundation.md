# 0001 — Audit the 18 built Support domains to the production bar

- Requirement: `0002-support-foundation.md` (clears `0001-compliance-floor.md` items applicable to a pure native/infra library).
- Deliverable type: lib
- Order: none (foundation; the 18 domains already exist and the gate is green today).

## Responsibility
Verify every already-built Support domain meets the production invariants of the std-lib contract and fix only real violations — no rewrite of green code.

## Path
The 18 domains that already have files (audit in place, smallest-diff fixes only):
`app/Support/{arr,cache,cast,context,database,date,file,http,json,log,net,num,parse,request,response,security,str,validate}/**`
(The 6 empty domains `event, lock, mail, queue, storage, throttle` are built by tasks 0002–0005; they are out of scope here.)

## Public interface
No new surface. Each domain keeps its existing `App\Support\<Name>` facade (`index.php`) and PascalCase pieces. `str/` is the reference hand — its public surface and hand-style MUST NOT change (hardening of edge cases/types only). Confirm each facade resolves: `Arr, Cache, Cast, Context, Database, Date, File, Http, Json, Log, Net, Num, Parse, Request, Response, Security, Str, Validate`.

## Invariants
- Zero business logic in any Support class — native/infra power only.
- No class name is a reserved keyword (`Boolean` not `Bool`, `Casing` not `Case`, `Matches` not `Match`, `cache/Tag` not `Index`).
- `declare(strict_types=1)` at the top of every file; full param/return types; array returns carry a shape tag; zero prose comments.
- Facade-shadowing rule: a file never alias-imports both Illuminate's and our `Str/Arr/Cache/Date/Log/Mail/Queue/Storage/Http/Request/Response/Context`.
- `num/Money` does integer minor-unit math only — no float arithmetic on money anywhere.
- `log/Redact` strips secrets; nothing in `log/*` can emit a raw secret/token/credential.
- `security/*` wraps core/`Illuminate` crypto — no hand-rolled cipher/hash primitive.
- `http` routes every outbound call through `Client::guard()` (SSRF: scheme allow-list + `Net\Ip::isPublic` on resolved IPs) — verified present; confirm no bypass path.
- `database/Rls::apply` is transaction-local (`set_config(..., true)`) and reads `Context::tenantId()` — verified present; confirm no session-level `SET`.
- `context` holds per-request tag in Laravel `Context` only (no static/singleton per-request state); it is the single source of truth read by `database/Rls`.

## Acceptance criteria
- `composer dump-autoload` clean; a one-shot resolve check loads every `App\Support\<Name>` facade with no error.
- A grep audit shows: no float on a `Money` path; no `@phpstan-ignore`/baseline/`SET app.tenant_id`; no reserved-keyword class names; `declare(strict_types=1)` in all 18 domains' files.
- `composer verify` exits 0 (Larastan level 8, no suppressions, route boot OK).
- Any change made cites the exact invariant it fixed; green files are left untouched.

## Deliverable type
lib

## Order
none — runs first; tasks 0002–0005 and 0006+ depend on the built domains this confirms green.
