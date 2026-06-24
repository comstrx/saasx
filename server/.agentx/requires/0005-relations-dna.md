# Schema-derived relations DNA

Build the relations DNA: a model declares its relation methods once (normal Eloquent), and the engine
auto-discovers them and derives eager-loading, requested includes, and nested-relation endpoints from that map —
relations, eager-loads, and routes are **derived, not hand-written**.

## What is required
- Auto-discovery of a model's declared relations, cached as immutable boot-derived metadata (Octane-safe static),
  feeding: auto eager-load to eliminate N+1, requested includes, and deep/nested relation dispatch.
- Nested relations resolve against the model's derived relation map and **fail closed** — an unknown relation
  404s, never a silent wrong result, never a route closure (`route:cache`-safe).
- `Model::preventLazyLoading()` wired as the development tripwire.

## Constraints
Built on the Support DSL; no external relation libraries. Octane-safe (per-request state never in statics);
fail-closed and never silently wrong; no empty `catch`. UUIDv7 `string` ids. Exact hand-style,
`declare(strict_types=1)`, zero comments. Tour `vsample/app/Traits/Model/HasRelations.php` +
`HasDeepRelations.php` for intent first, then build cleaner — relation dispatch via controller actions, not
closures; never copied.

## Acceptance
- Relations, routes, and N+1-free eager-loading are derived from the schema/conventions, not hand-listed per
  endpoint.
- An unknown nested relation fails closed (404); a list endpoint issues no per-row queries.
- Gate green.
