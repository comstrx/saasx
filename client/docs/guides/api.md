# api — The Only Door to the Backend

Every byte that crosses the network crosses `src/api/`. A feature never
writes `fetch`, never builds a URL, never types an endpoint string, never
invents a permission name. It asks the registry for a resource and hands
it to a hook.

## Mental model

**The registry is a typed map of the backend; features read the map, they
never redraw it.** One object describes an endpoint — its path, method,
response schema, and the permission it needs. That same object is what the
request uses *and* what the `<Can>` guard checks, so the button a user
sees and the call it fires can never disagree. If you are assembling a URL
or repeating a permission string by hand, you are redrawing the map inline
— stop, and add the entry to the registry instead.

## Layout

```
src/api/
├── client.ts     request() — the ONLY fetch( in the codebase
├── resource.ts   resource() — conventional CRUD builder, plain and small
├── registry.ts   assembles every resource into one typed `api` tree
├── error.ts      ApiError — the single failure shape (see errors.md)
├── index.ts      barrel
└── <name>.ts     users.ts, orders.ts … one resource per file, flat
```

## resource() — convention first

`resource("users")` yields a fully typed set of CRUD entries:

```
api.users.list       GET     /users        need users.list
api.users.show       GET     /users/:id    need users.show
api.users.store      POST    /users        need users.store
api.users.update     PATCH   /users/:id    need users.update
api.users.destroy    DELETE  /users/:id    need users.destroy
```

Anything non-CRUD is declared explicitly as an extra — never inferred:

```ts
export const users = resource("users", {

    extra: {

        avatar: { path: "/users/:id/avatar", method: "POST", need: "users.update" },
        permissions: { path: "/users/:id/permissions", method: "GET", need: "users.show" },

    },

});
```

Nested-relation magic (`api.users.orders.items…`) is forbidden — that is
the line between convention and magic. A relation endpoint is an explicit
extra. `resource()` stays a function any developer reads in one pass.

## client.ts — the single transport

- Base URL from `lib/env` (`NEXT_PUBLIC_API_URL`, which **ends with `/v1`**)
  — no other URL source. Entry paths are version-free (`/auth/login`, not
  `/v1/auth/login`); the version lives in the base URL.
- Returns one envelope, `ApiResult<T> { data, meta }`; callers read `.data`.
  An entry marked `bare: true` skips the envelope (the body *is* the data).
- Zod-parses the response `data` against the entry's schema. A parse failure
  is an error, never a silent cast.
- Forwards the `AbortSignal` TanStack Query provides.
- Attaches the **in-memory access token** as `Authorization: Bearer …` for
  non-guest entries; `guest`/`bare` entries send none. The token is never
  read from `localStorage`/`sessionStorage`. Default `credentials` is
  `"omit"` (Bearer needs no cookie); an entry opts into `"include"` only if
  it must — see `auth.md`.
- On a `401` for a non-guest entry it runs the refresh once
  (`configure({ refresh })`) and retries. `api.auth.refresh` is the one entry
  that sets `credentials: "include"` — it carries the httpOnly refresh cookie
  the backend reads to mint a fresh access token; nothing else sends cookies.
  See `auth.md`.
- Normalizes every failure into `ApiError { status, code, message, fields? }`,
  the only error shape any layer above ever sees — see `errors.md`.
- Honors the backend rate limit: on `429` it respects `Retry-After`,
  retries once with backoff, then surfaces a retryable state. It never
  hammers and never hides the limit.
- Isomorphic: identical from a Server Component or the client.

## Consumption — hooks over the registry

Server data is TanStack Query, always. A feature's hook wraps a registry
entry; it never hand-types a key or a URL.

```ts
export function useUsers ( params: UserListParams ) {

    return useQuery({

        queryKey: queryKey(api.users.list, { query: params }),
        queryFn: ({ signal }) => request(api.users.list, { query: params, signal }),
        select: ( result ) => result.data,

    });

}
```

`queryKey` and `request` come from `@/api`. `select` unwraps the envelope so
the component receives the typed payload, not the `ApiResult<T>` wrapper.

- Query keys come from `queryKey(entry, options)` — the tuple
  `[resource, action, params, query]`, never a hand-written string and never
  a `.key()` method on the entry.
- Mutations invalidate by resource prefix (`["users"]`).
- `staleTime` / `retry` come from the provider defaults (`staleTime: 30s`,
  `retry: false`); a per-hook override needs a reason in the report.

## Server prefetch — sterile pages stay sterile

A page may warm the cache on the server, then hand a dehydrated state to
the client: the user sees data with no spinner, and it stays live after.
The page itself still contains no markup (see `architecture.md`).

```tsx
export default async function UsersPage () {

    const qc = getQueryClient();

    await qc.prefetchQuery({

        queryKey: queryKey(api.users.list),
        queryFn: ({ signal }) => request(api.users.list, { signal }),

    });

    return (

        <HydrationBoundary state={dehydrate(qc)}>

            <UsersTable />

        </HydrationBoundary>

    );

}
```

## You are doing it wrong if…

- You wrote `fetch(` anywhere but `client.ts` → route it through a
  registry entry.
- You built a path with string interpolation in a feature → the path
  belongs in the resource entry.
- A permission string in a guard is not the same one the request uses →
  both read the entry; make it one source.
- A query key is a hand-written array of strings, or you called `.key()` on
  an entry → derive it with `queryKey(entry, options)`.
- A response is used without a Zod schema, or cast with `as` → schema it;
  a cast is a lie the compiler can't catch.
- A component calls an `api` hook *and* renders markup → split: the hook
  fetches, the component receives via props (see `architecture.md`).

## Boundaries with neighbors

- Failure shapes, toasts, retry states → `errors.md`.
- Who may call an endpoint, permission names → `auth.md` (permissions are
  the dedicated `/auth/permissions` endpoint — the single source).
- URL/query *building* primitives (pure, no fetching) → `lib/std/net`
  (`stdlib.md`).
