# Backend — the API contract (external facts)

This file describes how the Rust API behaves, as facts the frontend
must live with. How the frontend reacts to them is law in
`docs/guides/api.md` and `docs/guides/errors.md` — do not duplicate
that here. Lines marked `[OPERATOR INPUT]` are placeholders the
operator confirms before the first data feature ships.

## Basics

- Base URL: `NEXT_PUBLIC_API_URL` (dev: `http://localhost:8000`).
- Style: REST over JSON. Resources are plural kebab-case
  (`/products`, `/product-reviews`).
- Health: `GET /health` → `{ "status": "ok" }`.
- Auth: the browser sends the Better Auth session cookie
  (`credentials: "include"`); the API verifies the derived JWT and is
  zero-trust — every request is re-authorized server-side.

## Response envelope

```jsonc
// success
{ "data": …, "meta": { … } }

// failure
{ "error": { "code": "validation_failed", "message": "…", "fields": { "name": ["required"] } } }
```

`[OPERATOR INPUT]` confirm the exact envelope once the Rust API
finalizes it; `src/api/client.ts` parses against this shape and nothing
else.

## Pagination, filtering, sorting

- `GET /products?page=1&per_page=25&sort=-created_at&q=term`
- `meta`: `{ "page": 1, "per_page": 25, "total": 412 }`
- Filters are flat query params per resource; each feature spec lists
  the filters its endpoints accept.
- `[OPERATOR INPUT]` confirm param names and the max `per_page`.

## Localized and money fields

- Localizable fields (product name, description) arrive already
  localized for the request's locale via the `Accept-Language` header;
  `[OPERATOR INPUT]` confirm header vs `?locale=` param.
- Money arrives as integer minor units plus currency:
  `{ "amount": 19900, "currency": "USD" }`. The API never sends floats
  for money. Display rules live in `system/currency.md`.

## Rate limiting

- Per-session limit: `[OPERATOR INPUT]` (assume 60 requests/minute
  until confirmed).
- Exceeding it returns `429` with a `Retry-After` header (seconds).
- Limits are per session, not per endpoint; bursts from list polling
  count.

## Error codes

| HTTP | code | meaning |
|---|---|---|
| 401 | `unauthenticated` | session missing/expired |
| 403 | `forbidden` | authenticated but not permitted |
| 404 | `not_found` | resource does not exist |
| 422 | `validation_failed` | `fields` map has per-field messages |
| 429 | `rate_limited` | `Retry-After` header present |
| 5xx | `server_error` | retryable; no details leak to the client |

## Permissions delivery

Login response and `GET /auth/permissions` return the session's flat
permission set (`["products.view", "orders.update", …]`). The catalog
of valid strings is `system/permissions.md`.
