# ✨ Mobile

A spec-driven React Native engine for building multi-role or role-specific enterprise mobile applications.

## Overview

One idea applied to mobile: an application is a set of specs, and the engine turns them into a production React Native app. From the same engine and the same specs it produces either one application that switches role after sign-in, or one build per role — build-time specialization, decided at release rather than in code.

The engine speaks only generic primitives:

```text
screen · flow · navigation · resource · form · action · state
permission · offline and cache policy · push · deep link
theme · motion
```

Roles, product nouns, branding and messages live only in specs. The engine is lint-guarded against any of them leaking in.

```text
spec
 ↓
compiler / resolver
 ↓
runtime primitives
 ↓
React Native
```

## Layout

```text
specs/             one directory per role or app: the product's declarations
everything else    the engine
```

Removing `specs/` leaves the engine, which is exactly what ships.

## Design bar

Native feel on both platforms, motion that explains state and continuity, every state handled — loading, empty, offline, permission denied, error, success — and every important control verified as a real interaction.
