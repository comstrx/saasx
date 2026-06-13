# Client — The Storefront Surface

## What this is

This repository is the **Client Website** — the public, customer-facing
surface of a SaaSX tenant (`overview.md`). It is the branded experience the
world sees: where people browse products, services, and listings; buy and
check out; book tours, tickets, hotels, and real estate; manage their
account and wallet; redeem coupons; talk to support; and discover with AI.

It is a **Next.js** application. It owns no business data — every product,
price, order, and balance lives behind the API (`docs/guides/api.md`). The
client renders, composes, and delights; the backend decides.

One client codebase serves many tenants and many business models. The shell
(navigation, account area, layout, footer) stays unified; what changes per
business is the **product card, the detail experience, and the
purchase/booking flow** — driven by product type, never forked into
unrelated pages. Build for that abstraction from the first line.

## How it is built (the structural strength)

This surface is governed by the same constitution as every SaaSX frontend.
It does not get its own rules — it gets the existing ones, applied with
discipline. The agent reads them and obeys:

- **The layer law** — `lib → hooks → components → features → app`, imports
  point down, a feature never imports a feature, pages are sterile
  composition (`docs/guides/architecture.md`).
- **The std lib** — every piece of native logic is a pure DSL in `lib/std`
  (`docs/guides/stdlib.md`).
- **Data** — the `resource()` DSL and TanStack Query; `fetch` lives only in
  `client.ts` (`docs/guides/api.md`).
- **State, i18n/RTL, errors, motion** — `docs/guides/state.md`,
  `i18n.md`, `errors.md`, `motion.md`.
- **Code & class style** — naming, flatness, whitespace, tokens-only,
  logical properties (`docs/guides/style.md`).

The constitution is the floor. **This file raises the ceiling on one axis:
visual quality.** The storefront is the product's face — it is held to a
higher design bar than any internal panel, and that bar is below.

## The design mandate (non-negotiable)

The storefront must look and feel like a flagship modern product — the kind
of interface that makes a visitor trust the business on sight. **Flat design
is forbidden.** Default, untouched shadcn looks are a skeleton, not a
destination — every surface is elevated well beyond the primitive's defaults.

The character we are building toward:

- **Depth, not flatness.** Considered elevation: soft, layered shadows;
  subtle gradients and tonal surfaces; borders paired with shadow to lift
  cards off the page. Nothing sits as a plain rectangle on a plain
  background. Shadows are *soft and consistent* — never harsh, never a
  single hard drop on everything.
- **Generous, consistent radius.** A deliberate radius scale — roomy on
  cards and modals, balanced on inputs and buttons, full on pills and
  avatars. One scale, applied consistently; no random corner values.
- **Exceptional motion.** Content enters (fade + rise, tasteful stagger);
  interactive elements respond to hover, press, and focus; routes morph
  through View Transitions; easings feel spring-like and intentional, never
  linear or abrupt. Motion is *felt, not noticed*.
- **Excellent hover & interaction.** Every interactive element has a
  designed hover, active, and focus state — a lift, a glow, a tonal shift, a
  micro-scale — consistent across the app. Nothing changes state without
  feedback; nothing is dead to the cursor.
- **Clear, strong typography.** A quality typeface with a real hierarchy —
  decisive heading sizes, comfortable body line-height, generous measure.
  Fonts must be crisp and legible at every size. **Blurry, cramped,
  low-contrast, or ambiguous type is forbidden.**
- **Beautiful 2D icons.** Crisp, consistent 2D icons (the locked icon set),
  uniform stroke weight and size, optically aligned. Never a grab-bag of
  mismatched styles, never a flat placeholder glyph where a real icon
  belongs.
- **Organized, rhythmic layout.** A clear visual grid, aligned elements,
  deliberate whitespace, consistent spacing rhythm. **Disorganized,
  unaligned, or cluttered content is forbidden** — every screen reads as
  composed, not assembled.
- **Cohesion.** Color, depth, radius, motion, and type form one language
  across the whole site. Light and dark are both first-class; both are
  checked before anything ships.

## Visual identity (locked)

The storefront's identity is **gold on a warm-neutral foundation**, in both
light and dark. This is a project-level decision (recorded in `../decisions/`),
not a per-page choice — build every surface in this language.

- **Gold is the primary, used with restraint.** Gold (`--primary` / `--gold`)
  is for accents, primary CTAs, highlights, focus rings, and key emphasis —
  never a flood fill across whole surfaces. A screen reads as warm-neutral with
  gold *moments*, not a gold page.
