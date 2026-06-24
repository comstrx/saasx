# Task 0019 — Engagements / social DNA (`HasSocial` + reference `HasLikes`)

Fresh build (no prior 0019 executor report). Establishes the per-kind social DNA pattern and proves it
with the `HasLikes` reference over a `likes` morph table: gated, tenant-stamped, atomic dual counter.

## Implemented
- `app/Traits/Dna/Social/HasLikes.php` — the reference trait. `likes(): MorphMany<Like,$this>` ·
  `like(bool $value = true)` (toggle; `true`=like, `false`=dislike, mutually exclusive) · `unlike()` ·
  `liked(): bool` · `likesCount(): int` · `dislikesCount(): int`. Composes `HasPermissions` so the
  model is self-sufficiently gated (`use HasLikes;` alone is engageable **and** governed).
- `app/Traits/Dna/Social/HasSocial.php` — the facade trait; composes only what exists (`use HasLikes;`).
- `app/Models/Like.php` — the per-kind morph model (`TenantModel`, `value:boolean`).
- `database/migrations/2026_01_03_000001_create_likes_table.php` — ONE table per kind:
  `uuidMorphs('engageable')` (hot index) + `tenant_id` + `user_id` + `value`,
  `unique(engageable_type, engageable_id, user_id, tenant_id)` (the toggle/race backstop), plus
  pgsql-guarded RLS mirroring the other tenant tables.
- `app/Models/User.php` — mounted `use HasSocial;` (see WHY below).
- `tests/Feature/SocialLikesDnaTest.php` — 4 cases (binding gate-reachability satisfied).

## Key decisions / WHY
- **Gate via `$this->hasOrFail('allow_likes')` (HasLikes composes `HasPermissions`).** An engageable
  model IS a governable model (0017): the gate resolves with `$this` as the item target, so
  `allow_likes` can be disabled per-entity/per-item through the same cascade. Chosen over loading the
  actor and calling `$actor->hasOrFail('allow_likes', $this)` because it needs no per-like actor
  PK-load, matches the contract's 1-arg `hasOrFail('allow_likes')`, and reuses the 0017 governable
  surface (an engageable can `grant/revoke('allow_likes','item')` on itself) instead of re-deriving
  the 0018 actor-load pattern a third time.
- **Atomic, race-guarded counter ("same care as money").** `toggleReaction` runs in
  `Database::transaction`, `lockForUpdate`s the actor's reaction row, computes the delta
  (none→set, same→idempotent no-op, flip→swap), and adjusts counters with a **base-builder**
  `increment`/`decrement` (`->toBase()`, atomic, and deliberately NOT bumping the engageable's
  `updated_at`). The `unique(engageable, user, tenant)` constraint is the hard backstop for the one
  unlockable window (concurrent first-insert): a lost insert throws
  `UniqueConstraintViolationException`, caught once in `react()` and retried — the retry now locks the
  existing row and reconciles, so the counter can never double-count. In-memory counter is synced
  after the atomic write so `likesCount()` is correct post-mutation **without** a re-read (denormalized,
  never recounted).
- **`hasColumn`-guarded counters.** `adjustCounter`/`reactionCount` consult `Database::hasColumn`; a
  model without `likes_count`/`dislikes_count` skips counter maintenance and `likesCount()` falls back
  to a morph `count()` — proven on `User` (no counter columns) in the test.
- **`User use HasSocial;` — the app/ consumer.** phpstan analyses `app/` only and flags `trait.unused`
  for any trait with no concrete consumer (every trait here is bound through a class — `HasTenant`→
  `TenantModel`, `HasPermissions`→`User`, …). The reference trait needs a real consumer. I **reused
  the existing `User`** rather than invent a speculative domain model (which would either pollute the
  production schema with a demo table or ship a table-less model) — consistent with the requirement
  ("*any* model gains social by `use`-ing a trait") and the "reuse what's there / no speculative
  abstraction" bar. It doubles as the acceptance proof (one-line mount = zero wiring) and exercises the
  counter-guard fallback. Adding `tests/` to the gate was rejected: it changes the gate policy for all
  tests and drags in 3 pre-existing errors in other tasks' files. **This is the one call worth a
  manager ruling** — swapping `User` for a dedicated reference model is a one-line change if preferred.

## Kept / removed
- Kept all upstream DNA/resolver/middleware untouched; the social traits are thin declarations over
  them (`hasOrFail` from 0017, `HasTenant` stamping from 0012, `Database`/`Cache` from Support).
- Removed nothing.

## Unbuilt kinds (declared, not pre-built — add one file each)
`views, favorites, comments, replies, reviews, reports, shares, files, …`: each = a `HasXxx` trait
(copy `HasLikes`: `MorphMany` over its own morph table, `hasOrFail('allow_xxx')`, `Context` actor,
`HasTenant` stamp, `hasColumn`-guarded counter) + its `*_create_xxx_table` migration + one line in
`HasSocial`. Heavy fan-out (notifications) is the declared `App\Support\Queue::dispatch` shape — not
built here, per the task.

## Acceptance criteria — met
- `use HasSocial;` (or `HasLikes`) makes a model engageable with zero per-model wiring; concrete model
  stays a near-empty declaration (`User` mount; `LikeableWidget` fixture).
- Fail-closed with no grant → like refused (`test_a_like_is_fail_closed_until_allow_likes_is_granted`).
- After granting `allow_likes` via the 0017 write surface (`$actor->grant('allow_likes','tenant')`),
  like/dislike toggles, is tenant-stamped, counts atomically with no double-count on a repeated toggle,
  and stays consistent with the morph table; no per-row N+1
  (`test_a_granted_like_toggles_tenant_stamps_and_counts_atomically`,
  `test_a_fresh_read_reflects_the_persisted_counter_without_recount`).
- `HasSocial` exists and composes the available trait (`HasLikes`); unbuilt kinds documented above.
- Catalog registration + grant happen **within the test's own path** (binding gate-reachability).

## Gate
- `composer verify` → exit 0 (phpstan level 8, **No errors**; `route:cache` boot+clear ✓).
- `php artisan test` → **31 passed, 1 skipped** (skip = Postgres-only RLS on sqlite). 4 new social
  tests green; no regression.

## Risks / carry-forward
- **`User` as the trait consumer** (above) — the call to surface for a manager ruling.
- **Concurrency path is reasoned, not runtime-tested.** sqlite ignores `lockForUpdate`; the
  unique-violation retry + row lock are exercised logically and the unique index enforces integrity,
  but true concurrent interleaving isn't reproducible in PHPUnit. Correct under Postgres (prod).
- `likes()` is auto-discovered by `HasRelations` as an includable relation on any engageable model —
  intended (it's a real relation); per-include authorization remains the resolver/controller's job.
- Counters never underflow: `decrement` only fires when a prior reaction existed (count ≥ 1).

ship it
