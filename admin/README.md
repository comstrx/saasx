# SaaSX Admin
Enterprise administration console. Next.js 16 (App Router, Turbopack),
React 19 + React Compiler, Tailwind v4, shadcn/ui (Base UI, Nova),
TanStack Query v5, Zustand v5, Zod v4, Biome.
## Commands
pnpm dev / pnpm build / pnpm start / pnpm lint / pnpm lint:fix /
pnpm typecheck / pnpm test
## Layers
One-way imports, bottom-up — full law in docs/guides/architecture.md.
- src/lib — pure logic: env (zod), i18n, permissions, date
- src/hooks — reusable React/browser hooks
- src/components — ui (registry-owned) + shared (house components)
- src/features — one domain each: components, hooks, api consumption
- src/app — locale-prefixed routes, composition only
- src/api — transport: client, resource builder, registry
- src/stores — ephemeral UI state (zustand collection factory)
- src/proxy — request gates (locale today, auth next)
- src/styles — global and theme CSS
