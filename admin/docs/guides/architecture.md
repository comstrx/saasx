# Architecture — placement, layers, flow

## Placement decision tree (every new file answers this first)

```
new code →
├─ registry primitive?                    → src/components/ui/      (shadcn CLI only)
├─ belongs to exactly ONE domain?         → src/features/<domain>/
├─ reusable UI, zero domain knowledge?    → src/components/shared/
├─ reusable hook (React/browser, no domain) → src/hooks/
├─ pure logic / parsing / IO wrapper?     → src/lib/<module>/
├─ endpoint metadata or transport?        → src/api/
├─ global ephemeral UI state?             → src/stores/
├─ request gate (redirect/rewrite)?       → src/proxy/
├─ global or theme CSS?                   → src/styles/             (entry: globals.css)
└─ route, layout, metadata?               → src/app/                (composition only)
```

If a file does not fit exactly one branch, the design is wrong — split
it until each piece fits one branch.

- Framework plumbing at vendor-default paths (`src/proxy.ts`,
  `src/i18n/request.ts`) are the only files allowed outside the tree;
  introducing a new one requires a flagged deviation. Next metadata
  image routes (`icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`)
  are plumbing too: they live in `src/app/` by Next convention and are
  the only files allowed raw inline-styled JSX (ImageResponse cannot
  read CSS variables).
- Global and theme CSS lives in `src/styles/` (entry:
  `src/styles/globals.css`). New stylesheet files are born with their
  first real consumer, never speculatively; `components/ui/**` styling
  stays registry-owned.
- Project-made icon components, when they exist, live in
  `src/components/shared/icons/` — never inside `components/ui`
  (registry territory). Icon routes (the favicon family) are `app/`
  plumbing per the bullet above.

## Import direction (one-way; a violation is a bug, not a style issue)

```
app      → features, shared, hooks, stores, lib, api, ui
features → shared, hooks, stores, lib, api, ui     (NEVER another feature)
shared   → ui, hooks, lib
hooks    → lib, api
stores   → lib
api      → lib
lib      → lib only
ui       → lib/utils only                          (registry-owned)
```

Need something from a sibling feature? Promote it down (shared / hooks /
lib) or compose both features in `app/`. Never import across.

## Feature anatomy (flat inside the domain dir)

```
src/features/users/
├── users-table.tsx       components: PascalCase exports, kebab-case files
├── user-form.tsx
├── use-users.ts          hooks wrapping TanStack Query over src/api entries
└── types.ts              feature-local types only (optional)
```

Endpoints and permission strings for the feature live in
`src/api/<resource>.ts` — features consume the registry and never define
transport (see api.md).

## Dependency flow for every feature (maintainability law)

A feature is an assembly: `lib` (logic) → `hooks` (reactivity) →
`shared`/`ui` (presentation) → `feature` (composition) → `page`
(placement). If the capability you need is missing at a lower layer,
CREATE it there first — lib modules are born with a sibling `.test.ts` —
then consume it. Re-implementing or inlining lower-layer logic inside a
feature is a violation.

## Pages doctrine

- A page = imports + `metadata` + composition of features with props.
- No raw lowercase HTML elements and no `className` anywhere under
  `src/app/**`, except `<html>`/`<body>` in the root layout. If a page
  needs glue UI, reach for a shared component; placing a shared
  component directly in a page is allowed only when a feature would be
  overkill — and must be flagged in the report.
- Server Components by default; `"use client"` only at interactive
  leaves, never on a page or layout wholesale.
- URL is state: filters, pagination, tabs, and search live in
  `searchParams` — not in stores.
- Loading and error UI per segment (`loading.tsx`, `error.tsx`) compose
  shared components like any page (see errors.md).

## Promotion doctrine

The first and second use of a helper may live inside its feature. A
third consumer anywhere triggers promotion to `lib/` or `hooks/` — in
its own commit, before the feature work that needed it.

## Rendering modes (one base, three products)

`lib/` is isomorphic by default: no `window`, no `node:*`. Server-only
modules begin with `import "server-only"` (`fs`, `path`). Browser-only
logic lives in `hooks/`. Features never assume a rendering mode — pages
decide whether a surface is static, dynamic, or client-driven.
