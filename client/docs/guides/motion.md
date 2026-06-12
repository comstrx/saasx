# Motion & performance

Modern feel = native speed. The division of labor is fixed.

## Page transitions — native View Transitions

- `viewTransition: true` in `next.config.ts`; React's `<ViewTransition>`
  and `Link`'s `transitionTypes` drive route animations.
- The animations themselves are CSS (`::view-transition-*` rules in
  `globals.css`) — zero JS cost, declarative, theme-aware.
- Shared element morphs: the same `view-transition-name` on the element
  in both screens. Names are stable and derived from data ids.

## In-page motion — Motion v12 (`motion/react`)

- Scope: micro-interactions, presence (`AnimatePresence`), gestures,
  layout shifts inside a screen. Never route transitions (above).
- Tokens live in `src/lib/motion/`: durations, easings, and named
  variants. Components import variants — inline magic numbers in
  `transition={{ … }}` are forbidden.

## Performance doctrine (non-negotiable)

- Animate `transform` and `opacity` ONLY. Never `height`, `width`,
  `top`, `left`, `margin` — those trigger layout.
- `useReducedMotion` is respected in every motion component; reduced
  means instant, not slower.
- Data-dense surfaces (tables, long lists, grids): NO Motion
  components — CSS transitions only. Row-level JS animation is
  forbidden.
- Any list or table that can exceed ~100 rows is virtualized with
  TanStack Virtual before it ships. "It is fast on my data" is not an
  argument; the threshold is the row count the API can return.
- The React Compiler is on: manual `useMemo`/`useCallback`/`memo` are
  forbidden everywhere.
- Subtrees that must keep state while hidden use `<Activity>` instead
  of unmount/remount.
- `next/image` for every raster asset; explicit `width`/`height` or
  `fill` — no bare `<img>`.
