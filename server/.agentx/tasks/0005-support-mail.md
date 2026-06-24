# 0005 — Build the `mail` domain (Mailgun HTTP API, always queued)

- Requirement: `0002-support-foundation.md` (clears `0001-compliance-floor.md`: heavy/external work queued, no secrets).
- Deliverable type: lib
- Order: 0001 (built domains green). Independent of 0002–0004.

## Responsibility
A single `Mail` facade that sends through the Mailgun HTTP API transport, always queued — never SMTP, never inline on the request path.

## Path
- `app/Support/mail/{index.php, Mailer.php, Message.php, Address.php}` — facade `App\Support\Mail`.
- Confirm wiring only (do not duplicate): `config/mail.php` mailer `mailgun` (`transport: mailgun`) and `config/services.php` mailgun creds keys exist; if absent, add config (keys only, no secret values).

## Public interface
- `App\Support\Mail`:
  - `send(Message $message): void` — enqueues delivery (`ShouldQueue`) via the mailgun mailer.
  - `to(string|Address ...$to): Message` / `Message` builder: `subject()`, `view()`, `with()`, `attach()`, `from()`.
  - `Address`: a typed value object (`email`, `name`).

## Invariants
- Transport is the Mailgun **HTTP API** (`symfony/mailgun-mailer` + `symfony/http-client`, already in the lockfile) — **never SMTP**.
- Every send is queued (`ShouldQueue`); nothing blocks the request path. The queued mailable is tenant-stamped (uses `App\Support\Queue`/`Context`).
- No credential or recipient PII reaches logs; reads creds from config only.
- Zero business logic (no domain email templates here — only the transport/builder); `declare(strict_types=1)`; exact hand-style; zero comments; facade-shadowing respected (our `Mail` vs Illuminate `Mail`).

## Acceptance criteria
- Folder exists with `index.php` facade + `Mailer`/`Message`/`Address` pieces; `App\Support\Mail` resolves and is callable after `composer dump-autoload`.
- A built `Message` dispatched via `Mail::send` lands on a queue (not sent synchronously) and targets the `mailgun` mailer; no `smtp` path reachable.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0001.
