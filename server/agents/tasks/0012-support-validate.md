# 0012 — support/validate — predicates + Laravel Rule objects

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/validate/` · Facade: `App\Support\Validate` (`app/Support/validate/index.php`).
Depends on: `app/Support/str/*` (built) for slug checks.

## Goal
Validation predicates + reusable Laravel `Rule` objects (e.g. `Uuid7`, `Slug`) the FormRequest layer will use later.
Support provides the rule primitives only — no FormRequests, no business rules here (out of scope).

## Build
- `index.php` → `namespace App\Support; class Validate`.
- Pieces (`namespace App\Support\Validate`): `Rule` (factory exposing reusable rule objects — `Uuid7` format predicate
  [format/version check only, independent of `database/Uuid` generation], `Slug`, etc.), `Shape` (validate an array
  against a field map), `Field` (single-value predicates: isUuid7/isSlug/isEmail/…), `Type` (type predicates), `Message`
  (resolve validation messages).

## Tour first (intent only — vsample.md)
`vsample/app/Traits/Bases/HasRequestRules.php` for the owner's rule intent — intent only, build native rule primitives here.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Rule objects implement Laravel's validation `Rule`/`ValidationRule` contract; predicates are pure. No business validation.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Validate` resolves and is callable; `composer lint` exits 0.
