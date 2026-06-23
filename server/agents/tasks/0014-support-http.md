# 0014 — support/http — outbound HTTP client (SSRF-guarded)

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/http/` · Facade: `App\Support\Http` (`app/Support/http/index.php`).
Depends on: **0010-support-net** (SSRF guard via `net/Ip`).

## Goal
Outbound HTTP over Laravel's `Http`/Guzzle (in lockfile). **SSRF-guard every outbound request via `App\Support\Net\Ip`**
(`arch.md` §5, `tolerance.md`) — reject private/loopback/reserved targets before connecting. Zero business logic.

## Build
- `index.php` → `namespace App\Support; class Http`.
- Pieces (`namespace App\Support\Http`): `Client` (build/send a guarded request), `Request` (method/url/body/options
  builder — distinct from `App\Support\Request`, the inbound one), `Response` (typed response reader — distinct from
  `App\Support\Response`, the envelope), `Header` (header helpers), `Status` (status predicates/classes), `Retry`
  (bounded retries with backoff — `tolerance.md` concurrency).
- Facade `Http` **shadows Illuminate `Http`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
`vsample/app/Helpers/Api.php` (outbound calls) for intent — build ours stronger, SSRF-guarded.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- SSRF guard is mandatory on the send path; bounded retries only; no silent error-swallowing.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Http` resolves and is callable; `composer lint` exits 0.
