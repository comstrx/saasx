# 0003 — Visual identity

> One file per session (see `README.md`). Immutable — supersede, never edit.

- **Session:** Hello World redesign + visual identity
- **Date:** 2026-06-13

---

### 1. Visual identity = gold primary + gold-coordinated dark theme, token-driven

- **Date:** 2026-06-13
- **Decision:** The storefront's locked visual identity is a **gold primary on a
  warm-neutral foundation**, both themes first-class. Gold (`--primary` /
  `--gold` + `--gold-soft`) is used as **accent, primary CTA, highlight, focus
  ring, and emphasis — never a flood fill**, always in a contrast-safe pairing
  (gold fill + dark text, or soft-gold tint + dark-gold text; body/heading text
  stay `foreground`). The dark theme is a **deep warm neutral** (not pure black)
  designed so gold reads warm and premium. Everything is **tokens in
  `src/styles/globals.css`** (gold palette, warm-neutral scale,
  elevation/shadow/radius scale, `bg-surface` sheen, ambient `bg-glow`), light +
  dark. Recorded in `../product/client.md` ("Visual identity").
- **Why:** A premium, cohesive identity that meets `client.md`'s flagship design
  bar and gives every future surface one visual language. Gold is contrast-hard,
  so the rules (restraint + safe pairings + a visible focus ring) are part of the
  decision.

### 2. Hello World surface redesigned as the design-bar showcase

- **Date:** 2026-06-13
- **Decision:** `src/components/custom/hello.tsx` is now an elevated hero (warm
  card with border + layered `shadow-xl` + `bg-surface` sheen + ambient
  `bg-glow`), a gold-tinted eyebrow badge, a confident `text-7xl` greeting, a
  tagline, and a polished `locale-switcher.tsx` (gold active pill, spring
  hover/press, gold focus ring, correct RTL for `ar`). Entrance is a staggered
  fade-rise via Motion variants in `src/lib/motion` (`transform`/`opacity` only,
  `useReducedMotion` honored). The page stays sterile.
- **Why:** This single surface is the living showcase of the `client.md` bar and
  the gold identity, and the reference implementation for both.
