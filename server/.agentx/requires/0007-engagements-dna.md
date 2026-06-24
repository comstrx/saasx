# Engagements / social DNA (design-aware)

Design and lay the engagements DNA: the one-line social traits (likes / dislikes / views / comments / replies /
reviews / favorites / reports / shares / files / …) that any model gains by `use`-ing a trait, each backed by a
per-kind polymorphic morph table and gated by the permission ladder. **Design-aware now** — declare the
abstraction so adding/wiring a capability later is trivial; wire concretely as v1 systems actually need them.

## What is required
- One focused trait per capability over its own morph table (one table per engagement kind — there is no single
  "engagements" table), each row carrying `tenant_id` + the actor, indexed for the hot polymorphic lookup.
- Each action is gated by the RBAC ladder (`allow_*`) so a capability can be disabled per-entity or per-item;
  hot aggregates are denormalized counters maintained atomically with the morph write, never recounted on read.
- The actor comes from `Context`; every engagement row is tenant-stamped (cross-tenant engagement is a leak).
  Heavy fan-out (notifications) is queued; realtime broadcast is immediate.

## Constraints
Built on the Support DSL (storage/cache/event) — no raw infra in business code. Octane-safe; tenant-stamped;
concurrency-safe counter writes. Build only the breadth a current system needs — the rest is declared, not
pre-built. Exact hand-style, `declare(strict_types=1)`, zero comments. Tour `vsample/app/Traits/*` for intent
first, then build cleaner/stronger — never copied.

## Acceptance
- The social DNA is declared so a model becomes engageable by `use`-ing a trait, with zero per-model wiring; the
  concrete model stays a near-empty declaration.
- Every engagement is tenant-stamped, gated by `allow_*`, and free of per-row N+1; counters stay consistent with
  the morph table.
- Gate green.
