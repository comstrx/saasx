# Theming — modes and brands

## Modes (live now)

- `light` / `dark` / `system` via next-themes (`attribute="class"`),
  already wired in the providers. The toggle is a shared component;
  every surface must be checked in both modes before it ships.

## Tokens are the only color source

- All color, radius, and spacing semantics come from the CSS variables
  in `globals.css` (`@theme` + the shadcn token set:
  `--primary`, `--muted`, `--destructive`, …).
- Components reference tokens (`bg-primary`, `text-muted-foreground`) —
  never raw palette classes for semantic roles. `bg-emerald-500` for a
  one-off status dot is acceptable; `bg-blue-600` standing in for
  "primary" is a violation.
- Changing the look of the product = editing token values in one file.
  Per-component color overrides are the smell that the token set is
  missing a semantic — add the token, not the override.

## Brand themes (storefront future)

- A brand theme is a named set of token overrides
  (`[data-theme="acme"] { --primary: …; }`) — one block per brand, no
  component changes, applied by attribute on `<html>`.
- v1 admin ships no brand themes; the rule exists so nothing is built
  in a way that blocks them. `[OPERATOR INPUT]` brand palettes arrive
  with the storefront project.

## Motion is part of the theme

Durations and easings come from `lib/motion` tokens
(`docs/guides/motion.md`) for the same reason colors come from CSS
tokens: one place to tune the feel of the whole product.
