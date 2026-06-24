# Base engine traits (the HasBaseXxx layer engine)

Build the Base engine traits that turn near-empty concrete classes into a full auto-API — one engine trait per
layer, each holding the shared behaviour the thin `BaseXxx` shells inherit: `HasBaseModel`, `HasBaseRepository`,
`HasBaseService`, `HasBaseController`, `HasBaseRequest`, `HasBaseResource`. This is the heart of the "magic": a
new resource is `migration + Model (use traits) + Repository::fields() + Service (overrides only)`, and the
engine materializes the rest from the schema + naming conventions.

## What is required
- The engine derives, for every resource that opts in: CRUD, search, statistics, keyset pagination, the uniform
  success/fail envelope, permission gating, and tenant scope — so a concrete class declares only what is unique
  to it (`fields()` + overrides).
- The read surface funnels through one uniform pipeline; the controller assembles role-driven scopes/permissions
  read from `Context` and threads them down; the repository declares the write-shape via `fields()` with
  optional boot hooks.
- **Nothing native lives in these traits**: all string/array/cache/db/number/etc. work is delegated to the
  `app/Support/*` domains — a trait never re-implements a capability a Support domain already owns. Anything
  written twice belongs lower (in the engine or Support), never duplicated into a concrete class.

## Constraints
Octane-safe (immutable boot-derived metadata may be cached in statics; per-request/tenant state never is —
it lives only in `Context`); `route:cache`-safe; UUIDv7 `string` ids in every signature; fail-closed and never
silent. Exact hand-style, `declare(strict_types=1)`, zero comments. Build only what the v1 systems need — no
speculative breadth. Tour `vsample/app/Traits/Bases/*` for intent first, then build ours cleaner/stronger —
never copied.

## Acceptance
- `HasBaseModel / Repository / Service / Controller / Request / Resource` exist and a real resource built on them
  yields a full CRUD API with **zero per-method native code** in the concrete classes.
- The same uniform read pipeline serves index / show / statistics / related; output is the uniform envelope.
- No native/infrastructure work is re-implemented in a trait that an `app/Support/*` domain already provides.
- Gate green.
