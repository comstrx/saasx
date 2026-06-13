# 0001 — Project Bootstrap

> **One file per session** (see `README.md`). This is the complete record of the
> project-setup / bootstrap sessions: the locked stack was already in place;
> these are the calls made while reconciling docs ↔ code and standing up the
> foundation. **Immutable** — a later session supersedes a decision here by
> restating it with a new date and reasoning; never edit these.

- **Session:** Project bootstrap (docs ↔ code reconciliation + foundation)
- **Date:** 2026-06-13

---

### 1. Web auth = Sanctum Bearer + in-memory access token + httpOnly refresh cookie

- **Date:** 2026-06-13
- **Decision:** The web client authenticates with a Sanctum personal-access
  token sent as `Authorization: Bearer …`. The access token is held **in memory
  only** (`src/lib/auth/token.ts`) and survives a reload via a **silent refresh**
  against an **httpOnly + Secure refresh cookie** the backend sets at login
  (`api.auth.refresh`, `credentials: "include"`, called on boot and on any
  non-guest `401`). No token in `localStorage` / `sessionStorage` / JS-cookie.
- **Why:** A public storefront has a large XSS surface; the only XSS-safe
  persistence is an httpOnly cookie, and an in-memory access token cannot be
  exfiltrated for later use. The backend is Sanctum with
  `personal_access_tokens`, and the operator owns it and chose to issue Bearer
  tokens.
- **Alternatives rejected:**
  - **SPA session cookie + same-origin BFF proxy** — *technically the cleaner
    option for tenant **custom domains*** (a first-party cookie behind a
    same-origin proxy sidesteps cross-site cookie blocking entirely). Rejected
    by **operator preference**, not feasibility: the operator owns the backend
    and chose Bearer + a backend `/auth/refresh` over a proxy/session
    architecture. SPA+BFF would have worked.
  - **Single long-lived PAT in `localStorage`** — survives reload but is
    XSS-exfiltratable and breaks the no-storage hard rule. Rejected.
  - **In-memory only, no refresh** — most XSS-safe but logs the user out on
    every reload / new tab. Rejected on UX.
- **Warning / open items:** Bearer headers cross origins freely via CORS, so the
  access token works on subdomains **and** custom domains with no app cookie.
  **But the refresh cookie is itself cross-site on custom domains**
  (`shop.acme.com` → `api.example.com`): Safari ITP and Chrome third-party-cookie
  controls may **drop** it, breaking silent refresh there. Mitigation if it
  bites: **proxy just `/auth/refresh` same-origin** (or set the cookie
  `SameSite=None; Secure` and accept the blocking risk). Separately, the edge
  proxy cannot read the in-memory token on a navigation, so guest/private edge
  redirects need a non-secret session-presence signal — open, tracked in
  `../guides/auth.md`, non-blocking (guards are UX only).

### 2. API versioning lives in the base URL

- **Date:** 2026-06-13
- **Decision:** `NEXT_PUBLIC_API_URL` ends with `/v1`; `resource()` entry paths
  are version-free (`/auth/login`). The transport composes `baseUrl + path`.
- **Why:** One home for the version; a bump is one env change, not a
  registry-wide edit.
- **Alternatives rejected:** per-entry `/v1` prefixes — drift-prone, couples the
  registry to a version number.
- **Operator action:** must set `NEXT_PUBLIC_API_URL=<host>/v1` by hand in
  `.env`, `.env.example`, `.env.production` (values in §11). The code default in
  `src/lib/env/client.ts` ends with `/v1`, but a value set in an env file
  overrides it — without the suffix every auth call resolves to `<host>/auth/...`
  and 404s.

### 3. Permissions single source = /auth/permissions

- **Date:** 2026-06-13
- **Decision:** The permission set is the dedicated `/auth/permissions` endpoint
  (`api.permissions`); never read off the session. `use-permission` reads it from
  the TanStack cache (`["auth","permissions",null,null]`), `enabled: false`
  (deny-by-default) until auth lands.
- **Why:** The `<Can>` guard and the request it protects must share exactly one
  source; two sources drift and couple permission refresh to session refresh.
- **Alternatives rejected:** permissions embedded in the session response.

### 4. Resource vocabulary = store · list · show · update · destroy

- **Date:** 2026-06-13
- **Decision:** Action keys are `store · list · show · update · destroy` (the
  exact `resource()` output, Laravel verbs); `need` strings are
  `<resource>.<action>`. Non-CRUD endpoints are explicit `extra` entries with
  their own `need`.
