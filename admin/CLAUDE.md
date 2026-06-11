# SaaSX Admin — Agent Operating Contract

Enterprise admin console. You are expected to operate at senior-engineer
level: terse, correct, zero ceremony.

## Stack (verified — do not "upgrade" or substitute without explicit order)
- Next.js 16.2 App Router + Turbopack. React 19.2 + React Compiler
  (`reactCompiler: true` in next.config.ts — never remove).
- Tailwind v4 (CSS-first config lives in src/app/globals.css `@theme`).
  There is NO tailwind.config.* — do not create one.
- shadcn/ui on Base UI primitives, preset base-nova (components.json).
  Add components via `pnpm dlx shadcn@latest add <name>` — never hand-roll
  a component that exists in the registry, never import Radix.
- TanStack Query v5 = ALL server state. Zustand v5 = ephemeral UI state
  only. Zod v4 = validation + env. Biome = lint/format (NOT eslint/prettier).
- pnpm only. Never npm/yarn/bun.

## Architecture rules
- src/features/<domain>/ = vertical slices: components, hooks, api,
  types per domain. Cross-feature imports are forbidden; shared code goes
  to src/components/shared, src/hooks, src/lib.
- src/components/ui/ is registry-managed. Never edit by hand except to fix
  lint/a11y; customizations live in wrappers under components/shared.
- Server state never enters Zustand. No user/request-scoped data in
  module-level stores (SSR leakage).
- All env access goes through src/lib/env.ts (zod-parsed). Never read
  process.env elsewhere.
- API base URL: env.NEXT_PUBLIC_API_URL (Rust backend, port 8080).
- Server Components by default; "use client" only at interactive leaves.
- Prefer searchParams/URL state over client stores for filters/pagination.

## Quality gates — run before EVERY commit, all must pass
1. pnpm lint        (biome check . — 0 errors)
2. pnpm typecheck   (tsc --noEmit — 0 errors)
3. pnpm build       (when changes touch routing/config/deps)
Never bypass with rule-disabling, @ts-ignore, or `any`. Fix root causes.
`any` is banned; use `unknown` + narrowing.

## Git discipline (parent dir is a polyglot monorepo — CRITICAL)
- Operate ONLY inside admin/. Never touch ../server, ../client, ../engine.
- Stage with `git add .` (or explicit paths) from inside admin/ ONLY.
  `git add -A`, `git add ..`, and any parent-path staging are forbidden.
- Conventional commits, scope (admin): feat(admin):, fix(admin):,
  chore(admin):, docs(admin):. Imperative, lowercase, no trailing period.
- Never push, never force-push, never rebase published history unless
  explicitly ordered in the current session.

## Forbidden (hard rules)
- No new state libraries (redux/jotai/valtio/etc.). No CSS-in-JS. No MUI.
- No eslint/prettier configs. No tailwind.config.js.
- No localStorage for auth tokens. No secrets in code or commits — env only.
- No `pnpm add` of a dependency that duplicates an existing capability
  without listing the conflict and getting approval.
- Do not edit pnpm-lock.yaml manually. Do not delete .gitkeep files.

## When uncertain
State the ambiguity in one line, pick the convention-consistent option,
flag it in the final report. Do not silently invent architecture.

## Code style (beyond formatter)
- Breathing room over density: separate logical blocks and JSX sibling
  groups with a single blank line.
- Prefer more short lines over fewer clever ones: early returns over deep
  nesting, no nested ternaries, no inline chained one-liners.
- Comments only when the "why" is non-obvious; never narrate the "what".
- Write at the formatter's fixed point: committed code must survive
  `pnpm exec biome check --write` byte-identical.
