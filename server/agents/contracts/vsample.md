# contracts/vsample.md — Using the old `vsample` project (LAW)

> `server/vsample/` is the owner's **old** Laravel project (~1.5 years old). It is a **reference for
> INTENT and IDEAS only** — never copied, never the implementation, **never deleted**. It is excluded from
> the gate (`phpstan` `excludePaths: vsample`). Re-read this before building any system.

## What it is, and is not

- It **is**: a window into how the owner thinks about SaaS systems, the "magic" he wants, his naming
  instincts, and how the same system was wired before. A confidence-builder and an idea source.
- It is **not**: a sacred pattern, a copy-paste source, or production-grade. It was documentation of an
  idea for a small client — a **lower level** than what we build now. We build an enterprise,
  product-base company codebase: **fresher, stronger, safer, cleaner.**

## The discipline (mandatory)

1. **Tour `vsample` first** for the system you are about to build. Trace its footprints across
   `app/Models`, `app/Traits`, `app/Services`, `app/Repositories`, `routes`, `database/migrations` — see
   how the magic was wired and the approach taken.
2. **Extract intent, not code.** Understand *why* it did a thing; then design ours from scratch to the
   contracts (`arch.md`, `design.md`, `style.md`, `naming.md`). No line is copied verbatim.
3. **Go back and forth.** Keep returning to `vsample` throughout a system — it surfaces ideas you'd miss
   and restores confidence in the automation. But every decision is re-derived against our contracts.
4. **Reject its weaknesses on purpose.** Where `vsample` is weaker than our contracts, ours wins — always.

## What to LEARN from it (the magic, intent only)

- **The Base engine** — `app/Traits/Bases/HasBaseRepository`, `HasBaseController`, `HasBaseService`, … and
  the thin shells in `app/Repositories/BaseRepository.php` etc. This is the source of the `BaseXxx`
  pattern. Ours mirrors the *concept*, rebuilt to `arch.md` §3.
- **The unified controller across roles** — `app/Http/Controllers/Controller.php` + `HasBaseController`'s
  `defaultScopes()` / `defaultPermissions()` keyed by `user_role()`. This is the intent behind our
  `Context` role/tenant tag (`arch.md` §6) — but we use `Context`, **never** `user_role()` globals or
  per-request statics.
- **The admin route generator** — `routes/apis/admin.php` builds the full resource action set + nested
  `{related}` endpoints + `has:<permission>` middleware. **Intent: write the action set once, apply
  everywhere.** Ours keeps that intent but is **explicit, reusable, and `route:cache`-safe** — NOT the
  `glob(...)`/reflection auto-registration and route closures `vsample` uses (`arch.md` §8).
- **Relations magic** — `app/Traits/Model/HasRelations.php`, `HasDeepRelations.php`: schema-derived and
  deep relations, the `related…`/`showRelated…` dispatch. Intent: relations and nested-relation endpoints
  derived from the model. Rebuild cleaner; drop external relation libs unless extreme necessity
  (`tools.md`).
- **Permissions** — `app/Traits/Model/Permissions/*`: hand-rolled RBAC + special per-record permissions.
  Ours is hand-built too, cleaner/stronger/safer — **never trust client-supplied permissions**.
- **Helpers/DSL** — `app/Helpers/*` (`Response`, `Cache`, `Request`, `Api`, `Public`). These map to our
  **`app/Support/*`** native layer, but split properly into the 24-domain map (`arch.md` §5) and
  **reimplemented stronger with stronger names**, SaaS-scoped (only what this project needs).

## Hard NOs carried over from the contracts

- The response shape differs: `vsample`'s flat `Helpers/Response.php` is replaced by our uniform
  `{status, data|message, errors}` envelope (`arch.md` §7). Do **not** port the old shape.
- IDs are **UUIDv7 strings**, not `int` — do not copy `int $id` signatures from `vsample`.
- `tenant_id`, fail-closed scope, and RLS are ours — `vsample` is single-context; do not assume its
  tenancy model.
- No route closures, no `glob()` route registration, no per-request statics/globals — even though
  `vsample` does all three.

**Before writing any `support/` or `trait/` file:** tour `vsample`'s `app/Helpers/*` + `app/Traits/*`
first, then implement ours stronger, with stronger names, building only what the current system needs.
</content>
