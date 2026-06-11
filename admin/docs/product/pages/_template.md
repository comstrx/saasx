# Page: <name>

## Route

`/[locale]/<path>` — and any dynamic params.

## Purpose

One sentence: what a user accomplishes on this page.

## Access

The permission that gates the route (from `system/permissions.md`) and
what renders when it is missing.

## Composition

The ordered list of features this page mounts (each must have a spec in
`features/`) and the props/params passed to each. Pages compose — they
do not implement (`docs/guides/architecture.md`).

## Metadata & states

Title key (i18n), and the segment's `loading.tsx` / `error.tsx`
behavior if it differs from the defaults.

## Links

Where users arrive from and where they go next.
