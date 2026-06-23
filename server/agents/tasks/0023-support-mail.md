# 0023 — support/mail — Mailgun HTTP API transport (never SMTP)

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/mail/` · Facade: `App\Support\Mail` (`app/Support/mail/index.php`).
Depends on: none in Support (sends through the configured `mailgun` mailer).

## Goal
Thin wrappers over Laravel `Mail` using the **`mailgun` HTTP API transport — NEVER SMTP** (`tools.md`, `arch.md` §5).
Every delivery path is queued (`ShouldQueue` / Laravel `queue` / `later`) — no synchronous send path.

## Build
- `index.php` → `namespace App\Support; class Mail` (queue via the `mailgun`/`failover` mailer).
- Pieces (`namespace App\Support\Mail`): `Mailer` (resolve/select the `mailgun` mailer — never `smtp`), `Message`
  (subject/body/attachments builder), `Address` (from/to/reply-to value objects, validated).
- Facade `Mail` **shadows Illuminate `Mail`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
No 1:1 analog; tour `vsample/app/Helpers/*` for hand/intent, build to §5.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Transport is `mailgun` only — **never SMTP**. No synchronous send path. No concrete Mailable classes here (business/caller concern).
- Read `config/mail.php` + `config/services.php` (mailgun) before claiming wiring — never print secret values.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Mail` resolves and is callable; `composer lint` exits 0.
