# auth — Identity, Permissions, the Request Gate

Three concerns, one principle: the UI is a courtesy, the backend is the
authority.

## Mental model

**Guards improve the journey; they never grant access.** Hiding a control a
visitor can't use, redirecting a guest away from a private route — that is
UX. The decision that matters happens server-side, and the backend
revalidates every request regardless of what the UI chose to hide. Build
every guard as if an attacker will call the endpoint directly — because they
will, and the backend is what stops them.

## Identity — backend-owned

The backend owns identity. This client runs **no auth server of its own**.

- Authentication is the backend's `/v1/auth/*` API, consumed through the
  `resource()` DSL (`api.md`, and the Auth block in `tasks.md`) — never a
  `fetch`, never a hardcoded URL or path.
- Sessions are **httpOnly cookies the backend sets**; the browser returns
  them automatically (`credentials: "include"`). Tokens never touch
  `localStorage`, `sessionStorage`, or any client-readable cookie.
- **Social login** goes through `/v1/auth/social-login/:provider`; the
  client triggers the provider flow via that endpoint — no custom OAuth code
  lives on the client.
- The current session and its permission set are read via `api.auth.session`
  and cached in TanStack (key `["auth", "permissions"]`), refreshable
  without re-login.
- Login / registration / recovery / reset / confirm UI lives in
  `src/features/auth/` and composes shared components like any feature.
- The backend is **zero-trust**: it verifies the session on every request
  and owns the final decision. It issues identity; the client only consumes
  it.

## Security boundary (the CVE-2025-29927 lesson)

Authorization happens where the data is read — server-side. The proxy only
smooths the journey with early redirects; it is **never** the security
boundary. Middleware can be bypassed; the backend cannot.

## Permissions — the `Can` DSL (the canonical pattern)

Even though the storefront is mostly guest-vs-authenticated, account and
feature visibility still gate through one shape every feature copies: a pure
core, a hook, a presentational gate.

- Pure core in `src/lib/permissions/` — isomorphic: `has(perm)`,
  `hasAll([...])`, `hasAny([...])`. No React, no IO.
- React access in `src/hooks/use-permission.ts` — reads the session's
  permission set from the TanStack cache (`["auth", "permissions"]`).
- The gate in `src/components/layout/can.tsx`:

```tsx
<Can perm="wallet.view"> … </Can>
<Can any={["orders.view", "orders.track"]} fallback={<SignInPrompt />}> … </Can>
<Cannot perm="wallet.view"> … </Cannot>
```

- Permission strings come from `api` registry entries (`api.md`) — the gate
  and the request it protects share one source and cannot drift.
- Guards are UX only. Hiding a control is a courtesy; the backend decides.
- Until auth lands, `use-permission` ships disabled with an empty set, so
  every `<Can>` renders its fallback — deny-by-default.

## Proxy — the request gate

- `src/proxy.ts` is a thin composer (under ~10 lines) over `src/proxy/`:
  `chain.ts` runs the guards; `locale.ts` (next-intl routing) and `auth.ts`
  (cookie-based redirects: guests off private routes, signed-in users off
  `/login`) are guards.
- Each guard is one file: take the request, return a response or pass to the
  next. Adding a guard = a new file + one line in the chain; `proxy.ts`
  itself never grows.
- Allowed in the chain: redirect, rewrite, headers. Forbidden: database
  calls, heavy imports, business logic. The runtime is constrained and the
  real checks live server-side.

## You are doing it wrong if…

- You treated a passed `<Can>` as authorization → it's UX; the backend
  authorizes.
- A token or session landed in `localStorage` / `sessionStorage` → httpOnly
  cookie only.
- You wrote `fetch` or a hardcoded `/v1/auth/...` URL for auth → it goes
  through the `resource()` entries (`api.md`).
- You added logic to the proxy beyond redirect/rewrite/headers → move the
  real check server-side.
- You hand-typed a permission string the request doesn't share → both read
  the registry entry.
- `proxy.ts` is growing past a composer → each guard is its own file.

## Boundaries with neighbors

- Where permission strings are defined → `api.md`.
- `401`/`403` handling in the UI → `errors.md`.
- The locale guard's translation behavior → `i18n.md`.
- The auth feature's endpoints, flows, and fields → the Auth block in
  `tasks.md`.
