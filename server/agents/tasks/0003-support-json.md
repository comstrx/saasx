# 0003 — support/json — JSON encode/decode/shape

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/json/` · Facade: `App\Support\Json` (`app/Support/json/index.php`).
Depends on: 0001-support-arr (Path/Shape/Merge may delegate to `App\Support\Arr`).

## Goal
Safe JSON: encode/decode that fails loud (never silent), dot-path read into decoded data, shape extraction, deep merge.

## Build
- `index.php` → `namespace App\Support; class Json`.
- Pieces (`namespace App\Support\Json`): `Encode` (throw-on-error encode, flags), `Decode` (assoc decode, throw on
  invalid — no silent `null`), `Path` (dot read over decoded array), `Shape` (only/except over decoded), `Merge` (deep merge).
- No silent error-swallowing (`tolerance.md`): invalid JSON surfaces, never hidden.

## Tour first (intent only — vsample.md)
No 1:1 analog; tour `vsample/app/Helpers/*` for hand/intent, build to §5.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Native only; reuse `App\Support\Arr` for path/shape rather than re-implementing.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Json` resolves and is callable; `composer lint` exits 0.
