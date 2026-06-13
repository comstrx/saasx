# Build Sheet — What To Build

The single source of work. This file is the **fixed Build Protocol** below,
followed by **one block per feature**. A building session reads the matching
guide(s) (`../guides/`) AND the relevant product file(s) (`overview.md`,
`client.md`) AND this block, then executes. If a block is missing, or a
required line in it is blank or `-`, **STOP and ask** — never guess the missing
part and never invent a feature that has no block.

## Build Protocol (read first, every task)

1. **Read first.** Route through `AGENTS.md`: the matching guide(s) for the
   craft, `client.md` for any UI, and this task block. Reading is part of the
   task, not optional.
2. **Layers.** `lib → hooks → components → features → app`; imports point down;
   a feature never imports a feature; a component never imports a feature;
   `app/**` pages are sterile composition (`../guides/architecture.md`).
3. **Create-down.** A missing capability is created at its correct layer first
   (a `lib` module is born with its sibling test), then consumed — never
   inlined higher up.
4. **Style.** Tokens only (values in `src/styles/globals.css`), logical
   direction utilities only, zero comments, zero hardcoded user-facing strings
   (next-intl, all four locale files in the same commit), no manual
   `useMemo`/`useCallback`/`memo` (`../guides/style.md`, `i18n.md`).
5. **Data & identity.** `fetch(` only in `src/api/client.ts`; every call is a
   `resource()` registry entry; the access token is Bearer + in-memory;
   permissions are the dedicated `/auth/permissions` endpoint
   (`../guides/api.md`, `auth.md`).
6. **Gates (all green before commit).** `pnpm lint` (0) · `pnpm typecheck` (0)
   · `pnpm build` (when routing/config/deps change). No bypass — no
   rule-disable, `@ts-ignore`, `biome-ignore`, or `any`.
7. **Report.** Gate results; `git show --stat` per commit; guides + product
   files read; deviations; design-critique pass count for UI; anything left
   unverified.

## Status legend

| Status | Meaning |
|---|---|
| **READY** | Prerequisites met; a session can execute it end-to-end without asking. |
| **IN PROGRESS** | Being built now. |
| **DONE** | Shipped; gates green. |
| **BLOCKED** | A prerequisite or decision is missing — named in the block. |
| **BACKLOG** | Intent captured; not yet specced to READY. Gets a full block before build. |

## Locked platform decisions (apply everywhere)

1. **Auth transport = Bearer (Sanctum API-token).** Login returns a Sanctum
   personal-access token; the client holds it **in memory only**
   (`src/lib/auth/token.ts`) and sends `Authorization: Bearer …`. It survives a
   reload by re-minting from an **httpOnly refresh cookie** the backend sets at
   login (`api.auth.refresh`, `credentials: "include"`). Never
   `localStorage`/`sessionStorage`/JS-cookie. The backend authorizes every
   request; the proxy is never the security boundary.
2. **API versioning = base URL.** `NEXT_PUBLIC_API_URL` ends with `/v1`;
   `resource()` entry paths are **version-free** (`/auth/login`). **You must set
   `NEXT_PUBLIC_API_URL=<host>/v1` by hand in `.env`, `.env.example`, and
   `.env.production`** — the code default in `src/lib/env/client.ts` ends with
   `/v1`, but a value set in an env file overrides it, so without the suffix
   every auth call resolves to `<host>/auth/...` and 404s. See the API-versioning
   decision in `../decisions/0001-project-bootstrap.md`.
3. **Permissions = one source.** The dedicated `/auth/permissions` endpoint
   (`api.permissions`, already wired to `use-permission`). The session never
   carries permissions.
4. **Resource vocabulary.** `store · list · show · update · destroy` — the
   exact keys `resource()` emits; `need` strings are `<resource>.<action>`.

---

## Auth · Status: READY

> First real task. Build against the standard endpoints as if the backend is
> already live. No `fetch` in any feature/component, no hardcoded URL or path
> anywhere — every call goes through the `resource()` DSL in `src/api`
> (`../guides/api.md`). Obey the Build Protocol above.

