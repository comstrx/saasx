## Auth

> First real task. Build against standard endpoints as if the backend is
> already live. No `fetch` in any feature/component, no hardcoded URL or
> path anywhere — every call goes through the `resource()` DSL in `src/api`
> (`docs/guides/api.md`). Obey the Build protocol at the top of this file.

- **Goal:** A visitor can sign in, register, recover and reset a password,
  and confirm an account/code — across email/password and social providers —
  through one cohesive, beautifully designed auth surface.

### Endpoints (standard — treat as live)

Base: `NEXT_PUBLIC_API_URL` + `/v1/auth`. Methods follow REST convention.

| entry | method | path | need |
|---|---|---|---|
| `api.auth.login` | POST | `/v1/auth/login` | — |
| `api.auth.logout` | POST | `/v1/auth/logout` | — |
| `api.auth.register` | POST | `/v1/auth/register` | — |
| `api.auth.recovery` | POST | `/v1/auth/recovery` | — |
| `api.auth.reset` | POST | `/v1/auth/reset` | — |
| `api.auth.confirm` | POST | `/v1/auth/confirm` | — |
| `api.auth.session` | GET | `/v1/auth/session` | — |
| `api.auth.socialLogin` | POST | `/v1/auth/social-login/:provider` | — |

- `:provider` ∈ `google | facebook | github | apple | telegram`.
- Define these in one `src/api/auth.ts` via `resource("auth", { extra: … })`
  — non-CRUD, so all explicit extras (no auto CRUD). Register it in
  `src/api/registry.ts`. The permission strings (none here — auth is public)
  and the request entries are the single source; nothing is typed inline.

### Fields & validation (the conventional set)

One Zod schema per mode in `features/auth/schema.ts`, consumed by
`react-hook-form` + zod resolver (locked stack). Fields:

- name · phone · email · password · confirm-password · affiliate code/name ·
  agree-to-terms (boolean, required true).
- Each mode uses the subset it needs (see modes below). `confirm-password`
  must equal `password`; `agree-to-terms` must be accepted on register.

- **Behavior (flows):**
  - **login** — email + password → on success, session is set
    (httpOnly cookie, server-side) and the user is redirected to the
    post-login route.
  - **register** — name, phone, email, password, confirm-password, affiliate
    code/name (optional), agree-to-terms → success leads to the confirm step.
  - **recovery** — email → backend sends a recovery code/link → leads to
    reset.
  - **reset** — new password + confirm (with the recovery token/code) →
    success returns to login.
  - **confirm** — a code (email or SMS) confirms the account/action; supports
    **resend** after a cooldown.
  - **social-login** — one call per provider button; success behaves like
    login.
  - `[OPERATOR INPUT]` exact post-login redirect route, code length, and
    resend cooldown — build with sensible defaults (6-digit code, 30s
    resend, redirect to `/`) and list them as unverified.

- **Layer placement:**

  | layer | what to add | path |
  |---|---|---|
  | `lib/std` | reuse `validate` (`isEmail`, `isStrongPassword`); add only if a pure helper is genuinely missing | `src/lib/std/validate` |
  | `api` | `resource("auth", { extra })` with the entries above + register it | `src/api/auth.ts`, `src/api/registry.ts` |
  | `hooks` | `use-auth` — wraps the auth mutations over TanStack (login/register/recovery/reset/confirm/social/logout), exposes status + typed submit; **general** because pages and the layout (logout) consume it | `src/hooks/use-auth.ts` |
  | `stores` | none — auth/session is **not** client state; it lives in the session cookie + TanStack cache (`docs/guides/state.md`, `auth.md`) | - |
  | `components/ui` | only via CLI if a primitive is missing (`pnpm dlx shadcn@latest add …`); do not hand-write | `src/components/ui/elements` |
  | `components/custom` | shared composites if reused elsewhere (e.g. `social-buttons`, `otp-input`) — only if genuinely cross-feature; otherwise keep them self | `src/components/custom` |
  | `features/auth` | the one feature; see anatomy below | `src/features/auth/**` |
  | `app/[locale]` | the five sterile routes composing `features/auth` with a `mode` (+ params) | `src/app/[locale]/(auth)/…` |
  | `messages` (en/ar) | every visible string + every field/validation message, namespaced `auth.*`, both files same commit | `messages/en.json`, `messages/ar.json` |
  | `tests` | deferred (mirror path reserved) — `tests/features/auth/…` | - |

