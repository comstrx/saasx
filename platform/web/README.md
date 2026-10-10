# ✨ Web

A spec-driven Next.js + React engine for building enterprise websites, SaaS surfaces and admin panels.

## Overview

The engine separates what a surface is from how it is built. A spec declares the surface; the engine compiles it into a production Next.js application — SEO sites and non-SEO panels alike — on top of the strongest libraries in the React ecosystem for state, motion, icons and data.

The engine speaks only generic primitives:

```text
surface · resource · page · layout · table · form · action
permission · navigation · route · SEO policy · data source
theme · interaction
```

A product's nouns, branding, messages and assets live only in its specs. The engine is lint-guarded against any of them leaking in, so one engine builds any product.

```text
spec
 ↓
compiler / resolver
 ↓
runtime primitives
 ↓
Next.js + React
```

A spec says what; the engine knows how. There is always an escape hatch for bespoke UI — this is an engine, not a low-code builder.

## Layout

```text
specs/             one directory per surface: the product's declarations
everything else    the engine
```

Removing `specs/` leaves the engine, which is exactly what ships.

## Design bar

Interfaces are products, not decoration: hierarchy, composition, density, typography, spacing, surfaces, depth, motion with purpose, light and dark as separate art directions, LTR and RTL, every state from empty to error, verified by rendering — never by a screenshot of the happy path.
