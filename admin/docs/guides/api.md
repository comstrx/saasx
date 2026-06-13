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
api.users.list       GET     /users        need users.view
api.users.show       GET     /users/:id    need users.view
api.users.create     POST    /users        need users.create
api.users.update     PATCH   /users/:id    need users.update
api.users.destroy    DELETE  /users/:id    need users.delete
```

Anything non-CRUD is declared explicitly as an extra — never inferred:

```ts
export const users = resource("users", {

    extra: {

        avatar: { path: "/users/:id/avatar", method: "POST", need: "users.update" },
        permissions: { path: "/users/:id/permissions", method: "GET", need: "users.view" },

    },

});
```

Nested-relation magic (`api.users.orders.items…`) is forbidden — that is
the line between convention and magic. A relation endpoint is an explicit
extra. `resource()` stays a function any developer reads in one pass.

## client.ts — the single transport

- Base URL from `lib/env` (`NEXT_PUBLIC_API_URL`) — no other URL source.
- Zod-parses every response against the entry's schema. A parse failure is
  an error, never a silent cast.
- Forwards the `AbortSignal` TanStack Query provides.
- Sends the session cookie (`credentials: "include"`) — see `auth.md`.
- Normalizes every failure into `ApiError { status, code, message }`, the
  only error shape any layer above ever sees — see `errors.md`.
- Honors the backend rate limit: on `429` it respects `Retry-After`,
  retries once with backoff, then surfaces a retryable state. It never
  hammers and never hides the limit — see `../product/system/backend.md`.
- Isomorphic: identical from a Server Component or the client.

## Consumption — hooks over the registry

Server data is TanStack Query, always. A feature's hook wraps a registry
entry; it never hand-types a key or a URL.

```ts
export function useUsers ( params: UserListParams ) {

    return useQuery({

        queryKey: api.users.list.key(params),
        queryFn: ({ signal }) => request(api.users.list, { params, signal }),

    });

}
```

- Query keys are derived from the entry: `[resource, action, params]`,
  never a hand-written string.
- Mutations invalidate by resource prefix (`["users"]`).
- `staleTime` / `retry` come from the provider defaults; a per-hook
  override needs a reason in the report.

## Server prefetch — sterile pages stay sterile

A page may warm the cache on the server, then hand a dehydrated state to
the client: the user sees data with no spinner, and it stays live after.
The page itself still contains no markup (see `architecture.md`).

```tsx
export default async function UsersPage () {

    const qc = getQueryClient();

    await qc.prefetchQuery({

        queryKey: api.users.list.key({}),
        queryFn: ({ signal }) => request(api.users.list, { params: {}, signal }),

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
- A query key is a hand-written array of strings → derive it from the
  entry.
- A response is used without a Zod schema, or cast with `as` → schema it;
  a cast is a lie the compiler can't catch.
- A component calls an `api` hook *and* renders markup → split: the hook
  fetches, the component receives via props (see `architecture.md`).

## Boundaries with neighbors

- Failure shapes, toasts, retry states → `errors.md`.
- Who may call an endpoint, permission names → `auth.md` and
  `../product/system/permissions.md`.
- URL/query *building* primitives (pure, no fetching) → `lib/std/net`
  (`stdlib.md`).
