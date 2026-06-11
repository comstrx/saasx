---
description: Build a feature slice from its product spec, per the constitution
---

Build the feature "$ARGUMENTS" strictly per the constitution (AGENTS.md).

1. Read `docs/product/features/$ARGUMENTS.md`. If it does not exist,
   STOP and request the spec from the operator — do not scaffold
   anything.
2. Read `docs/guides/architecture.md`, `api.md`, `style.md`, `i18n.md`,
   plus every guide and system spec the feature's content touches.
3. If the spec's "Open questions" section is non-empty, STOP and list
   the questions instead of building.
4. If `src/api/<resource>.ts` is missing for this domain, create it
   with `resource()` plus explicit extras from the spec, and register
   it in `src/api/registry.ts`.
5. Create `src/features/$ARGUMENTS/` (flat): `use-<x>.ts` hooks over
   registry entries with `[resource, action, params]` query keys, then
   components per the spec's Components table, then `types.ts` only if
   needed.
6. Every visible string gets a message key under `"$ARGUMENTS.*"` in
   BOTH `messages/en.json` and `messages/ar.json`.
7. Guard every action with `<Need>` using the registry entry's
   permission string from the spec's Actions table.
8. Wire into `src/app/` only the pages the spec names.
9. Gates: `pnpm lint`, `pnpm typecheck` (and `pnpm build` if routing or
   config changed).
10. One commit: `feat(admin): $ARGUMENTS slice`.

Report per the constitution's reporting format, including which guides
and specs were read.
