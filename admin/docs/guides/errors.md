# Errors — nothing fails silently

## Surfaces

- Mutations: failure → sonner toast (richColors); success → toast only
  when the user needs confirmation of a background effect.
- Queries: inline states — skeleton while pending, a designed empty
  state, a designed error state with a retry action. Never a blank
  region, never an infinite spinner.
- Route crashes: `error.tsx` per segment plus `global-error.tsx`; both
  styled with shared components, both offer `reset()`.

## The catch rule

Every `catch` either (a) converts the failure into a rendered state or
toast, or (b) rethrows. A catch that only logs — or swallows — is a
violation. `console.*` outside `lib/log` is a violation.

## ApiError is the only error shape from transport

`src/api/client.ts` normalizes every failure into
`ApiError { status, code, message }`, mapped by status:

- `401` → session refresh or redirect to login (auth.md)
- `403` → permission-denied state (pairs with `<Need>` guards)
- `404` → designed not-found state
- `422` → field errors mapped onto the form, not a toast
- `429` → polite "slow down" toast with the retry delay (api.md handles
  the backoff; the user only sees one calm message)
- `5xx` / network → retryable error state or toast with retry

## Message standard (user-visible copy)

One sentence: what failed + what to do next.

- No status codes, no stack traces, no jargon, no walls of text.
- No vague stubs that carry zero or multiple meanings.
- Localized like all copy (i18n.md); error keys live under their
  feature's namespace.

```
✅ "Couldn't save the user — check the form and try again."
✅ "Connection lost — retry in a moment."
❌ "Error 500"        ❌ "Something went wrong"
❌ "Operation failed" ❌ a paragraph of apology
```
