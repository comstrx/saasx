# 0010 — support/net — IP / URL / domain / host / port (SSRF primitives)

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/net/` · Facade: `App\Support\Net` (`app/Support/net/index.php`).
Depends on: none. **Must precede 0014-support-http** (http SSRF-guards outbound via `net/Ip`).

## Goal
Network-address primitives. `Ip` provides the **SSRF guard** (reject private/loopback/link-local/reserved ranges).
`Domain` does tenant **subdomain resolution** parsing (`arch.md` §5). Zero business logic.

## Build
- `index.php` → `namespace App\Support; class Net`.
- Pieces (`namespace App\Support\Net`): `Ip` (validate/classify; `isPublic`/`isPrivate` — the SSRF predicate used by
  `http`), `Url` (parse/validate/normalize; scheme/host extraction), `Domain` (extract subdomain/apex from a host for
  tenant resolution — parsing only, no tenant lookup/DB), `Host` (resolve/normalize host), `Port` (validate/normalize/default).

## Tour first (intent only — vsample.md)
`vsample/app/Helpers/Public.php` (`host()`, domain handling) — intent only; no globals/`request()` here.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Parsing/classification only — no DB tenant lookup (that is business, lives above Support).
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Net` resolves and is callable; `composer lint` exits 0.
