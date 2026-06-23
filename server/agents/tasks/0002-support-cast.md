# 0002 — support/cast — mixed → typed coercion

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/cast/` · Facade: `App\Support\Cast` (`app/Support/cast/index.php`).
Depends on: none.

## Goal
Safe coercion of `mixed` into typed scalar / array / enum. The canonical example in `style.md` (`Cast::string`) is the
exact hand — mirror it. Zero business logic.

## Build
- `index.php` → `namespace App\Support; class Cast`.
- Pieces (`namespace App\Support\Cast`): `Scalar` (string/int/float/bool/nullable, blank→null per the `style.md`
  example), `Collection` (array/list normalization), `Enum` (value → backed-enum case, fail-closed to null on miss).
- `Cast::string` must match the `style.md` canonical example exactly (trim, `''|null|undefined` → null).

## Tour first (intent only — vsample.md)
`vsample/app/Helpers/Public.php` has a global `string()` coercion — intent only; rebuild as `Cast`, no globals.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Native coercion only — no validation/business rules (validation lives in `support/validate`).
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Cast` resolves and is callable; `composer lint` exits 0.
