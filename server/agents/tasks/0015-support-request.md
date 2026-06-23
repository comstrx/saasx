# 0015 — support/request — inbound request reader

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/request/` · Facade: `App\Support\Request` (`app/Support/request/index.php`).
Depends on: 0002-support-cast, 0007-support-parse, 0008-support-security, 0010-support-net, 0011-support-context.

## Goal
Typed reading of the **inbound** request: input, headers, request fingerprint, idempotency key, locale, tenant hint.
Reads from the current request; never holds per-request state in statics (Octane-safe). Zero business logic.

## Build
- `index.php` → `namespace App\Support; class Request`.
- Pieces (`namespace App\Support\Request`): `Input` (typed input get with `App\Support\Cast`), `Header` (typed header
  get), `Fingerprint` (stable request fingerprint via `Security\Hash` — ip+agent+route), `Idempotency` (read/normalize
  the `Idempotency-Key` header + derive a scoped storage key — **header/key helper only, NOT the middleware**, which is
  a later layer), `Locale` (resolve supported locale via `Parse\Locale`), `Tenant` (extract tenant hint from
  subdomain via `Net\Domain` — parsing only, no DB lookup/scope; the tag itself is `Context`).
- Facade `Request` **shadows Illuminate `Request`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
`vsample/app/Helpers/Request.php` + `Public.php` (`locale()`, `host()`) for intent — no globals, no per-request statics.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Reader only — no tenant DB lookup, no middleware, no `Context::set` (writing the tag is middleware's job, later layer).
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Request` resolves and is callable; `composer lint` exits 0.
