# 0009 — support/log — structured logging with secret redaction

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/log/` · Facade: `App\Support\Log` (`app/Support/log/index.php`).
Depends on: 0008-support-security (optional, for hashing redacted identifiers); 0001-support-arr (context merge).

## Goal
Structured logging over Laravel `Log` with **`Redact` — never log secrets** (`tolerance.md`, `arch.md` §5).
Contextual fields, channel selection, a uniform log entry shape. Zero business logic.

## Build
- `index.php` → `namespace App\Support; class Log`.
- Pieces (`namespace App\Support\Log`): `Context` (attach request/tenant context fields — note: distinct namespace
  `App\Support\Log\Context`, not the `App\Support\Context` tag), `Channel` (resolve/select a log channel), `Entry`
  (build a structured record: level/message/context), `Redact` (mask known-sensitive keys — token/password/secret/
  authorization/card — before write; never emit raw secret values).
- Facade `Log` **shadows Illuminate `Log`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
No 1:1 analog; tour `vsample/app/Helpers/*` for hand/intent, build to §5.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- `Redact` is mandatory on the write path; no secret ever reaches the log. No silent error-swallowing.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Log` resolves and is callable; `composer lint` exits 0.
