# 0004 — support/num — numbers & integer money math

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/num/` · Facade: `App\Support\Num` (`app/Support/num/index.php`).
Depends on: none.

## Goal
Numeric helpers. **`Money` does integer minor-units math ONLY — never floats** (`arch.md` §9, `tolerance.md` sacred).
The ledger itself is business and out of scope; `num/Money` is the primitive it will stand on.

## Build
- `index.php` → `namespace App\Support; class Num`.
- Pieces (`namespace App\Support\Num`): `Money` (integer minor-unit add/sub/mul/allocate/split, no float ever),
  `Percent` (integer-safe percentage of a minor-unit amount), `Range` (clamp/between/wrap), `Format` (human/grouped
  formatting for output only), `Random` (random int in range — distinct from `str/Random` and `security` token bytes).
- Money rounding/primitives are a sanctioned exception to "build it ourselves" — may use core/battle-tested math
  (`tools.md`); still no float representation of amounts.

## Tour first (intent only — vsample.md)
No 1:1 analog; tour `vsample/app/Helpers/*` for hand/intent, build to §5.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- No business logic (no ledger, no currency tables) — pure minor-unit arithmetic.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Num` resolves and is callable; `composer lint` exits 0.