- **Why:** The docs had drifted to `create` / `view` / `delete`, which did not
  match `src/api/resource.ts` — and `need` is the shared guard/request string, so
  drift is a security bug.
- **Alternatives rejected:** `create` / `view` / `delete` naming.

### 5. Transport contract — queryKey() + ApiResult<T> envelope

- **Date:** 2026-06-13
- **Decision:** Query keys come from `queryKey(entry, options)` →
  `[resource, action, params, query]` (no `.key()` method on entries).
  `request()` returns `ApiResult<T> { data, meta }`; callers read `.data` (e.g.
  `select: (r) => r.data`). `bare: true` entries skip the envelope.
- **Why:** This is what `src/api/client.ts` actually implements; the guides had
  described an imagined `.key()` / bare-value contract. Docs made true to code.

### 6. Permission gate API — Can.Cannot compound (no fallback prop)

- **Date:** 2026-06-13
- **Decision:** `<Can perm|all|any loading={…}>` renders the granted branch; the
  denied branch is a `Can.Cannot` child. There is **no** `fallback` prop.
- **Why:** Matches the real `src/components/layout/can.tsx`; the guides had
  documented a non-existent `fallback` prop and a standalone `<Cannot>`.

### 7. i18n request config lives in src/i18n

- **Date:** 2026-06-13
- **Decision:** next-intl request config is `src/i18n/request.ts`;
  direction/navigation helpers are `src/lib/utils/i18n` (`locales`,
  `getDirection`, `isLocale`, and `routing.defaultLocale`). Supported locales:
  `en`, `ar` (default `en`).
- **Why:** Corrects the guide's `src/lib/i18n` path to the real tree.

### 8. Missing lib modules are create-down, not pre-built

- **Date:** 2026-06-13
- **Decision:** `lib/log`, `lib/permissions`, `lib/motion`, `lib/auth` and the
  like are created at their layer **on first use** (create-down), not assumed to
  exist. `lib/permissions` (the `Can` core, promoted from `use-permission`) is
  the first one the Auth task needs.
- **Why:** The guides referenced these as if present; reframed to the create-down
  rule so the architecture map matches reality.

### 9. Design-token scale authored in globals.css

- **Date:** 2026-06-13
- **Decision:** The depth system lives in `src/styles/globals.css` (was stock
  shadcn with zero shadow tokens): an elevation scale `shadow-xs … shadow-2xl`
  plus `shadow-focus`, a radius scale extended to `rounded-2xl` / `rounded-3xl`,
  and a `bg-surface` sheen — all defined for light and dark. Token **values** live
  here; `style.md` / `client.md` point to it. There is no separate `theming.md`.
- **Why:** `client.md`'s non-flat design bar was unbuildable through tokens that
  did not exist; the values needed a home, and `globals.css` is it.

### 10. The scaffold is illustrative, not binding

- **Date:** 2026-06-13
- **Decision:** Everything under `src/lib/std`, `src/features`, `src/components`
  was a starting sketch — rename / restructure / replace / delete freely within
  the constitution. `src/features/hello.tsx` is a placeholder; the std
  reference-data category is **`country`** (not `geo`).
- **Why:** Prevents treating throwaway scaffolding as a contract.

### 11. .env files are operator-owned

- **Date:** 2026-06-13
- **Decision:** `.env`, `.env.example`, `.env.production` are owned and set by the
  operator. Required values:
  - `.env` / `.env.example` → `NEXT_PUBLIC_API_URL=http://localhost:8000/v1`
  - `.env.production` → `NEXT_PUBLIC_API_URL=https://<api-host>/v1`
- **Why:** A global Claude deny (`Read(.env)`, `Read(.env.*)` in
  `~/.claude/settings.json`) protects secret files, and deny precedence means a
  project-level allow does not override it. Without the `/v1` suffix every auth
  call 404s (§2).

### 12. Decision-log format = one file per session

- **Date:** 2026-06-13
- **Decision:** The decision log is **one file per working session**
  (`NNNN-kebab-title.md`), each collecting that session's decisions as `###`
  subsections. This **supersedes** the initial one-ADR-per-decision layout; the
  original 0001–0004 ADRs are folded into this bootstrap file. Files are
  immutable; a later session supersedes a decision by restating it with a new
  date.
- **Why:** Sessions produce clusters of related decisions; one file per session
  keeps the narrative and timeline coherent and the directory small.
