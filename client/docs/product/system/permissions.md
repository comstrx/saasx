# Permissions — catalog and roles

Format: `resource.action`. The strings below are the complete legal
vocabulary — a permission not listed here does not exist, and code
never invents one. Each string is defined once in the api registry
entry it protects (`docs/guides/api.md`); guards and requests share it.

## Catalog v1

| resource | view | create | update | delete | extra |
|---|---|---|---|---|---|
| products   | ✓ | ✓ | ✓ | ✓ | `products.export` |
| categories | ✓ | ✓ | ✓ | ✓ | |
| orders     | ✓ | — | ✓ | — | `orders.refund`, `orders.export` |
| customers  | ✓ | — | ✓ | — | |
| settings   | ✓ | — | ✓ | — | |
| staff      | ✓ | ✓ | ✓ | ✓ | `staff.assign-roles` |

Orders are created by customers, never by staff; customers register
themselves — hence the missing cells.

`[OPERATOR INPUT]` confirm the final catalog with the backend before
the first guarded feature ships; this table is the draft baseline.

## Roles matrix

| permission group | owner | manager | support |
|---|---|---|---|
| products.* , categories.* | ✓ | ✓ | — |
| orders.view / orders.update | ✓ | ✓ | ✓ |
| orders.refund | ✓ | ✓ | — |
| customers.view / customers.update | ✓ | ✓ | ✓ |
| settings.* , staff.* | ✓ | — | — |

Roles are a backend concept that expands into the flat permission set
at login — the frontend only ever sees and checks flat strings, never
role names. UI never branches on "is manager"; it branches on `has()`.

## Rules

- Mutating UI is always wrapped in `<Need>` with the registry entry's
  string (`docs/guides/auth.md`).
- A page whose every feature is denied renders the designed
  no-permission state, not an empty shell (`docs/guides/errors.md`).
- Guards are UX; the backend re-checks everything.
