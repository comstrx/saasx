# SaaSX — Project Constitution

This repository is a production surface of the SaaSX platform — the
customer-facing **client website** (`docs/product/overview.md`). Every line
is read by humans and AI agents alike: optimize for instant comprehension,
security, and performance at once. Boring clarity beats clever brevity; when
in doubt, the simpler structure wins.

Operate at senior-engineer level: terse, correct, zero ceremony. Creativity
belongs INSIDE the code you write — never in structure, placement, naming,
or new patterns. **Structure is law.**

## Two knowledge bases — read before you act

Two trees document this system, and a building task reads from **both**:

- **`docs/guides/`** — **HOW** code is written: the layer law, the std lib,
  code style, data access, state, i18n, errors, auth, motion. The craft.
  Start at `docs/guides/README.md`.
- **`docs/product/`** — **WHAT** is being built and why. Only three files,
  each with a distinct job:
  - **`overview.md`** — what SaaSX *is*: the platform, its tenants, its
    panels, its model. Read it once to understand the world this repo lives
    in.
  - **`client.md`** — what *this* surface is (the client website) and the
    exacting visual/design doctrine it must meet. Read it before any UI.
  - **`tasks.md`** — the build sheet: the fixed build protocol plus one
    block per requested feature. **This is what you execute.** Read the
    matching task block before building it.

One rule binds them: **every fact has exactly one home.** A guide never
restates a spec; a spec never restates a guide; neither restates the other.
Link, never duplicate. Reading the matching guide(s) AND the relevant
product file(s) is part of the task, not optional context.

A third tree, **`docs/decisions/`**, is the project's **WHY** log and is
**required reading** — consult it before proposing or changing anything, and
never reopen a settled call without reading the decision that set it (that is a
process violation). It is one file per working session, each collecting that
session's decisions; after any major feature or significant/irreversible
decision, record it there (format and index in `docs/decisions/README.md`).
The constitution is the WHAT/HOW; a decision file is the WHY. Files are
immutable — supersede, never edit.

## Guides — the HOW (read before writing code)

| If the task involves… | Read first |
|---|---|
| any new file, moving code, "where does X live" | `docs/guides/architecture.md` |
| helpers/utilities, anything under `src/lib/` | `docs/guides/stdlib.md` |
| writing/editing any `.ts`/`.tsx` — naming, flatness, whitespace, classes | `docs/guides/style.md` |
| endpoints, fetching, mutations, backend calls | `docs/guides/api.md` |
| client state, stores, zustand | `docs/guides/state.md` |
| user-facing text, locales, layout direction | `docs/guides/i18n.md` |
| error handling, toasts, failure states | `docs/guides/errors.md` |
| login, sessions, permissions, proxy/redirects | `docs/guides/auth.md` |
| animation, transitions, large lists or tables | `docs/guides/motion.md` |

## Product — the WHAT (read before building)

| If the task involves… | Read first |
|---|---|
| first session in this repo — understanding the platform | `docs/product/overview.md` |
| any user-visible work — purpose and the design bar | `docs/product/client.md` |
| building a specific feature | `docs/product/tasks.md` (its block) |

`tasks.md` is the single source of work. If a task block is missing, or a
required line in it is blank/`-`, **STOP and ask the operator** — never
guess the missing part and never invent a feature that has no block.

## Stack (locked — verify versions in `package.json`; never substitute)

Next.js 16 App Router + Turbopack · React 19 + React Compiler
(`reactCompiler: true` — never remove) · TypeScript strict · Tailwind v4
(CSS-first in `globals.css`; there is NO `tailwind.config.*` — never create
one) · shadcn/ui on Base UI primitives, preset base-nova (add components via
`pnpm dlx shadcn@latest add <name>` only) · TanStack Query v5 = ALL server
state · Zustand v5 = ephemeral UI state only · Zod v4 = every external
boundary · next-intl = i18n/RTL · Motion v12 + native View Transitions ·
TanStack Table + Virtual · Identity = backend-owned via the API's `/auth/*`
endpoints (the `/v1` lives in the base URL), consumed through the `resource()`
DSL; the session is a Sanctum Bearer access token the backend issues — held in memory
and renewed from an httpOnly refresh cookie, never in
`localStorage`/`sessionStorage`;
the client runs no auth server · Biome = lint + import order only (the
formatter is retired by design) · pnpm only — never npm/yarn/bun.

