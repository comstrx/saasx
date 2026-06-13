# Architecture — The Layer Law

Where code lives and what may import what. For **how** to write *within* a
layer, follow the linked guide — this file never restates another guide's
rules.

## Mental model

**Imports point down, and a layer is defined by what it is allowed to
touch.** Each layer depends only on the layers beneath it; it never reaches
sideways to a peer, and never upward. The floor is pure logic, the roof is
pure composition, and a feature is the only place the two meet. Once you
know which layer you are in, what you may import — and what you may not —
is already decided for you.

## Two axes

**Vertical UI stack** (strict downward imports only):

    lib → hooks → components → features → app

**Cross-cutting modules** (consumed by the stack, never part of it):

    api · stores · i18n · proxy · styles

## The one inviolable rule

A module imports only from layers *below* it, plus the cross-cutting
modules. Never sideways on the same layer, never upward.

| Allowed | Forbidden |
|---|---|
| feature → components, hooks, api, stores, lib, i18n | feature → feature |
| layout → custom, ui, hooks, lib | component → feature |
| custom → ui, hooks, lib | hook → component / feature |
| hook → api, stores, lib | lib → anything under `src/` |
| app → features, components, api (prefetch only) | app → raw markup (below) |

Components are presentational: they receive data through props or a hook —
they never call `api` themselves. `lib` is the floor: pure TypeScript, zero
React, zero project concepts.

## Top-level map

| Path | Role | Owns | Never | Guide |
|---|---|---|---|---|
| `lib/std/<cat>` | floor | native-JS DSLs, domain-agnostic; born with a sibling test | React, project concepts | `stdlib.md` |
| `lib/utils` | floor | glue: `cn`, i18n direction/navigation | business logic | `style.md`, `i18n.md` |
| `lib/env` | floor | the only reader of `process.env` | being read elsewhere | — |
| `lib/log` | floor | the only place `console.*` is allowed | being bypassed | `errors.md` |
| `hooks` | L2 | reusable hooks for components/features | JSX; one-feature logic | `state.md` |
| `api` | cross | `resource("x")` DSL; the only `fetch(` | UI logic, string-typed data | `api.md` |
| `stores` | cross | zustand factories — ephemeral UI state | server state (→ TanStack) | `state.md` |
| `i18n` | cross | request config, locale resolution | — | `i18n.md` |
| `proxy.ts`, `proxy/` | cross | edge guard chain (locale, auth, redirects) | DB calls, business logic | `auth.md` |
| `styles/globals.css` | cross | Tailwind v4 entry + design tokens | a `tailwind.config.*` | `style.md` |
| `components/ui/elements` | L3a | shadcn primitives — registry-owned | hand-editing, logic, state | `style.md` |
| `components/ui/icons` | L3a | icons (manual or library) | logic | — |
| `components/custom` | L3b | shared visual composites (search, user-menu, upload…) | logic that belongs in a hook; single-feature parts | — |
| `components/layout` | L3c | fixed chrome: header, footer, sidebar, settingbar, loader, error, chaticon | business logic | — |
| `features/<name>` | L4 | ONE domain, assembled from below; exports one component | html/css/tailwind (save rare); importing another feature | `../product/tasks.md` (its block) |
| `app/[locale]` | L5 | composes features + components; may prefetch via `api` | html, `className`, tailwind, inline JS, events | `../product/tasks.md` (its block) |

Framework-free `lib/` helpers like `permissions` (the `Can` core), `motion`
(tokens), or a `log` logger are **created at their layer on first use**
(create-down) — not all are present yet, and `lib/permissions` is the first
the Auth task needs. Within the component layer the
order is `ui → custom → layout`: layout may use custom and ui; custom may
use ui; ui depends on nothing above the floor.

## Components are logic-free

Branching, derivation, and side effects belong in a hook. A component
holding business logic is a violation — extract the hook and leave the
component presentational.

## Hooks: public vs self

- `hooks/` — general, reusable across ≥1 feature *or* consumed by
  components. Small.
- `features/<x>/hooks/` — a hook specific to one feature (a *self-hook*).
- **Hard rule:** a public hook scoped to a single feature is forbidden. If
  only one feature uses it, it is a self-hook.
- **Promotion:** the moment a second feature needs a self-hook, move it up
  to `hooks/`.

## Feature anatomy

A feature is bigger than a component, smaller than a page — `table`,
`form`, `chat`, `profile`, `wallet`, `upload`, `viewer`, `scroller`.

    features/<name>/
      components/    self components (e.g. chat: side, main)
      hooks/         self hooks
      types.ts       self types
      config.ts      meta + options: allow/deny flags, defaults
      index.ts       exports the ONE component — nothing else is public

- `index.ts` exports the feature's single component only.
- That component is configurable through rich props **and** a `config`/meta
  object, both overridable at the use-site (allow X, deny Y, defaults).
- Identity-bearing features (e.g. `form`) accept `id` / `name` / `meta` so
  they resolve edit-vs-create themselves.
- A feature uses shared components/hooks/api freely and may add self-parts.
  When a self-part becomes reusable, promote it *down* to the right shared
  layer: component → `components/custom`, hook → `hooks`, util →
  `lib/std`.

## The canonical pattern — `Can`

Every feature copies the shape the permission gate already sets: a
presentational component (`components/layout/can.tsx`) + a hook
(`use-permission`, which may lean on `lib/std/*`), composed upward into a
declarative DSL — `<Can perm="…">…</Can>` and `<Cannot>`. Layers stay
clean; the public surface is a primitive. Replicate this shape for every
feature. Full rules in `auth.md`.

## Pages are sterile

`app/[locale]/**/page.tsx` assemble features + components and may prefetch
data via `api` on the server (the prefetch/dehydrate contract is in
`api.md`). They contain **zero** raw HTML, `className`, Tailwind, inline
JS, or event handlers. Markup in a page means a missing component or
feature — create it at the right layer and compose it.

## Capability missing? Create-down, then consume

Need something that doesn't exist yet? Create it at its correct layer first
(a `lib` module ships with its sibling test), then consume it from above.
Inlining lower-layer logic higher up "to save a file" is the most common
violation — and still a violation.

## Where does X live? — quick resolver

| You're writing… | It lives in |
|---|---|
| a pure data / string / date / array helper | `lib/std/<category>` |
| cross-cutting glue (cn, direction) | `lib/utils` |
| reusable stateful logic | `hooks` (general) · `features/<x>/hooks` (self) |
| a shadcn primitive | `pnpm dlx shadcn add` → `components/ui/elements` |
| a reusable visual composite | `components/custom` |
| app chrome | `components/layout` |
| a domain capability bigger than a component | `features/<x>` |
| a screen | `app/[locale]/…` (sterile composition) |
| any backend call | `api` — nowhere else |
