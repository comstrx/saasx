# 0019 — Engagements / social DNA (design-aware + one reference trait)

- Requirement: `0007-engagements-dna.md` (clears `0001-compliance-floor.md`: tenant-stamped, gated, no N+1, queued fan-out).
- Deliverable type: lib
- Order: 0017/0018 (RBAC gating `allow_*`), 0012 (`HasTenant`), 0001+0004 (`App\Support\{Cache,Event,Storage}`).

## Responsibility
Establish the social/engagement DNA pattern — one focused trait per kind over its own per-kind morph table, gated, tenant-stamped, counter-maintaining — and prove it with ONE reference trait so adding the rest later is a single file.

## Path
- `app/Traits/Dna/Social/HasSocial.php` — the facade trait that composes the common set (declared; composes only what exists).
- ONE reference trait + its morph table (executor picks the sharpest minimal demonstrator — recommend `HasLikes` over a `likes` toggle table, as it proves toggle + dual counter + gate + actor + tenant-stamp): `app/Traits/Dna/Social/HasLikes.php` + `database/migrations/*_create_likes_table.php`.
- The remaining kinds (`views, favorites, comments, replies, reviews, reports, shares, files, …`) are **declared in the facade/design, NOT pre-built** — added when a concrete system needs them.

## Public interface
- Reference trait (e.g. `HasLikes`): `likes(): MorphMany` · `like(bool $value = true): void` (toggle; `false` = dislike, mutually exclusive) · `unlike(): void` · `liked(): bool` · `likesCount(): int`.
- Pattern contract every future kind follows: a `MorphMany` over `(engageable_type, engageable_id) + tenant_id + user_id`; a gated mutator (`hasOrFail('allow_likes')`); a denormalized counter maintained atomically (`hasColumn`-guarded); actor from `App\Support\Context::userId()`.

## Invariants
- ONE morph table per kind (no single "engagements" table); each row `tenant_id`-stamped (via `HasTenant`) + actor from `Context` — cross-tenant engagement is a leak.
- Every action is gated by the RBAC ladder (`allow_*`, task 0017/0018) so a capability can be disabled per-entity/per-item.
- Counters are denormalized, maintained atomically with the morph write (guard the read-modify-write against the like-toggle race — same care as money), never recounted on read; `hasColumn`-guarded so a model without the column skips it.
- Heavy fan-out (notifications) is queued (`App\Support\Queue`); realtime is immediate — neither built here beyond the declared shape. Storage/cache/event reached only through `App\Support\*` (no raw infra).
- Build only the breadth a current system needs; the rest is declared. `declare(strict_types=1)`; exact hand-style; zero comments; ids UUIDv7 `string`.

## Gate reachability (binding — resolution is fail-closed)
`allow_likes` resolves to DENY until a catalog entry + an allowing setting exist. The demonstrator must establish the grant **within its own path** — register the `allow_likes` permission in the catalog and allow it via the RBAC write surface from task 0017 (super `force` or tenant `grant`) — BEFORE asserting a successful like. The acceptance must NOT depend on a downstream seeder. It must ALSO assert the closed case: with no grant, the gated action is refused (403/fail-closed).

## Acceptance criteria
- A model `use HasLikes;` (or the chosen reference) becomes engageable with zero per-model wiring; the concrete model stays a near-empty declaration.
- With `allow_likes` denied (no grant), the like action is refused (fail-closed). After the demonstrator grants `allow_likes` (via 0017), a like/dislike toggle is tenant-stamped, updates the counter atomically (no double-count under a repeated toggle), and the count stays consistent with the morph table; no per-row N+1.
- `HasSocial` exists and composes the available trait(s); unbuilt kinds are documented as "add one file".
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0017/0018, 0012, 0004. Last in the foundation/engine layer.