- **Goal:** A visitor can sign in, register, recover and reset a password, and
  confirm an account/code — across email/password and social providers —
  through one cohesive, beautifully designed auth surface.

### Prerequisites (in-task, create-down — do these first, no operator input needed)

1. **`src/lib/permissions/`** — promote the pure predicates (`can`, `canAll`,
   `canAny`, `toSet`) out of `src/hooks/use-permission.ts` into an isomorphic
   `lib` module (born with its sibling test); leave `usePermission()` as the
   React accessor that imports them. This is the canonical `Can` core
   (`../guides/auth.md`).
2. **In-memory token holder + wiring.** Add a tiny module-level token holder
   (e.g. `src/lib/auth/token.ts` — set/get/clear, **no persistence**) and wire
   `configure({ token, refresh })` in `src/app/[locale]/providers.tsx` (today
   only `context` is wired). `login`/`social` success sets the token;
   `logout` clears it and the query cache; `refresh` calls `api.auth.refresh`.
   On app boot, call `refresh` once to silently rehydrate the token from the
   httpOnly cookie — a `401` there simply means guest.
3. **shadcn primitives via CLI.** Present already: `button`, `input`, `label`,
   `select`, `dialog`, `popover`, `sonner`, `badge`, `skeleton`, `tabs`,
   `table`, `dropdown-menu`. Add the missing ones:
   `pnpm dlx shadcn@latest add form checkbox input-otp`. Never hand-write
   `components/ui/**`.
4. **Locale keys.** Add the `auth.*` namespace (labels, CTAs, validation,
   errors) to all four locale files (`messages/{en,ar,fr,de}.json`) in the same
   commit.

### Endpoints (standard — treat as live)

Base: `NEXT_PUBLIC_API_URL` (ends with `/v1`) + the version-free paths below.
Methods follow REST convention. Auth is public — **no `need` strings**.

| entry | method | path |
|---|---|---|
| `api.auth.login` | POST | `/auth/login` |
| `api.auth.logout` | POST | `/auth/logout` |
| `api.auth.register` | POST | `/auth/register` |
| `api.auth.recovery` | POST | `/auth/recovery` |
| `api.auth.reset` | POST | `/auth/reset` |
| `api.auth.confirm` | POST | `/auth/confirm` |
| `api.auth.session` | GET | `/auth/session` |
| `api.auth.refresh` | POST | `/auth/refresh` |
| `api.auth.socialLogin` | POST | `/auth/social-login/:provider` |

- `:provider` ∈ `google | facebook | github | apple | telegram`.
- Define these in one `src/api/auth.ts` via `resource("auth", { extra: … })` —
  non-CRUD, so **all explicit extras** (no auto CRUD). Register it in
  `src/api/registry.ts`. `login`/`register`/`recovery`/`reset`/`confirm`/
  `social` are `guest: true` (the request carries no token).
- **Permissions are NOT defined here.** The set is `api.permissions`
  (`/auth/permissions`), already in the registry and consumed by
  `use-permission` — the single source (decision 3). Do not add a second.
- `api.auth.session` returns the current identity. `api.auth.refresh` mints a
  fresh access token from the **httpOnly refresh cookie** — the one entry that
  sets `credentials: "include"`; every other entry is pure Bearer (no cookie).
  Login / refresh / logout depend on that cookie — see the Backend contract in
  `../guides/auth.md`.

### Fields & validation (the conventional set)

One Zod schema per mode in `features/auth/schema.ts`, consumed by
`react-hook-form` + zod resolver (locked stack). Reuse `lib/std/validate`
(`isEmail`, `isStrongPassword`); add a pure helper only if one is genuinely
missing. Fields:

- name · phone · email · password · confirm-password · affiliate code/name ·
  agree-to-terms (boolean, required true).
