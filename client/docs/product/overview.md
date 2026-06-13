# Overview — What SaaSX Is

## In one line

SaaSX is a multi-tenant, multi-panel **business operating platform**: from
one architecture it provisions a complete, branded digital ecosystem for
each business it hosts. It is not a store builder, a marketplace clone, or a
booking engine — it is the operating environment a whole business runs on.

## The vision

> Anything that can be sold, booked, delivered, and managed should run from
> one platform.

A tenant gets more than a website or a dashboard: commerce, service
management, bookings and listings, operational control, growth systems,
financial workflows, content, and a branded storefront — in one place.

## What a business can sell

SaaSX models real commercial variety instead of flattening everything into a
single "product":

- **Products** — physical and digital.
- **Services** — online and offline.
- **Bookings & listings** — tours, tickets, hotels, real estate.

Each item carries its own business logic — metadata, dynamic fields,
category-specific attributes, policies, warnings, and usage conditions — so
two items in the same category can behave differently. This is *dynamic
product intelligence*: items are not static records.

## One tenant, many surfaces

Each tenant is an isolated business with its own identity, users, roles,
catalog, vendors, wallets, orders, content, permissions, and storefront. Its
ecosystem can include up to six surfaces, each behaving like its own
operational product:

| Panel | Who uses it | Purpose |
|---|---|---|
| **Super** | platform operators | tenants, plans, subscriptions, feature gates, governance, financial oversight |
| **Admin** | the tenant's team | the command center: catalog, services, bookings, vendors, delivery, affiliates, orders, wallets, campaigns, support, AI |
| **Vendor** | sellers inside a tenant | their products/services, inventory, orders, revenue, promotion |
| **Delivery** | fulfillment teams | assigned deliveries, status, routes, earnings, availability |
| **Affiliate** | marketers / referral partners | links, campaigns, conversion tracking, rewards, payouts |
| **Client Website** | the public | the storefront / booking / travel / hospitality / real-estate experience: browse, buy, book, wallet, coupons, live chat, AI discovery |

Panels are **role-driven and generated from one reusable frontend system** —
not duplicated admin apps. That means stronger role isolation, one design
language, and far less duplication; the shell (headers, navigation, account
area, layout) stays unified while the product card, detail experience, and
purchase/booking flow change per business model.

## Plans & feature gates

Every tenant subscribes to a plan, and the plan defines the business
surface: which panels are enabled, which product types are allowed,
vendor/affiliate/delivery limits, custom domains, quotas, content and AI
modules, financial features. Tenants further govern their own environment by
toggling modules (vendor onboarding, affiliate systems, booking flows,
permissions…). The platform stays centrally controlled while each tenant
environment is highly configurable.

## Layered monetization

A tenant is not limited to running one store. It can operate a **parent
commerce layer**:

- sell **store-subscription plans** so clients launch their own stores under
  it,
- sell **vendor promotion / advertising plans** for visibility, ranking, and
  featured placement,
- earn across wallets, commissions, referrals, and rewards.

SaaSX is therefore layered commerce infrastructure with tenant-level
monetization control — *business on top of business*.

## The systems underneath

- **Financial** — client / vendor / affiliate / delivery wallets, pending
  vs withdrawable balances, commissions, payouts, transaction tracking.
- **Growth** — coupons, campaigns, points, a multi-level reward system,
  referral links, and level progression.
- **Support & AI** — live chat, ticketing, complaints, and AI-assisted
  support and product discovery.
- **Provider syncing** — a tenant can import catalog/inventory from another
  tenant or supplier, with ownership, commission, and resale logic.
- **Global by default** — native multi-language (with full RTL),
  multi-currency, and multi-theme.

## Where this repository sits

SaaSX is in transition across two phases:

- **Phase 1 — current foundation:** `server` (Laravel API), `admin`
  (Next.js), `client` (Next.js) — the multi-tenant foundation with auth,
  permissions, modules, storage, cache, routing, and CRUD/service/repository
  generation.
- **Phase 2 — target architecture:** Rust / Actix services, PostgreSQL +
  Redis, gRPC and event-driven modules, with infrastructure and panel
  generation tooling.

This repository is **one surface** in that picture. The conceptual *what*
lives in these `docs/product/` files; the enforceable *how* — this repo's
locked stack, the layer law, and every rule — is the constitution at
`../../AGENTS.md` and the `docs/guides/` it routes to. When the two ever
disagree, the constitution wins. The locked architectural calls themselves are
recorded with their reasoning in `docs/decisions/` — consult it before
reopening one.

## Domains

Core platform domains, per-tenant subdomains (`tenant.example.com`,
`tenant-admin.example.com`, `tenant-vendor.example.com`, …), and
tenant-owned custom domains — one tenant, one branded identity, many
surfaces.
