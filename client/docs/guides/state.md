# State — Zustand

Client state law. Server data lives in TanStack Query — never in a
store. If the backend knows it, it is server state.

## Boundaries

- Stores hold ephemeral UI state only: selections, toggles, drafts,
  wizard progress.
- No user- or request-scoped data in module-level stores — modules
  are shared between requests during SSR.
- URL beats store: filters, pagination, tabs, and search live in
  `searchParams` (architecture.md); a store is for what the URL
  cannot carry.
- Stores import `lib/` only. Components and hooks consume stores;
  stores never reach upward.

## Collections

Any list of identifiable client items goes through the factory in
`src/stores/create-collection.ts` — never hand-roll a list store:

```ts
const drafts = createCollection<Draft>("drafts");

drafts.add(draft);
drafts.update(id, patch);
drafts.use((items) => items.length);
```

- `add`/`addMany` upsert by `id`; `update` shallow-patches and
  ignores unknown ids; `get`/`all`/`find`/`has` read outside React.
- React reads through `use(selector)` — always select the narrowest
  slice.
- Change-reaction is `onChange(selector, callback)` → unsubscribe;
  it fires only when the selected slice changes. Never poll a store,
  never effect-watch whole state.
- The `name` argument is mandatory and unique — it names the store
  in devtools.

## Singles

A single-value store uses plain `create` from zustand under the same
boundaries; it earns a shared factory only at the third duplicate
shape (promotion doctrine).
