# 0007 — support/parse — input parsing (csv/query/scalars/locale)

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/parse/` · Facade: `App\Support\Parse` (`app/Support/parse/index.php`).
Depends on: 0002-support-cast (scalar coercion may delegate to `App\Support\Cast`).

## Goal
Parse raw input shapes into structured data: CSV rows, query-string filters, boolean/number scalars, locale codes.
Distinct from `validate` (predicates/Rules) and `cast` (single-value coercion) — this turns wire formats into data.

## Build
- `index.php` → `namespace App\Support; class Parse`.
- Pieces (`namespace App\Support\Parse`): `Csv` (string↔rows, header map), `Query` (parse filter/sort/include query
  syntax into arrays — structural, not whitelisting), `Boolean` (truthy/falsey strings → bool — **`Boolean`, never
  `Bool`**), `Number` (numeric strings → int/float), `Locale` (normalize a locale code to a supported value).

## Tour first (intent only — vsample.md)
`vsample/app/Helpers/Public.php` (`locale()`, scalar parsing) — intent only; no globals, no `request()` reach-in here.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Reserved-keyword avoidance (`Boolean`). Native parsing only — no validation/business rules.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Parse` resolves and is callable; `composer lint` exits 0.
