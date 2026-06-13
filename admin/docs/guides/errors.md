# errors — Nothing Fails Silently

Every failure becomes something the user can see and act on. Silence is
the bug.

## Mental model

**A failure is a state to render, not an exception to bury.** Every catch
faces one fork: turn the failure into a visible state (a toast, an inline
error, a field message) or rethrow it to someone who will. There is no
third branch — a catch that only logs, or swallows, is the defect this
guide exists to prevent. The transport hands you one clean shape
(`ApiError`); your job is to map it to something the user understands.

## Surfaces

- **Mutations**: failure → a sonner toast (richColors). Success → a toast
  only when the user needs confirmation of a background effect.
- **Queries**: inline states — a skeleton while pending, a designed empty
  state, a designed error state with a retry action. Never a blank region,
  never an endless spinner.
- **Route crashes**: `error.tsx` per segment plus `global-error.tsx`, both
  built from shared components, both offering `reset()`.

## The catch rule

Every `catch` either (a) converts the failure into a rendered state or
toast, or (b) rethrows. A catch that only logs is a violation. `console.*`
outside `src/lib/log` is a violation — use the logger.

## ApiError — the one shape from transport

`src/api/client.ts` normalizes every failure into
`ApiError { status, code, message }` (see `api.md`). Map by status:

- `401` → refresh the session or redirect to login (see `auth.md`).
- `403` → a permission-denied state (pairs with `<Can>`).
- `404` → a designed not-found state.
- `422` → field errors mapped onto the form, never a toast.
- `429` → one calm "slow down" message with the retry delay (`client.ts`
  already did the backoff; the user sees one message, not the retries).
- `5xx` / network → a retryable error state or a toast with retry.

## Message standard

One sentence: what failed + what to do next. No status codes, no stack
traces, no jargon, no walls of apology, no vague stubs. Localized like all
copy (see `i18n.md`); error keys live under the feature's namespace.

```
✅ "Couldn't save the user — check the form and try again."
✅ "Connection lost — retry in a moment."
❌ "Error 500"          ❌ "Something went wrong"
❌ "Operation failed"   ❌ a paragraph of apology
```

## You are doing it wrong if…

- A `catch` only calls the logger and returns → render a state or rethrow.
- You wrote `console.log` / `console.error` outside `lib/log` → use the
  logger.
- A query renders nothing while pending, or a bare spinner forever → give
  it skeleton / empty / error states.
- A `422` becomes a toast → map the field errors onto the form.
- A user-facing error shows a status code or a stack → one plain sentence,
  localized.
- You caught an error and cast or ignored it instead of mapping `ApiError`
  → map the known shape.

## Boundaries with neighbors

- How failures are produced and normalized, retry/backoff → `api.md`.
- `401`/`403` flows, sessions, permissions → `auth.md`.
- Error copy and keys in both locales → `i18n.md`.
