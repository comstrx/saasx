# Overview — what we are building

## The product

A simple ecommerce platform. A store sells physical products; customers
browse, order, and pay; staff manage the catalog and fulfill orders.
This repository is the **admin panel** — the staff-facing console. The
same foundation (layers, std lib, guides) will later power the
customer-facing **storefront** as a separate app.

## Who uses it (personas)

- **Owner** — full control: catalog, orders, customers, settings, staff
  and their permissions.
- **Manager** — runs daily operations: products, categories, orders.
  No access to settings or staff management.
- **Support** — read-mostly: views orders and customers, updates order
  status. Cannot touch the catalog.

Roles and the exact permission matrix live in
`system/permissions.md` — never assume an ability not listed there.

## Scope v1 (the admin)

Dashboard (KPIs) · Products · Categories · Orders · Customers ·
Settings (store profile, staff, roles). Each page has a spec in
`pages/`; each capability has a spec in `features/`. Anything not
specced is out of scope until a spec exists.

## High-level architecture

```
┌──────────────────────────┐        ┌─────────────────────────┐
│  Next.js admin (this)    │  REST  │  Rust API  :8080        │
│  Better Auth (identity)  │ ─────► │  business logic, data   │
│  Postgres (auth tables)  │  JWT   │  Postgres · Redis       │
└──────────────────────────┘        └─────────────────────────┘
```

- Identity lives in the admin (Better Auth, Postgres, httpOnly
  cookies). The Rust API verifies the JWT on every request and is
  zero-trust — it re-checks permissions regardless of what the UI hid.
- All business data (products, orders, …) lives behind the Rust API.
  The admin holds no business data of its own.
- The API contract — response shapes, pagination, rate limits, error
  codes — is `system/backend.md`. The frontend's reaction to that
  contract is `docs/guides/api.md` and `errors.md`.

## System-wide requirements

The store is international from day one:

- **Multi-language** with full RTL — `system/languages.md`
- **Multi-currency** display — `system/currency.md`
- **Theming** (light/dark now, brands later) — `system/theming.md`

These three touch every feature; their specs are read before building
anything user-visible.

## How this documentation grows

`features/_template.md` and `pages/_template.md` are the only way new
specs are born. A feature is built only after its spec exists and its
open questions are answered by the operator.
