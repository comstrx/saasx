# motion — Motion & the Performance Budget

A modern feel is native speed. The division of labor is fixed, and the
performance rules are not suggestions.

## Mental model

**Animate only what the GPU moves for free, and only where it doesn't
compete with data.** Two properties are cheap (`transform`, `opacity`);
everything else triggers layout and is banned from animation. And the
denser the surface — a table, a long list — the less JS-driven motion it
may carry, down to none. Route-level motion is the platform's job (View
Transitions); in-screen motion is Motion's job; the two never overlap.

## Page transitions — native View Transitions

- `viewTransition: true` in `next.config.ts`; React's `<ViewTransition>`
  and `Link`'s `transitionTypes` drive route animation.
- The animations are CSS (`::view-transition-*` rules in `globals.css`) —
  zero JS cost, declarative, theme-aware.
- Shared-element morphs use the same `view-transition-name` on the element
  in both screens; names are stable and derived from data ids.

## In-page motion — Motion v12 (`motion/react`)

- Scope: micro-interactions, presence (`AnimatePresence`), gestures,
  layout shifts inside one screen. Never route transitions (above).
- Tokens live in `src/lib/motion`: durations, easings, named variants.
  Components import variants — inline magic numbers in `transition={{…}}`
  are forbidden.

## Performance doctrine (non-negotiable)

- Animate `transform` and `opacity` only. Never `height`, `width`, `top`,
  `left`, `margin` — those trigger layout.
- `useReducedMotion` is honored in every motion component; reduced means
  instant, not slower.
- Data-dense surfaces (tables, long lists, grids): no Motion components —
  CSS transitions only. Row-level JS animation is forbidden.
- Any list or table that can exceed ~100 rows is virtualized with TanStack
  Virtual before it ships. "It's fast on my data" is not an argument; the
  threshold is the row count the API can return.
- Subtrees that must keep state while hidden use `<Activity>` — never
  unmount/remount to hide.
- `next/image` for every raster asset, with explicit `width`/`height` or
  `fill`; a bare `<img>` is forbidden.
- Memoization is the compiler's job — `useMemo`/`useCallback`/`memo` are
  forbidden everywhere (see `style.md`).

## You are doing it wrong if…

- You animated `height`, `width`, `top`, `left`, or `margin` → animate
  `transform`/`opacity`, or change layout without animating it.
- A table row or long-list item carries a Motion component → CSS
  transitions only on dense surfaces.
- A list the API can grow past ~100 rows isn't virtualized → wrap it in
  TanStack Virtual.
- You drove a route transition with Motion → that's View Transitions.
- A `transition={{ duration: 0.25 }}` magic number sits inline → import a
  variant from `lib/motion`.
- You hid a stateful subtree by unmounting it → use `<Activity>`.
- A raster image is a bare `<img>` → `next/image` with dimensions.

## Boundaries with neighbors

- The no-manual-memo rule and class style → `style.md`.
- A virtualized table as a shipped capability → its block in
  `../product/tasks.md`.
