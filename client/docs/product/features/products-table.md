# Feature: products-table

## Purpose

Staff browse, search, and manage the product catalog from one table.

## Pages & routes

Mounted by `docs/product/pages/products.md` at `/[locale]/products`,
full-width, no props — the table owns its own URL-driven state.

## Data

- `api.products.list` — paginated per `system/backend.md`
  (`page`, `per_page=25`, `sort=-created_at`, `q`).
- Columns: image (thumb), name (localized), price (display currency per
  `system/currency.md`), stock, status (`active` | `draft` |
  `archived`), updated at (relative, localized).
- Search, page, and sort live in `searchParams` — never in a store.

## Actions

| action | entry | permission | success | failure |
|---|---|---|---|---|
| open create | route `/products/new` | `products.create` | navigates | — |
| edit | route `/products/:id` | `products.update` | navigates | — |
| archive | `api.products.update` | `products.update` | toast "Product archived" + row updates | per `docs/guides/errors.md` |
| delete | `api.products.destroy` | `products.delete` | confirm dialog → toast + row removed | per `docs/guides/errors.md` |
| export | `api.products.export` | `products.export` | file download starts | toast, retryable |

## States

- **Loading**: 10 skeleton rows matching the real column widths.
- **Empty (no products)**: illustration + "No products yet" + a create
  button that itself sits inside `<Need perm="products.create">`.
- **Empty (search miss)**: "Nothing matches your search" + clear-search
  action — distinct from the no-products state.
- **Error**: designed error state with retry (`docs/guides/errors.md`).
- **No permission** (`products.view` missing): the page-level
  no-permission state; the table never mounts.

## Components

| component | role | notable states |
|---|---|---|
| `ProductsTable` | composition root: toolbar + table + pagination | all states above |
| `ProductsToolbar` | search input (debounced via `hooks/use-debounced-value`) + export button | export disabled without permission |
| `ProductRowActions` | dropdown: edit / archive / delete | items permission-guarded individually |
| `ProductStatusBadge` | colored badge per status token | three variants, no logic |
| `ProductsEmpty` / `ProductsError` | designed states | per `docs/guides/errors.md` |

### Expanded: `ProductsTable`

The composition root and the only `"use client"` boundary of the
feature. Built on TanStack Table for columns/sorting and TanStack
Virtual for rows — virtualization is unconditional because the catalog
can exceed the ~100-row threshold (`docs/guides/motion.md`). It reads
`searchParams` for state, calls `use-products.ts` for data, and
delegates every visual state to the components above — it renders rows
or hands off; it never fetches directly, never holds row data in local
state, and never animates rows (CSS transitions only on hover/focus).

## Out of scope

Bulk import/export mapping, product variants editing, inline cell
editing, drag-to-reorder — all v2, all need their own specs.

## Open questions

- `[OPERATOR INPUT]` is archive a status change via
  `api.products.update`, or a dedicated endpoint?
- `[OPERATOR INPUT]` export format (csv/xlsx) and whether it is async
  (job + notification) or a direct download.
