# 0001 — support/arr — array std-lib

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/arr/` · Facade: `App\Support\Arr` (`app/Support/arr/index.php`).
Depends on: none.

## Goal
Native array power: dot access, shaping, filtering, mapping, grouping, sorting, tree building. Zero business logic.

## Build
- `index.php` → `namespace App\Support; class Arr` — public facade delegating to pieces.
- Pieces (`namespace App\Support\Arr`): `Dot` (get/set/has/forget by dot-path), `Shape` (only/except/pluck/wrap),
  `Filter` (where/whereNotNull/first/reject), `Map` (map/mapWithKeys/flatMap), `Group` (groupBy/keyBy/partition),
  `Sort` (sort/sortBy/sortKeys), `Tree` (nest/flatten parent_id-style structures — structural only, no domain meaning).
- Facade `Arr` **shadows Illuminate `Arr`** — never alias-import both in one file; fully-qualify if truly needed.

## Tour first (intent only — vsample.md)
No 1:1 vsample helper; tour `vsample/app/Helpers/*` for the owner's hand/intent, then build to the §5 map, stronger.

## Constraints
- `declare(strict_types=1)` every file; exact hand-style (mirror `app/Support/str/*`); zero comments.
- Array returns carry a shape phpdoc (`/** @return array<...> */` / `list<...>`). No reserved-keyword class names.
- Native infra only, no business logic. Build only these pieces — no speculative breadth.
- `composer dump-autoload` after adding files (classmap is static).

## Done when
- `App\Support\Arr` resolves and is callable; pieces resolve; `composer lint` exits 0 (phpstan level 8, no suppressions).