- Each mode uses the subset it needs. `confirm-password` must equal `password`;
  `agree-to-terms` must be accepted on register.

### Behavior (flows)

- **login** — email + password → on success the backend returns an access
  token (stored in memory via `configure({ token })`) and sets the httpOnly
  refresh cookie; redirect to the post-login route.
- **register** — name, phone, email, password, confirm-password, affiliate
  code/name (optional), agree-to-terms → success leads to the confirm step.
- **recovery** — email → backend sends a recovery code/link → leads to reset.
- **reset** — new password + confirm (with the recovery token/code) → success
  returns to login.
- **confirm** — a code (email or SMS) confirms the account/action; supports
  **resend** after a cooldown.
- **social-login** — one call per provider button; success behaves like login.
- **logout** — clears the in-memory token and the TanStack cache.
- `[OPERATOR INPUT]` exact post-login redirect route, code length, and resend
  cooldown — build with sensible defaults (**6-digit code, 30s resend, redirect
  to `/`**) and list them as unverified.

### Layer placement

| layer | what to add | path |
|---|---|---|
| `lib/std` | reuse `validate`; add a pure helper only if genuinely missing | `src/lib/std/validate` |
| `lib/permissions` | the `Can` core promoted from `use-permission` (prerequisite 1) | `src/lib/permissions` |
| `lib/auth` | in-memory token holder (prerequisite 2) | `src/lib/auth` |
| `api` | `resource("auth", { extra })` + register it | `src/api/auth.ts`, `src/api/registry.ts` |
| `hooks` | `use-auth` — wraps the auth mutations over TanStack (login/register/recovery/reset/confirm/social/logout), exposes status + typed submit; **general** because pages and the layout (logout) consume it | `src/hooks/use-auth.ts` |
| `stores` | none — identity is not client state; it is the in-memory token + TanStack cache (`../guides/state.md`, `auth.md`) | - |
| `components/ui` | only via CLI (prerequisite 3) | `src/components/ui/elements` |
| `components/custom` | shared composites only if genuinely cross-feature (e.g. `social-buttons`, `otp-input`); otherwise keep them self | `src/components/custom` |
| `features/auth` | the one feature; see anatomy below | `src/features/auth/**` |
| `app/[locale]` | the five sterile routes composing `features/auth` with a `mode` (+ params) | `src/app/[locale]/(auth)/…` |
| `messages` (all locales) | every visible string + field/validation message, namespaced `auth.*`, all locale files same commit | `messages/{en,ar,fr,de}.json` |
| `tests` | deferred (mirror path reserved) — `tests/features/auth/…` | - |

### `features/auth` anatomy (exports ONE component)

    features/auth/
      components/        self parts: AuthCard, AuthHeader, fields, SocialButtons, OtpInput, TermsCheckbox
      hooks/             self hooks if any (mode-specific glue)
      schema.ts          zod schema per mode
      config.ts          per-mode meta: which fields, which providers, copy keys, redirect
      types.ts           AuthMode + form types
      index.ts           exports the single <Auth> component

- **`<Auth mode={…} />`** is the only public export. `mode ∈ login | register |
  recover | reset | confirm`. The component reads `config.ts` for the mode
  (fields shown, providers, title/cta keys) and renders the right form via
  `react-hook-form` + the mode's zod schema, calling `use-auth`.
- **Configurable via props + meta**, overridable at the use-site (enabled
  providers, default affiliate code from a referral link).
- Pages pass the mode; the feature owns everything else.

### Pages (sterile — compose the feature)

Each route mounts `<Auth>` with its mode and nothing else (no markup in pages):

- `/[locale]/login` → `<Auth mode="login" />`
- `/[locale]/register` → `<Auth mode="register" />`
- `/[locale]/recover` → `<Auth mode="recover" />`
- `/[locale]/reset` → `<Auth mode="reset" />` (reads token/code from params)
- `/[locale]/confirm` → `<Auth mode="confirm" />` (reads channel/code params)

