# Feature: <name>

## Purpose

One sentence: who uses this to do what.

## Pages & routes

Which page specs mount this feature, and with what props/params.

## Data

The api registry entries consumed (`api.<resource>.<action>`), the
fields displayed, the fields editable, filters and default sort.
Anything here must exist in `system/backend.md` terms.

## Actions

One row per user action:

| action | entry | permission | success | failure |
|---|---|---|---|---|
| create product | `api.products.create` | `products.create` | toast + list refresh | per `docs/guides/errors.md` |

Permissions come from `system/permissions.md` — never new strings.

## States

What the user sees for: loading · empty · error · no-permission.
"Designed" means specified here, not improvised at build time.

## Components

| component | role | notable states |
|---|---|---|

Expand any non-obvious component below the table: its props, what it
delegates, what it never does.

## Out of scope

What this feature deliberately does NOT do (the most protective
section — it blocks scope invention).

## Open questions

Unresolved decisions. The feature is not buildable while this section
is non-empty — the agent stops and asks the operator.