### `features/auth` anatomy (exports ONE component)

    features/auth/
      components/        self parts: AuthCard, AuthHeader, fields, SocialButtons, OtpInput, TermsCheckbox
      hooks/             self hooks if any (mode-specific glue)
      schema.ts          zod schema per mode
      config.ts          per-mode meta: which fields, which providers, copy keys, redirect
      types.ts           AuthMode + form types
      index.ts           exports the single <Auth> component

- **`<Auth mode={…} />`** is the only public export. `mode ∈ login |
  register | recover | reset | confirm`. The component reads `config.ts` for
  the mode (fields shown, providers, title/cta keys) and renders the right
  form via `react-hook-form` + the mode's zod schema, calling `use-auth`.
- It is **configurable via props + meta**, overridable at the use-site
  (e.g. enabled providers, default affiliate code from a referral link).
- Pages pass the mode; the feature owns everything else.

### Pages (sterile — compose the feature)

Each route mounts `<Auth>` with its mode and nothing else (`architecture.md`,
no markup in pages):

- `/[locale]/login` → `<Auth mode="login" />`
- `/[locale]/register` → `<Auth mode="register" />`
- `/[locale]/recover` → `<Auth mode="recover" />`
- `/[locale]/reset` → `<Auth mode="reset" />` (reads token/code from params)
- `/[locale]/confirm` → `<Auth mode="confirm" />` (reads channel/code params)

- **Data:** the `api.auth.*` entries above; no fields persisted client-side
  beyond the live form; session read via `api.auth.session`.
- **Permissions:** none — auth is the public gate. After login, the rest of
  the app guards with `<Can>` (`auth.md`).

- **Error handling (per `docs/guides/errors.md`):**
  - `422 validation_failed` → map `fields` onto the form inputs (never a
    toast); messages localized under `auth.*`.
  - `401 unauthenticated` (bad credentials) → inline form error, one clear
    sentence, not a stack/code.
  - `429 rate_limited` → one calm "slow down" toast with the retry delay;
    `client.ts` owns the backoff.
  - `5xx` / network → retryable error state or toast with retry.
  - Every message: what failed + what to do next; no codes, no jargon.

- **States:** loading (submit pending → button busy, inputs locked) · empty
  (n/a — forms) · error (inline field + form-level per above) ·
  no-permission (n/a — public).

- **Design notes (per `client.md` — this is the product's face):**
  - Non-flat auth card with real depth (soft layered shadow, generous
    radius), not a bare boxed form.
  - Entrance animation; per-field focus states; buttons with designed
    hover/active/busy; social buttons crisp and consistent (2D brand icons).
  - Strong type hierarchy, clear labels, visible validation; OTP input is a
    polished segmented control.
  - Full light/dark and LTR/RTL parity; reduced-motion respected.
  - Run multiple design-critique passes before delivery — do not ship the
    first render.

- **Out of scope:** real backend wiring beyond consuming the standard
  endpoints; remember-me/device management; captcha; password-strength meter
  UI (unless trivial via existing tokens) — future tasks.

- **Acceptance:**
  - No `fetch` and no URL/path string outside `src/api`; all calls via
    `resource()` entries.
  - One `<Auth>` component drives all five modes; five sterile pages compose
    it with only a `mode` (+ params).
  - `react-hook-form` + zod per mode; the conventional field set present;
    `confirm-password`/`agree-to-terms` enforced.
  - Errors handled exactly per `errors.md` (422 on fields, others as
    specified).
  - All copy localized in both locale files; logical properties throughout.
  - Design bar met with multiple passes; `pnpm lint` · `typecheck` · `build`
    all green; report includes the pass count and the `[OPERATOR INPUT]`
    defaults left unverified.
