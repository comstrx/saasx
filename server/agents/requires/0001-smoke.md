# 0001 — smoke: trivial Support helper (DISPOSABLE)

A throwaway requirement to prove the agentx pipeline end-to-end: requirement → tasks (arch) →
implementation (exec) → gate → ship. **Delete this file and the file it produces after the smoke passes.**
It exists only to confirm the orchestrator, the sessions, the gate, and the `ship it` protocol work on a
real change before we point the team at the real foundations.

## Requirement

Add one tiny, self-contained Support helper following the folder convention (`arch.md` §5, `naming.md`):

- Create `app/Support/health/index.php` → `namespace App\Support; class Health` with a single method
  `public static function ping (): string` returning `'pong'`.
- Exact hand-style (`style.md`): `declare(strict_types=1)`, 4-space indent, K&R brace, a space before and
  inside `()` on the declaration, breathing body (blank line after `{` and before `}`), **zero comments**.
- Run `composer dump-autoload` so the classmap resolves the new class (`tools.md` autoload rule).

## Out of scope

No models, no migrations, no routes, no other files. No new dependency. This is a smoke test, not a system.

## Acceptance

- `App\Support\Health::ping()` returns `'pong'`.
- **Gate green:** `composer verify` exits 0.
- Nothing else in the tree is touched.
