# 0024 — support/verify — full-layer acceptance (no new domains)

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build) — final acceptance.
Depends on: 0001–0023 (all Support domains built).

## Goal
Cross-cutting acceptance for the whole Support layer. **No new domains, no speculative work** — verify the §5 map is
complete and gate-green end to end. `str/` is intentionally **not** a build task (already built, the reference hand);
confirm it here.

## Do
- Confirm every §5 domain folder exists with `index.php` facade + its pieces; each `†` domain
  (`cache, event, lock, queue, storage, throttle`) has a `Driver` interface + ≥1 concrete driver + a manager in `index.php`.
- Confirm `str/` is untouched: its public surface (`App\Support\Str` methods) is intact and gate-clean.
- Confirm **no class name is a reserved keyword** anywhere in `app/Support` (`Boolean`/`Casing`/`Matches`/`cache/Tag`, etc.).
- Run `composer dump-autoload`, then confirm **every `App\Support\<Name>` facade resolves and is callable**
  (24 facades: Arr, Cache, Cast, Context, Database, Date, Event, File, Http, Json, Lock, Log, Mail, Net, Num, Parse,
  Queue, Request, Response, Security, Storage, Str, Throttle, Validate).
- **Run the gate: `composer verify` must exit 0** (config:clear, composer validate --strict, phpstan level 8 no
  suppressions, route:cache + route:clear OK).

## Allowed change (only if needed)
- If a built Support domain genuinely required a missing `str/` helper, add it to `str/` mirroring its exact hand
  **without breaking the public surface** — otherwise leave `str/` untouched. No other code.

## Done when
- All 24 facades resolve; no reserved-keyword class names; `composer verify` exits 0; `str/` public surface intact.
