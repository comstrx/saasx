# 0011 — support/context — Octane-safe role/tenant/super tag

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/context/` · Facade: `App\Support\Context` (`app/Support/context/index.php`).
Depends on: none. **Foundational — must precede database/Rls, queue/Tenant, request/Tenant, cache/Scope, storage keys.**

## Goal
The **single source of truth** for the active panel role + `tenant_id` + super flag, an Octane-safe wrapper over
Laravel `Context` (request-scoped). **No singletons/statics/globals for per-request state** — `vsample`'s
`user_role()`/`user_id()` globals are the anti-pattern, do not port (`arch.md` §6, `tolerance.md` sacred).

## Build
- `index.php` → `namespace App\Support; class Context` — the **only** accessor, exact surface (`arch.md` §6):
  `tenantId(): ?string` (null for super), `role(): string`, `panel(): string`
  (super|admin|vendor|affiliate|delivery|client|guest), `isSuper(): bool`, `userId(): ?string`,
  `set(panel, role, tenantId, userId): void` (writer — middleware only), `forget(): void` (reset on Octane RequestTerminated).
- Pieces (`namespace App\Support\Context`): `Tenant`, `Panel`, `User`, `Scope`, `Meta` — typed sub-readers backing the
  facade, all reading from Laravel `Context`, never from a static/global.
- Facade `Context` **shadows Illuminate/Laravel `Context`** — never alias-import both in one file; fully-qualify the framework one.

## Tour first (intent only — vsample.md)
`vsample/app/Helpers/Public.php` (`user_role`/`user_id` style globals) — **reject the approach**; build the `Context` tag.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Read everywhere, **written only by middleware** (`set`). Octane-safe: no per-request state outside Laravel `Context`.
- No middleware/business wiring here (out of scope) — only the Support accessor + its readers.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Context` resolves and is callable with the §6 surface; `composer lint` exits 0.
