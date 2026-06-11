# API — single source of truth for every backend connection

All endpoint metadata lives in `src/api/`. Features never define
transport, never call `fetch`, never build URLs, never invent
permission strings.

## Layout

```
src/api/
├── client.ts       request() — the ONLY fetch( in the codebase
├── resource.ts     resource() builder — conventional CRUD, ~30 plain lines
├── registry.ts     assembles every resource into one typed `api` tree
└── <resource>.ts   users.ts, orders.ts, … one resource per file, flat
```

## Conventional keys (the contract between api and features)

`resource("users")` generates, fully typed:

```
api.users.list      GET     /users         need "users.view"
api.users.show      GET     /users/:id     need "users.view"
api.users.create    POST    /users         need "users.create"
api.users.update    PATCH   /users/:id     need "users.update"
api.users.destroy   DELETE  /users/:id     need "users.delete"
```

Non-CRUD endpoints are explicit and flat — never auto-generated:

```ts
export const users = resource("users", {
    extra: {
        image:       { path: "/users/:id/image", method: "POST", need: "users.update" },
        permissions: { path: "/users/:id/permissions", method: "GET", need: "users.view" },
    },
});
```

Composite access everywhere: `request(api.users.create, { body })`.
The permission string a `<Need>` guard checks and the entry the request
uses are the same object — UI and transport cannot drift.

`resource()` stays a plain function any developer reads in one pass.
Auto-generated nested relations (`api.users.orders.items…`) are
forbidden — that is the line between convention and magic. Declare
relation endpoints as explicit extras.

## client.ts duties

- Base URL from `lib/env` (`NEXT_PUBLIC_API_URL`). No other URL source.
- Zod-parses every response against the entry's schema; a parse failure
  is an error, never a cast.
- Accepts and forwards `AbortSignal` (TanStack Query provides it).
- `credentials: "include"` — sessions are httpOnly cookies (auth.md).
- Normalizes every failure into `ApiError { status, code, message }` —
  the only error shape the UI layer ever sees (errors.md).
- Honors the backend rate limit (docs/product/system/backend.md): on
  `429`, respects `Retry-After`, retries once with backoff, then
  surfaces a retryable state — never hammers, never hides it.
- Isomorphic: callable from Server Components and the client alike.

## Consumption pattern (inside features)

Hooks wrap TanStack Query over registry entries:

- `queryKey: ["users", "list", params]` — always
  `[resource, action, params]`, taken from the entry, never hand-typed
  strings.
- Mutations invalidate by resource prefix: `["users"]`.
- Query/mutation options (staleTime, retry) come from the provider
  defaults; per-hook overrides need a reason in the report.
