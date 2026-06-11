# SaaSX Admin — Project Constitution

This is a production enterprise foundation: an ecommerce admin panel
today, the base for client storefronts tomorrow. Every line you write is
read by humans and AI agents alike: optimize for instant comprehension,
security, and performance at once. Boring clarity beats clever brevity.
When in doubt, the simpler structure wins.

Operate at senior-engineer level: terse, correct, zero ceremony.
Creativity belongs INSIDE the code you write — never in structure,
placement, naming schemes, or new patterns. Structure is law.

Two knowledge layers, one rule: `docs/guides/` defines HOW code is
written (the law); `docs/product/` defines WHAT is being built and why
(the specs). Every fact has exactly one home — never duplicate a rule
or a spec, link to it.

## Guides — read BEFORE acting (mandatory)

| If the task involves… | You MUST first read |
|---|---|
| any new file, moving code, "where does X live" | `docs/guides/architecture.md` |
| helpers/utilities, anything under `src/lib/` | `docs/guides/stdlib.md` |
| endpoints, fetching, mutations, backend calls | `docs/guides/api.md` |
| writing or editing any `.ts` / `.tsx` | `docs/guides/style.md` |
| user-facing text, locales, layout direction | `docs/guides/i18n.md` |
| animation, transitions, large lists or tables | `docs/guides/motion.md` |
| login, sessions, permissions, proxy/redirects | `docs/guides/auth.md` |
| error handling, toasts, failure states | `docs/guides/errors.md` |
| client state, stores, zustand | `docs/guides/state.md` |

## Product specs — the WHAT (mandatory before building)

| If the task involves… | You MUST first read |
|---|---|
| anything — first session in this repo | `docs/product/overview.md` |
| building or changing a feature | `docs/product/features/<feature>.md` |
| building or changing a page | `docs/product/pages/<page>.md` |
| backend behavior, limits, response shapes | `docs/product/system/backend.md` |
| permission names, roles, who can do what | `docs/product/system/permissions.md` |
| supported locales, translated content | `docs/product/system/languages.md` |
| prices, money, exchange, display currency | `docs/product/system/currency.md` |
| colors, dark mode, brand theming | `docs/product/system/theming.md` |

If the spec for a feature or page does not exist: STOP and request it
from the operator. Never build from imagination. New specs are written
from `_template.md` in the same directory.

Reading the matching guides and specs is part of the task, not optional
context. If a task touches several rows, read every match before the
first edit.

## Stack (locked — verify versions in package.json; never substitute)

Next.js 16 App Router + Turbopack · React 19 + React Compiler
(`reactCompiler: true` — never remove) · TypeScript strict · Tailwind v4
(CSS-first in `globals.css`; there is NO `tailwind.config.*` — never
create one) · shadcn/ui on Base UI primitives, preset base-nova (add
components via `pnpm dlx shadcn@latest add <name>` only) · TanStack
Query v5 = ALL server state · Zustand v5 = ephemeral UI state only ·
Zod v4 = every external boundary · next-intl = i18n/RTL · Motion v12 +
native View Transitions · TanStack Table + Virtual · Better Auth ·
Biome = lint + import order only (the formatter is retired by design) ·
pnpm only — never npm/yarn/bun.

## The five layers (full law in docs/guides/architecture.md)

`lib → hooks → components(shared|ui) → features → app`

- `app/` composes features. Raw HTML and `className` live below it.
- A feature assembles components + hooks + api + permissions for ONE
  domain and never imports another feature.
- Missing capability? CREATE it at the right layer first (lib modules
  are born with a sibling test), then consume it. Inlining lower-layer
  logic higher up is a violation.

## Quality gates — all must pass before every commit

`pnpm lint` (0 errors) · `pnpm typecheck` (0 errors) · `pnpm build`
(when changes touch routing/config/deps). Never bypass a gate: no
rule-disabling, no `@ts-ignore`, no `any` (use `unknown` + narrowing).
Fix root causes.

## Git discipline (parent dir is a polyglot monorepo — CRITICAL)

Operate only inside `admin/`. Never touch `../server`, `../client`,
`../engine`. Stage with `git add .` from inside `admin/` or explicit
paths — never `git add -A`, never parent paths. Conventional commits
with `(admin)` scope, imperative, lowercase, no trailing period.
Atomic: one concern per commit. Never push, force-push, or rewrite
history unless explicitly ordered in the current session.

## Hard rules (a violation means stop and report, not improvise)

- Zero comments anywhere. Names, types, and sibling tests carry meaning.
- Zero hardcoded user-facing strings — every visible string through
  next-intl.
- `fetch(` exists only in `src/api/client.ts`.
- `process.env` is read only in `src/lib/env`. No secrets in code,
  logs, or commits; never read `.env*` files.
- No new state/form/CSS/auth libraries. No MUI, no Radix imports, no
  eslint/prettier configs. Adding any dependency that duplicates an
  existing capability requires naming the conflict and getting approval.
- No `localStorage`/`sessionStorage` for auth or session data.
- `src/components/ui/**` is registry-owned: CLI-managed, lint-fix only,
  never re-spaced, never hand-written.
- Never hand-edit `pnpm-lock.yaml`. Never delete `.gitkeep` files.
- Manual `useMemo`/`useCallback`/`memo` are forbidden — the React
  Compiler owns memoization.

## When uncertain

State the ambiguity in one line, take the convention-consistent path,
flag it in the final report. A missing or contradictory product spec is
not an ambiguity to route around — stop and request the spec. Never
silently invent architecture or requirements.

[OPERATOR INPUT] semantics: a marker carrying a stated draft value
means build with the draft and list it under Unverified; a marker
with no value, or on a decision expensive to reverse, means STOP and
ask before building.

## Reporting format (every task)

1. Gate results: command, exit code, error count.
2. `git show --stat HEAD` for each commit made.
3. Guides and product specs read for this task.
4. Deviations from instructions and why — or "none".
5. Anything left unverified (e.g. requires a running service) — say so
   explicitly.
