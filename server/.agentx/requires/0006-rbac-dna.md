# Hand-rolled RBAC DNA

Build the RBAC DNA: hand-rolled, server-authoritative authorization — roles + permissions + per-record special
permissions — that a model/actor gains by `use`-ing the trait. Not a third-party package and not a flat
role→permission map.

## What is required
- Roles are many-to-many; the panel route group declares the expected role and middleware verifies membership
  (multi-role users supported).
- Permission resolution is **fail-closed**: a missing rule is never "allowed"; access is gated server-side via
  `has:<permission>` middleware. Per-record / special permissions are supported in addition to role grants.
- **Never trust client-supplied permissions** — authority and identity are read from `Context`, never from the
  request body.
- Built on the Support DSL and cache (tenant-scoped, tag-invalidated) so resolution stays hot without N+1
  per-row resolution.

## Constraints
Hand-built, cleaner/stronger/safer than the reference. Tenant-scoped and Octane-safe. Both the gate middleware
and role middleware are `route:cache`-safe (string middleware, no closures). Exact hand-style,
`declare(strict_types=1)`, zero comments. Tour `vsample/app/Traits/Model/Permissions/*` for intent first, then
build stronger — never copied.

## Acceptance
- Authorization is server-authoritative and fail-closed; client-supplied roles/permissions are never trusted.
- CRUD permissions derive from the resource name; `has:<permission>` gates access at the edge.
- Gate green.