- **Gold is contrast-hard — pair it deliberately.** Gold behind text fails AA;
  never light-gold-on-white. Use gold as a **fill with dark text**
  (`bg-primary text-primary-foreground`), as a **soft-tint badge**
  (`bg-gold-soft text-gold-soft-foreground`), or as **accent / decoration** on a
  surface that already passes. Body and heading text stay `foreground`; gold is
  the accent around them. The focus-ring gold is tuned to stay visible against
  each theme's background.
- **Dark is designed around the gold.** The dark theme is a **deep, warm
  neutral** (not pure black) so gold reads warm and premium — never a cold gray
  shell with a gold sticker on top.
- **Both themes are first-class.** Light and dark are both designed and both
  checked before anything ships; backgrounds stay harmonious (the `bg-surface`
  sheen, the ambient `bg-glow`), and color, depth, radius, motion, and type
  speak one language.
- **It all lives in tokens.** The gold palette, the warm-neutral scale, the
  elevation/shadow/radius scale, the surface sheen, and the ambient glow are
  design tokens in `src/styles/globals.css` (light + dark). Use the tokens;
  never hardcode a gold hex, a one-off shadow, or an arbitrary value. Missing a
  shade? Add the token.

## The iteration law — never ship the first draft

A UI task is **not** done when it renders correctly. Correct is the
baseline; *exceptional* is the target. Before presenting or committing any
visual work, the agent runs **multiple self-critique design passes** — it
treats its own first output as a rough draft and refines it, again and
again, against the bar below, until the result genuinely exceeds
expectation. One-pass UI is forbidden.

Each pass asks, honestly:

1. Does this have real depth, or is it flat? Are the shadows soft, layered,
   and consistent?
2. Is the radius scale deliberate and uniform?
3. Does it move well — entrance, hover, press, transitions — with
   intentional easing?
4. Does every interactive element have a considered hover/active/focus
   state?
5. Is the type hierarchy clear, crisp, and well-spaced?
6. Are the icons crisp, consistent, and aligned?
7. Is the layout aligned, rhythmic, and uncluttered?
8. Is it cohesive with the rest of the site, in both light and dark?
9. Would this look at home in a top-tier modern product — or merely
   "acceptable"?

If any answer is weak, it is not finished. Refine and pass again. Only a
result that clears every question is delivered, and the report names how
many design passes were made.

## How this coexists with the constitution (read this twice)

The ambition above is achieved **through** the rules, never around them. A
conflict here is a mistake in execution, not a license to break a guide.

- **Richness flows through tokens.** Lush shadows, the radius scale,
  elevation, accent gradients — all are **design tokens** in `globals.css`
  (`docs/guides/style.md`). The mandate is to make the token set rich and
  then use it; it is never a reason to hardcode a hex, a `px`, or a one-off
  shadow. No token for what you need? Add the token — do not inline the
  value.
- **Motion obeys the performance doctrine.** All of `docs/guides/motion.md`
  still holds: animate `transform` and `opacity` only; honor
  `useReducedMotion` (reduced means instant); **no Motion components on
  dense surfaces** — product grids and long lists use CSS transitions and
  are virtualized. Beauty never costs a janky scroll.
- **Direction stays logical.** Every layout works in LTR and RTL through
  logical properties (`docs/guides/i18n.md`). A gorgeous screen that breaks
  in Arabic is broken.
- **Structure stays sterile.** No matter how rich the visuals, pages remain
  composition; the markup lives in components and features
  (`docs/guides/architecture.md`).

Stunning **and** disciplined. Either one alone is a failure.

## You are doing it wrong if…

- A surface is flat — no depth, no elevation, a plain box on a plain
  background.
- Shadows are harsh, inconsistent, or a single hard drop reused everywhere.
- Corner radii are arbitrary instead of one deliberate scale.
- Elements appear with no entrance, or react to the cursor with nothing.
- Type is cramped, blurry, low-contrast, or has no clear hierarchy.
- Icons are mismatched in style, weight, or size.
- The layout is unaligned, cluttered, or visually noisy.
- It looks like default, untouched shadcn — the skeleton shipped as the
  result.
- You delivered the first render without design-critique passes.
- You chased the look by hardcoding a hex/`px`/shadow, animating `width`/
  `height`, or dropping a logical property — beauty bought by breaking a
  guide.

## Boundaries with neighbors

- Token values, the elevation/radius/shadow scale → `globals.css` +
  `docs/guides/style.md`.
- Animation mechanics and the performance budget → `docs/guides/motion.md`.
- Direction and translation → `docs/guides/i18n.md`.
- What to build next, per feature → `tasks.md`.