react-hook-form + zod resolvers = all forms (shadcn Form) · dnd-kit = drag &
drop · react-dropzone = upload primitive (house Dropzone in
`components/custom`) · Recharts via shadcn Charts = charts · Embla (shadcn
Carousel) = sliders · cmdk (shadcn Command) = command palette · emoji-mart
(lazy-loaded) = emoji picker. Named escalations, operator approval required:
Pragmatic DnD (1000+ draggables), Uppy + tus (resumable uploads), ECharts
(>10k points or realtime).

The capability set above is pre-installed by operator decision; everything
else installs with its first real consumer. The "no dependency duplicating
an existing capability" rule stands unchanged.

## The layers (full law in `docs/guides/architecture.md`)

Vertical stack — imports point down only:

    lib → hooks → components → features → app

Cross-cutting modules — consumed by the stack, never part of it:

    api · stores · i18n · proxy · styles

- `app/` composes features; raw HTML and `className` live below it.
- Within the component layer the order is `ui → custom → layout`.
- A feature assembles components + hooks + api + permissions for ONE domain,
  exports exactly one component, and never imports another feature.
- Missing capability? CREATE it at the right layer first (a `lib` module is
  born with a sibling test), then consume it. Inlining lower-layer logic
  higher up is a violation.

## Quality gates — all pass before every commit

`pnpm lint` (0 errors) · `pnpm typecheck` (0 errors) · `pnpm build` (when
changes touch routing, config, or deps). Never bypass a gate: no
rule-disabling, no `@ts-ignore`, no `// biome-ignore`, no `any` (use
`unknown` + narrowing). Fix root causes.

## Git discipline (parent dir is a polyglot monorepo — CRITICAL)

Operate only inside this repo's directory. Never touch sibling repos
(`../server`, `../engine`, …). Stage with `git add .` from inside this repo
or with explicit paths — never `git add -A`, never parent paths. Conventional
commits, imperative, lowercase, no trailing period. Atomic: one concern per
commit. Never push, force-push, or rewrite history unless explicitly ordered
in the current session.

## Hard rules (a violation means stop and report, not improvise)

- Imports point down. A feature never imports another feature; a component
  never imports a feature.
- `app/**` pages are sterile: zero raw HTML, `className`, Tailwind, inline
  JS, or event handlers — composition only.
- Zero comments anywhere. Names, types, and sibling tests carry meaning.
- Zero hardcoded user-facing strings — every visible string through
  next-intl, keyed and present in both locale files in the same commit.
- Every visual value is a token — no hex, `rgb()`, or arbitrary `px`/`rem`.
- Logical direction utilities only (`ps`/`pe`, `ms`/`me`, `start`/`end`,
  `text-start`/`text-end`…) — the physical pairs and `rtl:`/`ltr:` variants
  are forbidden (one flipping-icon exception, see `docs/guides/i18n.md`).
- `fetch(` exists only in `src/api/client.ts`. No hardcoded URL or path in a
  feature/component; every call goes through a `resource()` registry entry.
  Permission strings come from those entries; guards (`<Can>`) and requests
  share one source.
- `process.env` is read only in `src/lib/env`. `console.*` only in
  `src/lib/log`. No secrets in code, logs, or commits; never read `.env*`.
- No new state/form/CSS/auth libraries. No MUI, no Radix imports, no
  eslint/prettier configs. Any dependency duplicating an existing capability
  needs the conflict named and operator approval.
- No `localStorage`/`sessionStorage` (or JS-readable cookie) for tokens — the
  access token is in-memory only, renewed from an httpOnly refresh cookie.
- `src/components/ui/**` is registry-owned: CLI-managed, lint-fix only,
  never re-spaced, never hand-written.
- Manual `useMemo`/`useCallback`/`memo` are forbidden — the React Compiler
  owns memoization.
- Never hand-edit `pnpm-lock.yaml`. Never delete `.gitkeep` files.

## When uncertain

State the ambiguity in one line, take the convention-consistent path, flag
it in the final report. A missing task block, or a blank required line in
one, is not an ambiguity to route around — stop and request it. Never
silently invent architecture or requirements.

`[OPERATOR INPUT]` semantics: a marker carrying a stated draft value means
build with the draft and list it under Unverified; a marker with no value,
or on a decision expensive to reverse, means STOP and ask before building.

## Reporting format (every task)

1. Gate results: command, exit code, error count.
2. `git show --stat HEAD` for each commit made.
3. Guides and product files read for this task.
4. Deviations from instructions and why — or "none".
5. For UI work, the number of design-critique passes made (`client.md`).
6. Anything left unverified (e.g. requires a running service) — say so explicitly.
