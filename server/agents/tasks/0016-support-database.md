# 0016 — support/database — UUIDv7, transactions, RLS, query primitives

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/database/` · Facade: `App\Support\Database` (`app/Support/database/index.php`).
Depends on: **0011-support-context** (`Rls` reads the tenant from `Context`).

## Goal
DB primitives the data layer will stand on: UUIDv7 generation, transaction helper, RLS config, query/schema/column
introspection, sorting, keyset pagination. **Primitives only** — `BelongsToTenant` scope and models are later layers.

## Build
- `index.php` → `namespace App\Support; class Database`.
- Pieces (`namespace App\Support\Database`): `Uuid` (generate/validate UUIDv7 strings — ids are `string`, never `int`),
  `Transaction` (run/retry within a transaction, deadlock-bounded retry), `Rls` (apply transaction-local
  `set_config('app.tenant_id', ?, true)` from `Context::tenantId()` — **transaction-local, never session `SET`**;
  `arch.md` §9/§10), `Query` (safe parameterized fragments/bindings), `Schema` (table/column existence introspection),
  `Column` (column meta/type), `Sort` (whitelist-checked order-by primitive), `Keyset` (keyset/seek pagination cursor
  encode/decode — **keyset, not offset**; `tolerance.md`).
- Facade `Database` does **not** shadow an Illuminate facade by that name — still keep the no-double-alias discipline for `DB`.

## Tour first (intent only — vsample.md)
`vsample/app/Traits/Model/HasMultiTenancy.php` for tenancy/RLS intent — intent only; ours is transaction-local RLS + UUIDv7.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Parameterize everything; no string-built SQL with untrusted input. No business logic, no model coupling.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Database` resolves and is callable; `composer lint` exits 0.
