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

## Identity — backend-owned, Bearer tokens

The backend owns identity. This client runs **no auth server of its own**.

- Authentication is the backend's `/auth/*` API (the `/v1` lives in the base
  URL — see `api.md`), consumed through the `resource()` DSL (`api.md`, and
  the Auth block in `tasks.md`) — never a `fetch`, never a hardcoded URL or
  path.
- The session is a **Sanctum personal-access token (Bearer)** the backend
  issues at login. The transport attaches it as `Authorization: Bearer …` on
  every non-guest entry (`api/client.ts`, supplied via `configure({ token })`).
- **The access token lives in memory only** — a module-level holder in
  `src/lib/auth/token.ts` (`set` / `get` / `clear`), never `localStorage`,
  `sessionStorage`, a JS-readable cookie, or a store. This is the hard rule
  (`AGENTS.md`); it is what stops a token grabbed via XSS from being
  exfiltrated for later use.
- **Surviving a reload** is the one thing memory cannot do, so the backend also
  sets an **httpOnly, Secure refresh cookie** at login. On boot — and on any
  non-guest `401` — the client calls `api.auth.refresh` with
  `credentials: "include"`; the backend reads the cookie (JS never can) and
  returns a fresh access token, which goes back into the in-memory holder. That
  cookie is the only persisted auth artifact, and JS can neither read nor steal
  it.
- **Renewal flow:** `client.ts` already runs the refresh once on a non-guest
  `401` and retries (`configure({ refresh })`); boot rehydration is the same
  call made eagerly (a `401` there just means guest). `login` stores the token
  and lets the backend set the cookie; `logout` revokes the token, clears the
  cookie, and empties the in-memory holder + query cache.
- **Social login** goes through `/auth/social-login/:provider`; the client
  triggers the provider flow via that endpoint — no custom OAuth code lives on
  the client.
- Current identity is read via `api.auth.session`. The **permission set is a
  separate, dedicated endpoint** — `api.permissions` (`/auth/permissions`), the
  single source (see below). Permissions are never read off the session.
- Login / registration / recovery / reset / confirm UI lives in
  `src/features/auth/` and composes shared components like any feature.
- The backend is **zero-trust**: it verifies the token on every request and
  owns the final decision. It issues identity; the client only consumes it.

### Backend contract (Sanctum API-token mode)

This storage model needs three things from the backend — flag if any is absent:

- `POST /auth/login` returns the access token in the body **and** sets an
  httpOnly + Secure refresh cookie.
- `POST /auth/refresh` reads that cookie and returns a fresh access token (keep
  the access token short-lived, the cookie longer).
- `POST /auth/logout` revokes the token and clears the cookie.

Bearer headers cross origins freely (CORS allows `Authorization`), so the
access token works on sibling subdomains **and** tenant custom domains with no
cookie at all. The only cross-site cookie is the refresh cookie, used on a
single endpoint — set it `SameSite=None; Secure` for custom domains, or route
just `/auth/refresh` through a same-origin path.

## Security boundary (the CVE-2025-29927 lesson)

Authorization happens where the data is read — server-side. The proxy only
smooths the journey with early redirects; it is **never** the security
boundary. Middleware can be bypassed; the backend cannot.

> **Open (flagged, not yet solved).** The edge proxy runs before any client
> JS, so it cannot read an in-memory Bearer token on a navigation. Which
> session-presence signal the edge uses for guest/private redirects — a
> non-secret hint cookie set beside the token, a header, or no edge redirect
> at all — is an open decision to settle when proxy redirects are reconciled.
> It does **not** block the Auth build: guards are UX only and the backend
> authorizes regardless.

## Permissions — the `Can` DSL (the canonical pattern)

Even though the storefront is mostly guest-vs-authenticated, account and
feature visibility still gate through one shape every feature copies: a pure
core, a hook, a presentational gate.

- **Single source.** The permission set is the dedicated `/auth/permissions`
  endpoint (`api.permissions` in the registry). There is exactly one source;
  the session does not carry permissions.
- **Pure core** — `can(set, perm)`, `canAll(set, perms)`, `canAny(set, perms)`,
  `toSet(list)`: isomorphic, no React, no IO. Today these are exported from
  `src/hooks/use-permission.ts`; promoting them to an isomorphic
  `src/lib/permissions/` is an Auth prerequisite (create-down, `architecture.md`).
- **React access** — `usePermission()` in `src/hooks/use-permission.ts` reads
  the set from the TanStack cache (`queryKey(api.permissions)` →
  `["auth", "permissions", null, null]`) and returns `{ can, canAll, canAny }`.
- **The gate** — `src/components/layout/can.tsx`. The denied branch is the
  `Can.Cannot` compound child (there is **no** `fallback` prop); a `loading`
  prop renders while the set is pending:

```tsx
<Can perm="wallet.view"> … </Can>

<Can any={["orders.show", "orders.track"]} loading={<Skeleton />}>

    <AccountWidget />

    <Can.Cannot>

        <SignInPrompt />

    </Can.Cannot>

</Can>
```

- Permission strings are `<resource>.<action>`, sourced from `api` registry
  entries (`api.md`) — the gate and the request it protects share one source
  and cannot drift.
- Guards are UX only. Hiding a control is a courtesy; the backend decides.
- Until auth lands, `usePermission` ships disabled (`enabled: false`) with an
  empty set, so every `<Can>` shows its `Can.Cannot` branch — deny-by-default.

## Proxy — the request gate

- `src/proxy.ts` is a thin composer (under ~10 lines) over `src/proxy/`:
  `chain.ts` runs the guards; `locale.ts` (next-intl routing) is the guard
  wired today. An `auth.ts` redirect guard (guests off private routes,
  signed-in users off `/login`) lands with the Auth task — gated on the edge
  session-signal decision flagged above (the edge can't read the in-memory
  token).
- Each guard is one file: take the request, return a response or pass to the
  next. Adding a guard = a new file + one line in the chain; `proxy.ts`
  itself never grows.
- Allowed in the chain: redirect, rewrite, headers. Forbidden: database
  calls, heavy imports, business logic. The runtime is constrained and the
  real checks live server-side.

## You are doing it wrong if…

- You treated a passed `<Can>` as authorization → it's UX; the backend
  authorizes.
- A token landed in `localStorage` / `sessionStorage` → in-memory only,
  renewed from the httpOnly refresh cookie.
- You read permissions off the session → the single source is
  `/auth/permissions` (`api.permissions`).
- You wrote `fetch` or a hardcoded `/auth/...` (or `/v1/...`) URL for auth →
  it goes through the `resource()` entries (`api.md`).
- You reached for a `fallback` prop on `<Can>` → the denied branch is a
  `Can.Cannot` child.
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