### Error handling (per `../guides/errors.md`)

- `422 validation_failed` → map `error.fields` onto the form inputs (never a
  toast); messages localized under `auth.*`.
- `401 unauthenticated` (bad credentials) → inline form error, one clear
  sentence, not a stack/code. (The transport's refresh path is for expired
  tokens on authenticated calls, not for a failed login.)
- `429 rate_limited` → one calm "slow down" toast with the retry delay;
  `client.ts` owns the backoff.
- `5xx` / network → retryable error state or toast with retry.
- Every message: what failed + what to do next; no codes, no jargon.

### States

loading (submit pending → button busy, inputs locked) · empty (n/a — forms) ·
error (inline field + form-level per above) · no-permission (n/a — public).

### Design notes (per `client.md` — this is the product's face)

- Non-flat auth card with real depth — use the elevation tokens
  (`shadow-lg`/`shadow-xl`), a generous radius (`rounded-2xl`/`rounded-3xl`),
  and the `bg-surface` sheen; not a bare boxed form.
- Entrance animation; per-field focus states (`shadow-focus`); buttons with
  designed hover/active/busy; social buttons crisp and consistent (2D brand
  icons).
- Strong type hierarchy, clear labels, visible validation; OTP input is a
  polished segmented control.
- Full light/dark and LTR/RTL parity; reduced-motion respected.
- Run **multiple design-critique passes** before delivery — do not ship the
  first render.

### Out of scope (future tasks)

Real backend wiring beyond consuming the standard endpoints; remember-me /
device management; captcha; password-strength meter UI (unless trivial via
existing tokens); the edge `auth.ts` redirect guard (it depends on the open
edge session-signal decision flagged in `../guides/auth.md` — guests/private
redirects are deferred and do not block this surface).

### Acceptance

- No `fetch` and no URL/path string outside `src/api`; all calls via
  `resource()` entries; paths version-free (`/auth/...`, never `/v1/...`).
- One `<Auth>` component drives all five modes; five sterile pages compose it
  with only a `mode` (+ params).
- `react-hook-form` + zod per mode; the conventional field set present;
  `confirm-password` / `agree-to-terms` enforced.
- Access token held in memory only (`src/lib/auth/token.ts`), rehydrated via
  the httpOnly refresh cookie; nothing in `localStorage`/`sessionStorage`;
  permissions read from `api.permissions` (no second source introduced).
- Errors handled exactly per `errors.md` (422 on fields, others as specified).
- All copy localized in all four locale files; logical properties throughout.
- Design bar met with multiple passes; `pnpm lint` · `typecheck` · `build` all
  green; report includes the pass count and the `[OPERATOR INPUT]` defaults
  left unverified.

---

## Backlog (stubs — intent only, NOT READY)

Each gets a full block, specced to READY, before it is built. Do not build from
these one-liners. Order is indicative, not committed.

- **Storefront Home · BACKLOG** — the public landing: hero, featured
  collections, type-driven product rails, trust/footer chrome.
- **Catalog & Listing · BACKLOG** — browse/search/filter; virtualized product
  grid (TanStack Virtual); type-driven product cards; filters/tabs in the URL.
- **Product Detail & Purchase/Booking · BACKLOG** — one detail surface that
  adapts by product type (physical, digital, service, tour/ticket/hotel/real
  estate); the purchase or booking flow per type.
- **Cart & Checkout · BACKLOG** — cart store (ephemeral), checkout flow,
  payment hand-off, order confirmation.
- **Account & Wallet · BACKLOG** — profile, orders, wallet balances
  (pending/withdrawable), coupons, referrals/points.
- **Search & Command · BACKLOG** — cmdk command palette + global search.
- **Support & AI · BACKLOG** — live chat, tickets, AI-assisted discovery.

> When picking up a backlog item: write its block (goal, endpoints, fields,
> flows, layer placement, errors, states, design notes, acceptance), resolve
> any `[OPERATOR INPUT]`, set Status to READY, then build.
