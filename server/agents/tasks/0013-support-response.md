# 0013 — support/response — uniform JSON envelope (rebuild to §7)

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/response/` · Facade: `App\Support\Response` (`app/Support/response/index.php`).
Depends on: 0001-support-arr (shaping). It was just removed — **rebuild it here to the `arch.md` §7 shape**.

## Goal
The **one** uniform API envelope (`arch.md` §7) — do not invent a second, do **not** port `vsample`'s flat shape.
- success → `{ status: true, data, …extra }`
- fail → `{ status: false, message, errors }`

## Build
- `index.php` → `namespace App\Support; class Response` with exactly:
  `success($data, $status, $extra)` · `message($text)` · `fail($errors, $status, $msg)` · `error($key, $msg, $status)` · `noContent()`.
- Pieces (`namespace App\Support\Response`): `Envelope` (assemble success body), `Failure` (assemble fail body),
  `Pagination` (paginator → meta block, keyset-aware), `Meta` (extra/meta merge).
- Facade `Response` **shadows Illuminate `Response`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
`vsample/app/Helpers/Response.php` for intent — **reject its flat `{status,errors}` shape**; build our §7 envelope.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Exactly one envelope shape; no business logic (no model/resource coupling — that is `BaseResource`, a later layer).
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Response` resolves and the five methods are callable producing the §7 shape; `composer lint` exits 0.
