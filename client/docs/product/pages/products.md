# Page: products

## Route

`/[locale]/products`

## Purpose

The catalog home — staff find any product and act on it within seconds.

## Access

`products.view`. Without it: the designed no-permission state
(`docs/guides/errors.md`); the sidebar link is also guard-hidden.

## Composition

1. Page header (shared): title `products.title`, primary action
   "New product" inside `<Need perm="products.create">`, navigating to
   `/products/new`.
2. `features/products-table` — no props; it owns its URL state.

Nothing else. KPIs, recent orders, and cross-domain widgets belong to
the dashboard page, not here.

## Metadata & states

- Title key: `products.title` (both locales).
- `loading.tsx`: header skeleton + the table's own skeleton rows.
- `error.tsx`: segment default per `docs/guides/errors.md`.

## Links

Arrives from: sidebar, dashboard "low stock" card. Leads to:
`/products/new`, `/products/:id`, `/categories`.
