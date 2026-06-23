# 0005 — support/date — clock, ranges, format, parse

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/date/` · Facade: `App\Support\Date` (`app/Support/date/index.php`).
Depends on: none.

## Goal
Time helpers over Carbon: an injectable clock (testable now/today), date ranges, formatting, parsing. Zero business logic.

## Build
- `index.php` → `namespace App\Support; class Date`.
- Pieces (`namespace App\Support\Date`): `Clock` (now/today/timestamp — single source of "now", no scattered `now()`),
  `Range` (start/end/contains/iterate over a period), `Format` (to-iso/human/custom), `Parse` (string→Carbon, fail loud).
- Facade `Date` **shadows Illuminate `Date`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
No 1:1 analog; tour `vsample/app/Helpers/*` for hand/intent, build to §5.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Wrap Carbon (already in lockfile) — no new date library. No business calendar rules.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Date` resolves and is callable; `composer lint` exits 0.
