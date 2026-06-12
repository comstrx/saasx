# Auth, permissions, proxy

## Identity — Better Auth (Next owns identity)

- Server config: `src/lib/auth/server.ts` · client: `src/lib/auth/client.ts`.
- Route handler: `src/app/api/auth/[...all]/route.ts` — the only auth
  route; never hand-roll auth endpoints.
- Postgres-backed. Sessions are httpOnly cookies; tokens never touch
  `localStorage`/`sessionStorage` or client-readable cookies.
- Social providers configured via `lib/env`
  (`AUTH_<PROVIDER>_ID` / `AUTH_<PROVIDER>_SECRET`); adding a provider
  is env + one config line, never custom OAuth code.
- Login/registration/reset UI lives in `src/features/auth/` and
  composes shared/ui like any feature.
- The Rust/Laravel backends verify Better Auth JWTs — they consume
  identity, they do not own it.

## Security boundary (CVE-2025-29927 lesson)

Session verification happens in the data layer and server layouts —
where the data is read. The proxy only improves the journey with early
redirects; it is never the security boundary. The backend is zero-trust
and revalidates every request regardless of anything the UI hid.

## Permissions DSL

- Core set logic: `src/lib/permissions/` — pure, isomorphic:
  `has(perm)`, `hasAll([...])`, `hasAny([...])`.
- React access: `src/hooks/use-permissions.ts` reads the session's
  permission set from TanStack cache (key `["auth", "permissions"]`),
  refreshable from its endpoint without re-login.
- UI guards: `src/components/shared/guard.tsx`:

```tsx
<Need perm="users.create">…</Need>
<Need all={["orders.view", "orders.export"]}>…</Need>
<Need any={["orders.view", "orders.manage"]} fallback={<Locked />}>…</Need>
```

- Permission strings come from api registry entries (api.md) — the
  guard and the request it protects share one source and cannot drift.
- Guards are UX only. Hiding a button is a courtesy; the backend
  decides. Never treat a passed guard as authorization.
- Until the auth feature lands, `use-permissions` ships disabled with
  an empty set, so every `<Need>` renders its fallback
  (deny-by-default).

## Proxy (request gate)

- `src/proxy.ts` is a thin composer (<10 lines) over `src/proxy/`:
  `chain.ts` · `locale.ts` (next-intl routing) · `auth.ts`
  (session-cookie redirects: guests off private routes, authed users
  off /login).
- Each guard is one file: takes the request, returns a response or
  passes to the next. Adding a guard = new file + one line in the
  chain. `src/proxy.ts` itself never grows.
- Allowed work in the chain: redirect, rewrite, headers. No database
  calls, no heavy imports, no business logic — the runtime is
  constrained and the real checks live in the data layer.
