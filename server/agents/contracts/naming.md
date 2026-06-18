# contracts/naming.md — Naming (LAW)

> Names are **clear, concise nouns** — never verbose, self-describing file names. The owner's `vsample`
> naming is a good guide to intent (`Category`, `WalletService`, `HasRelations`); read it. A reader should
> grasp a file's role from a short name, not a sentence. Re-read every turn.

## Classes & files

- **PSR-4 (`App\ → app/`)**: file name = class name, one class per file (`CategoryService.php` →
  `class CategoryService`).
- **Layer suffixes:** `XxxService`, `XxxRepository`, `XxxController`, `XxxRequest`, `XxxResource`.
  Models are the bare noun (`Product`, `Order`, `Wallet`).
- **Base shells:** `BaseRepository`, `BaseService`, `BaseRequest`, `BaseResource`, `BaseCommand`; the base
  controller is `Controller` (Laravel convention). Each only `use`s its engine trait.
- **Engine traits:** `HasBaseXxx` (`HasBaseModel`, `HasBaseRepository`, `HasBaseService`,
  `HasBaseController`, `HasBaseRequest`, `HasBaseResource`, `HasBaseCommand`) in `app/Traits/Bases/`.
- **DNA traits:** `HasXxx` (`HasRoles`, `HasPermissions`, `HasFiles`, `HasSearch`, `HasCache`,
  `HasRelations`, `HasState`, `HasTenant`, …) in `app/Traits/Dna/`. Names illustrative — add what a system
  needs in this style; do not invent a parallel convention.

## The `index.php` folder convention (Support & Traits)

- First level under `app/Support/` and `app/Traits/` is **folders only**, never loose files.
- Each feature folder's **`index.php` is the public facade**: `support/str/index.php` →
  `namespace App\Support; class Str` → called as `App\Support\Str::x()`.
- Internal pieces are PascalCase sibling files: `support/str/Casing.php` →
  `namespace App\Support\Str; class Casing`.
- These load via **classmap** (not PSR-4) with clean class names. **Run `composer dump-autoload` after
  adding a new support/trait file** (classmap is static). See `tools.md`.

## Reserved-keyword avoidance (mandatory)

No class name may be a reserved keyword. Use: **`Boolean`** (not `Bool`), **`Casing`** (not `Case`),
**`Matches`** (not `Match`), **`cache/Tag`** (not `Index`, which collides with `index.php`). Apply the
same care to any new piece.

## Facade shadowing

Support facades intentionally shadow Illuminate equivalents: `Str`, `Arr`, `Cache`, `Date`, `Log`, `Mail`,
`Queue`, `Storage`, `Http`, `Request`, `Response`, `Context`. **Never alias-import both Illuminate's and
ours in the same file** — pick one, fully-qualify the other if truly needed.

## Routes & resources

- Resource route segment = **plural snake_case** of the resource (`products`, `commission_rules`),
  following global REST naming conventions — clear and predictable.
- Route names mirror the segment (`products.index`, `products.show`).
- Panel prefix + name per file: `/v1/<panel>/…`, names `<panel>.<resource>.<action>`.
- **Spelling is `affiliate`** everywhere (route prefix, role, permissions) — never "affiliator".
- Reusable shared route blocks get a clear name of your choosing (the owner does not mandate one) — the
  intent is a block you invoke across resources/panels that share an action set (`arch.md` §8). Do not
  resurrect names from `vsample` (e.g. `cycle`, `helpers`) as a contract — they were just examples.

## Permissions

- Pattern: `<verb>_<resource>` — `view_products`, `add_products`, `edit_products`, `delete_products`,
  plus cross-cutting ones like `allow_statistics`, `allow_downloads`, `view_permissions`,
  `edit_permissions`. Role-scoped permission rows like `*_affiliate` keep the `affiliate` spelling.
- Permissions are **derived from the resource name** by the engine where possible (`design.md` §2), not
  hand-maintained per endpoint.

## Database

- Tables: plural snake_case (`order_items`, `commission_rules`). Pivots: alphabetical singular pair
  (`product_tag`) unless a domain name is clearer.
- Columns: snake_case. Foreign keys `<singular>_id` (`vendor_id`, `wallet_id`). **`tenant_id`** on every
  tenant-owned table.
- Composite uniques `unique(tenant_id, …)`; hot indexes lead with `tenant_id` (`arch.md` §9).

## General

- Methods/properties: clear verbs/nouns, no Hungarian, no redundant prefixes. Booleans read as predicates
  (`isBlank`, `hasColumn`, `active`).
- Do not encode the whole purpose into a name; let the short name + its layer/folder carry the meaning.
</content>
