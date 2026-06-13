# state — Client State (Zustand)

The client-state law. If the backend knows it, it is **not** client state —
it lives in TanStack Query (see `api.md`). A store holds only what the
server never will.

## Mental model

**A store is a scratchpad for the UI, not a cache for the server.** Ask:
*would this value survive a reload by being fetched again?* If yes, it is
server state and belongs in TanStack Query. If it exists only because the
user is mid-interaction — a selection, a toggle, a draft, a wizard step —
it is ephemeral, and only then is it a store. And before reaching for a
store at all, ask whether the URL should carry it: a filter or a tab is
shareable state, and the URL beats the store.

## Boundaries

- Stores hold ephemeral UI only: selections, toggles, drafts, wizard
  progress.
- Server data never enters a store — it stays in TanStack Query.
- No user- or request-scoped data in a module-level store: modules are
  shared across requests during SSR, so one request's data would bleed
  into another's.
- URL beats store: filters, pagination, tabs, and search live in
  `searchParams` (see `architecture.md`). A store is for what the URL
  cannot carry.
- Stores import `lib/` only. Hooks and components read stores; a store
  never reaches upward.

## The factory — never hand-roll a store

Every store is built through `src/stores/create-store.ts` — never `create`
from zustand directly. A list of identifiable items uses its collection
shape; a single value uses its single shape; both go through the factory.

```ts
const drafts = createStore<Draft>("drafts");

drafts.add(draft);
drafts.update(id, { title });
drafts.use(( items ) => items.length);
```

- `add` / `addMany` upsert by `id`; `update` shallow-patches and ignores
  unknown ids; `get` / `all` / `find` / `has` read outside React.
- In React, read through `use(selector)` and select the narrowest slice —
  never the whole state.
- React to change with `onChange(selector, cb)` → returns an unsubscribe;
  it fires only when the selected slice changes. Never poll a store, never
  effect-watch the whole state.
- The `name` is mandatory and unique — it labels the store in devtools.

## You are doing it wrong if…

- A value the API returns sits in a store → it is server state; move it to
  TanStack Query.
- A filter, tab, or page number lives in a store → it belongs in the URL.
- A module-level store holds the current user or anything request-scoped →
  SSR will leak it across requests.
- You wrote `create` from zustand directly → use the factory.
- A component selects the whole store to read one field → select the
  narrow slice, or it re-renders on every change.
- A store imports a hook, component, or feature → stores import `lib/`
  only.

## Boundaries with neighbors

- Server data, caching, invalidation → `api.md`.
- Filters/tabs in the URL, the layer rules → `architecture.md`.
- Surfacing async results and failures in the UI → `errors.md`.
