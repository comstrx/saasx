# ✨ SaasX

<div align="center">
    <img height="350" src="https://github.com/user-attachments/assets/36443793-5230-4866-9f4a-f768cdabdce3" />
</div>

![CI](https://github.com/comstrx/saasx/actions/workflows/ci.yaml/badge.svg?branch=main)
![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Release](https://img.shields.io/github/v/release/comstrx/saasx?sort=semver)

`saasx` a premium **multi-tenant, multi-panel, multi-business SaaS platform** built to provision complete branded business ecosystems from one unified architecture.

- a next-generation **multi-tenant business operating platform** built to provision complete branded digital ecosystems for modern businesses.  

- **a full business operating platform** that enables companies to launch, manage, monetize, promote, support, and scale through one integrated system.

It is not a store builder.  
It is not a marketplace clone.  
It is not just a booking engine.  

It supports:

- **Products:** physical, digital
- **Services:** online, offline
- **Bookings & Listings:** tours, tickets, hotels, real estate
- **Operations:** vendors, delivery, affiliates, content, campaigns, wallets, referrals, support, AI
- global-ready businesses with native **multi-language**, **multi-currency**, and **multi-theme** support.

---

# 🧭 Vision

> Anything that can be sold, booked, delivered, and managed should run from one platform.

SaasX is built for businesses that need more than a website or a dashboard.  
It gives them a complete operating environment for:

- commerce
- service management
- bookings and listings
- operational control
- growth systems
- financial workflows
- content publishing
- branded storefronts
- scalable tenant infrastructure

---

# 🌍 What SaasX Is

SaasX gives each tenant a full branded digital environment that may include:

- **Super Panel**
- **Admin Panel**
- **Vendor Panel**
- **Delivery Panel**
- **Affiliate Panel**
- **Client Website**

Each tenant operates its own isolated business layer with its own:

- identity
- users and teams
- roles and permissions
- products and services
- vendors and affiliates
- orders and wallets
- content and communication
- policies and growth systems

This makes SaasX suitable for:

- commerce brands
- service businesses
- booking platforms
- marketplace-style operations
- reseller ecosystems
- white-label businesses
- hospitality and travel businesses
- real estate and listing platforms
- regional and global business networks

---

## Status

SaasX is currently in transition.

This repository includes the Phase 1 implementation:

- `server` — Laravel API
- `admin` — Admin dashboard
- `client` — Client-facing app

Phase 1 is the legacy/product foundation.
Phase 2 is the future Comstrx architecture.

## Current Implementation

- Laravel backend
- Next.js admin panel
- Next.js client app
- Multi-tenant SaaS foundation
- CRUD/service/repository generation
- Auth, permissions, modules, storage, cache, routing

## Future Architecture

- Rust / Actix high-performance services
- PostgreSQL / Redis
- gRPC / event-driven modules
- Infrastructure automation via infrax/gunx
- Admin generation via panelx
- Framework-level integration with rustx

---

# 🧱 Platform Structure

## 1) Super Panel

The **Super Panel** is the highest and most restricted control surface in the platform.

It is used only by core platform operators to manage the full SaasX ecosystem, including:

- tenants
- stores
- plans
- subscriptions
- feature gates
- platform-wide permissions
- governance and moderation
- ecosystem settings
- financial oversight

---

## 2) Admin Panel

The **Admin Panel** is the tenant’s main command center.

It manages the tenant environment, including:

- business and storefront settings
- content and blog management
- products and categories
- services and bookings
- tours, tickets, hotels, and real estate
- vendors, delivery users, and affiliates
- clients and internal teams
- orders and transactions
- wallets and payouts
- campaigns and coupons
- referrals and commissions
- support, tickets, and communication
- AI-assisted workflows

---

## 3) Vendor Panel

The **Vendor Panel** is the seller workspace inside a tenant.

It allows vendors to manage:

- physical and digital products
- services
- supported booking-enabled items
- inventory and offers
- orders and fulfillment status
- revenue and wallet activity
- ads and promotional visibility
- product policies and information
- support communication

---

## 4) Delivery Panel

The **Delivery Panel** provides a dedicated operational environment for fulfillment teams.

It may include:

- assigned deliveries
- pickup and drop workflows
- delivery status updates
- route and workload data
- earnings tracking
- issue reporting
- support communication
- availability management

---

## 5) Affiliate Panel

The **Affiliate Panel** is a dedicated growth environment for marketers and referral partners.

It may include:

- referral links and custom URLs
- campaign participation
- sales and conversion tracking
- coupon-linked promotion
- reward systems
- wallet and payout tracking
- analytics and reporting
- promotional materials
- support messaging

---

## 6) Client Website

The **Client Website** is the tenant’s public business experience.

It can operate as a:

- storefront
- service booking site
- travel and ticketing site
- hospitality interface
- real estate discovery site
- hybrid commerce + content platform

It supports experiences such as:

- browsing products and listings
- purchases and checkout
- service booking
- tours, tickets, and hotel reservations
- real estate exploration and inquiries
- account management
- wallet interactions
- coupons and campaigns
- affiliate-linked flows
- live chat and support
- AI-assisted discovery

---

# 🧠 Plans, Feature Gates, and Tenant Control

Every tenant subscribes to a plan.  
Each plan can define a different business surface, feature set, and permission scope.

Plans may control:

- enabled panels
- allowed product types
- vendor limits
- affiliate limits
- delivery limits
- custom domains
- quotas and storage
- booking and listing modules
- advertising capabilities
- financial features
- AI features
- blog and content modules
- advanced permission layers
- reseller / provider integrations

Tenants can also govern their own environment by enabling or restricting modules such as:

- vendor onboarding
- affiliate systems
- delivery operations
- booking flows
- supported product types
- role permissions
- user capabilities
- module visibility

This makes each tenant environment highly configurable from a business perspective.

---

# 🛍️ Business Model Support

SaasX supports multiple commercial models inside one coherent platform.

## Products
- Physical products
- Digital products

## Services
- Online services
- Offline services

## Bookings & Listings
- Tours
- Tickets
- Hotels
- Real estate

This allows one platform to support commerce, service delivery, hospitality, travel, and listing-driven businesses without flattening them into one generic product model.

---

# 🧩 Dynamic Product Intelligence

SaasX does not treat items as static records.

Each product, service, ticket, tour, hotel item, or real estate listing can carry its own business logic, including:

- custom metadata
- dynamic fields
- category-specific attributes
- policies
- warnings
- notes
- compliance instructions
- usage conditions

This means even items in the same category can behave differently based on business rules and permission scope.

These rules can be managed by:

- tenant admins
- store owners
- vendors
- authorized managers

---

# 📢 Internal Advertising and Growth Systems

SaasX is not only a transaction platform.  
It is also a growth engine.

Internal promotional systems can support:

- promoted placement
- ranking boosts
- campaign visibility
- featured exposure
- recommendation priority
- conversion-oriented visibility

This creates a built-in commercial economy where vendors can invest in visibility and sales performance inside the tenant ecosystem.

---

# 🔌 Provider / Supplier / Reseller Syncing

SaasX supports provider-aware syncing between business environments.

A tenant can connect to another tenant or provider source and import assets such as:

- products
- categories
- selected content
- supplier-linked inventory

This enables:

- ownership tracking
- supplier identity preservation
- reseller flows
- commission-aware logic
- margin-based resale
- cross-tenant catalog expansion

This makes SaasX capable of powering **business-on-top-of-business ecosystems**, not just isolated tenants.

---

# 🌐 Domain Architecture

SaasX supports both platform subdomains and tenant-owned custom domains.

## Core Domains
- `api.comstrx.com`
- `docs.comstrx.com`
- `comstrx.com`

## Tenant Subdomain Model
Examples:

- `tenant.comstrx.com`
- `tenant-admin.comstrx.com`
- `tenant-vendor.comstrx.com`
- `tenant-delivery.comstrx.com`
- `tenant-affiliate.comstrx.com`

A single tenant can therefore receive a full branded digital ecosystem with multiple operational surfaces under one identity.

---

# 💳 Financial Systems

SaasX includes a serious financial layer for modern platform operations.

It may include:

- client wallets
- vendor wallets
- affiliate balances
- delivery earnings
- pending balances
- withdrawable balances
- commission logic
- referral payouts
- campaign rewards
- reward value flows
- internal transaction tracking

This allows the platform to support real business operations, not just catalog management.

---

# 🎟️ Campaigns, Coupons, Rewards, Levels, and Referrals

SaasX includes a built-in engagement and retention engine.

Supported systems may include:

- coupons
- campaigns
- points
- levels
- referrals
- reward redemption
- role-aware eligibility
- plan-aware promotional logic
- 6-level reward system
- points accumulation
- referral links
- custom referral URLs
- reward-based coupon redemption
- campaign-linked incentives
- commission and referral logic

These systems help tenants build:

- loyalty programs
- affiliate loops
- conversion incentives
- retention systems
- structured growth mechanics

Users can:

- generate referral links
- share custom referral URLs
- earn rewards or commissions
- unlock benefits through progression

---

# 💬 Support, Communication, and AI

SaasX is built for modern interaction and operational support.

It supports:

- live chat
- ticket-based support
- complaint systems
- admin-to-client communication
- vendor-to-client communication where allowed
- AI-powered support and discovery flows

The AI layer is designed to improve:

- assistance
- product discovery
- contextual support
- guidance
- user journeys
- operational efficiency

---

# 🧬 Multi-Tenant Core

SaasX is built on a centralized multi-tenant architecture with strong business-layer isolation.

Each tenant controls its own:

- settings
- users
- roles
- products
- services
- vendors
- affiliates
- delivery users
- wallets
- orders
- campaigns
- policies
- content
- chat
- storefront identity
- permissions

This allows centralized platform control with distinct tenant-level environments.

---

# 📦 Frontend Architecture Direction

The frontend is designed with a reusable system mindset.

## Recommended Direction
- shared design system
- shared layout primitives
- reusable cards
- product-type-driven detail sections
- modular account area
- modular dashboard widgets
- role-aware rendering
- API-first integration

The frontend should avoid duplication and rely on:

- shared components
- role-aware routes
- product-type abstraction
- feature modules

Although product types differ, the platform shell remains mostly unified:

- headers
- footers
- layout systems
- account areas
- profile systems
- navigation patterns
- shared UI primitives

What changes mainly is:

- the product card
- the product detail experience
- the booking or purchase flow
- specific metadata sections

This keeps the frontend **component-driven, reusable, and scalable**, not fragmented into unrelated pages.

---

# 📈 Internal Monetization, Store Plans, and Vendor Promotion

SaasX gives every tenant more than operational control.  
It gives them the ability to build and monetize their own internal commercial ecosystem.

## Tenant-Controlled Store Subscription Plans

Each tenant can create and manage subscription plans that allow clients inside its ecosystem to subscribe and launch their own stores.

This means a tenant is not limited to operating a single store.  
It can also operate a **parent commerce layer** where other clients join under it, subscribe to plans, and receive their own managed store environments.

The tenant controls:

- store subscription plans
- pricing and billing structure
- enabled features
- store limits and quotas
- role and permission scope
- allowed business capabilities
- upgrade paths
- plan-based restrictions and access rules

This allows each tenant to build its own store network and monetize it directly from inside the platform.

## Tenant-Controlled Vendor Promotion and Advertising Plans

SaasX also allows each tenant to define its own internal marketing, promotion, and advertising plans for vendors registered inside its ecosystem.

Through the **Vendor Panel**, vendors can access a dedicated plans page where they can subscribe to visibility and sales-boosting packages created by the tenant or store owner.

These plans can provide benefits such as:

- higher product visibility
- promoted placement
- featured exposure
- stronger ranking priority
- campaign inclusion
- better discovery opportunities
- increased traffic potential
- stronger conversion opportunities

These promotion plans are fully controlled by the tenant, including:

- plan types
- pricing
- duration
- exposure level
- included benefits
- vendor eligibility rules
- upgrade tiers
- subscription limits

This turns every tenant into the operator of its own internal growth economy, where vendor visibility and promotional reach become structured, configurable, and monetizable.

## Why This Matters

A tenant can generate value on multiple layers:

- by operating its own business
- by selling subscription plans for client-owned stores
- by offering internal promotion plans for vendors
- by controlling growth, exposure, and expansion across its own ecosystem

SaasX therefore does not only enable commerce.  
It enables **layered commerce infrastructure with tenant-level monetization control**.

---

# 🚀 Why SaasX Is Different

What makes SaasX powerful is not a single feature.  
It is the combination of all of these in one platform:

- multi-tenant provisioning
- multi-panel operations
- role-generated dashboards
- physical and digital commerce
- online and offline services
- tours, tickets, hotels, and real estate
- vendor, delivery, and affiliate ecosystems
- dynamic product intelligence
- deep permissions and plan control
- internal advertising systems
- branded content and storefront experiences
- provider / reseller syncing
- internal monetization layers
- premium frontend architecture
- AI-assisted support and discovery
- global-ready scalability

Most platforms solve one layer.  
**SaasX unifies the full business stack.**

---

# 🏗️ Technical Stack

## Backend
- **Rust**
- **Actix Web**
- **SqlX**
- **PostgreSQL**
- **Redis**
- **gRPC**
- **Kafka**

## Frontend
- **Next.js**
- **Redux**
- **Radix UI**
- **shadcn/ui**

## Hosting & Delivery
- **Vercel**
- **AWS EC2 / S3**
- **Cloudflare Domains**
- **Cloudflare Workers**

---

# ⚙️ Role-Driven Panel Architecture

One of the strongest ideas in SaasX is that its dashboards are **not duplicated admin apps**.

They are generated through a **configuration-driven panel engine**.

## Core Idea

Saasx’s dashboard system is built as **one frontend project** capable of producing multiple isolated panels through a **JSON-spec-driven architecture**.

Powered by:

- **Next.js**
- **Redux**
- **Radix UI**
- **shadcn/ui**

Panels can be generated by runtime role such as:

- `ROLE=super`
- `ROLE=admin`
- `ROLE=vendor`
- `ROLE=support`
- `ROLE=delivery`
- `ROLE=affiliate`

Each panel is built according to role, not merely hidden behind conditional UI logic.

## Why This Matters

- stronger role isolation
- better security posture
- cleaner architecture
- lower duplication
- consistent design language
- easier panel expansion
- each dashboard behaves like its own operational product

This is one of Saasx’s biggest strategic advantages.

## License

See [LICENSE](./LICENSE). Commercial usage outside the license terms requires written permission.
