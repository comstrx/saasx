# Task 0005 — Build the `mail` domain (Mailgun HTTP API, always queued)

Executor: claude_1. First/only executor on this task (no prior `0005` work; the file held my finished `0004` report, now overwritten). `app/Support/mail` was empty — greenfield.

## What I implemented (4 new files)
**`app/Support/mail/`** — facade `App\Support\Mail` over the Mailgun HTTP API transport, always queued:
- `index.php` — facade: `to(string|Address ...$to): Message` (builds a `Message`, converts recipients, calls the inherited fluent `to()`); `send(Message): void` (delegates to `Mailer`).
- `Message.php` — `extends Mailable implements ShouldQueue` with `use Queueable, SerializesModels` — the typed, queued mailable; inherits the whole fluent builder (`subject/view/html/with/attach/from/to`) from Laravel's `Mailable`.
- `Mailer.php` — `send(Message)`: pins the `mailgun` mailer (`$message->mailer('mailgun')`) then `Mail::send(...)` → because `Message` is `ShouldQueue`, Laravel auto-queues it.
- `Address.php` — typed VO (`email`, `name`) with `make()` + `cast()`/`toMail()` converting to `Illuminate\Mail\Mailables\Address`.

## Config — confirmed, not duplicated (per task)
`config/mail.php` already has the `mailgun` mailer (`transport: mailgun`) and `config/services.php` has `services.mailgun` (`domain`, `secret`, `endpoint`, `scheme`) — all env-based, no secret values in code. Verified at runtime (`config('mail.mailers.mailgun.transport') === 'mailgun'`); no config edit made.

## Key decisions (the concrete WHY)
- **`Message` extends `Mailable`** rather than hand-rolling a builder — the builder vocabulary (subject/view/html/with/attach/from/to) already lives in the framework at the right altitude; re-implementing it would be duplication. Our class only declares what's unique: it's queued (`ShouldQueue` + `Queueable`) and typed. Verified `Mailable` does NOT itself use `Queueable`/`SerializesModels`, so the trait composition is clash-free (the sanctioned generated-mailable pattern — checked after task 0003's property-collision lesson).
- **Mailer pinned, not defaulted** — `$message->mailer('mailgun')` forces the transport on the mailable so the queued send uses Mailgun regardless of `MAIL_MAILER` (which defaults to `log`). No SMTP path is ever reachable from this domain (the transport is a hardcoded `'mailgun'` literal; grep confirms zero `smtp`/host references).
- **Always queued via `ShouldQueue` auto-detect** — `Mailer::send` → `Mail::send($message)`; Laravel's `Mailer::sendMailable` routes a `ShouldQueue` mailable to `queue()`. Nothing blocks the request path.
- **Tenant-stamped via Context propagation** — Laravel auto-registers `ContextServiceProvider`, which dehydrates `Context` into every queued payload and hydrates it on processing (verified in framework source). Our `App\Support\Context` stores tenant_id/role in Laravel `Context`, so the queued mailable carries and restores the tenant automatically — no extra envelope needed. (Mailable data is also captured at build time via `with()`, so rendering needs no tenant lookup in the common case.)
- **`Address` VO only at the recipient boundary** — `Mail::to` converts `string|Address` to Laravel's `Mailables\Address`; `from()` uses the inherited string form (the contract scopes `Address` to `to()`).

## Nothing kept/changed/removed from prior work
No prior `0005` code existed; added only the 4 mail files. No existing source file touched. (`composer.json`/`composer.lock` show `M` in `git status` — that is **leftover from task 0004's s3-adapter require**, not this task; this turn only ran `composer dump-autoload`/`verify`, which do not modify them.)

## Octane safety
`Mail::to`/`send` are stateless statics; `Mailer` is a stateless per-call instance. No static/singleton per-request state. ✓

## Acceptance criteria — all met (live probe)
- ✅ Folder has `index.php` facade + `Mailer`/`Message`/`Address`; `App\Support\Mail` resolves after `composer dump-autoload`.
- ✅ A built `Message` (`Mail::to('alice@…', Address::make('bob@…','Bob'))->subject()->html()->with()`) dispatched via `Mail::send` **landed on a queue** (`assertQueued` passed, `assertNothingSent` passed — not synchronous) and **targets the `mailgun` mailer** (reflected pinned `mailer === 'mailgun'`). Both string and `Address` recipients resolved. **No `smtp` path** in the domain.
- ✅ Zero business logic (transport + builder only, no email templates); `declare(strict_types=1)`; hand-style; zero comments; no reserved-keyword names; facade-shadowing respected (Illuminate `Mail` referenced fully-qualified, never `use`d alongside ours).

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors, 146 files; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Support/mail/` new for this task.

## Remaining risks
- **Live Mailgun send not exercised** — proven via `Mail::fake` (queued + mailgun pin); a real send needs `MAILGUN_DOMAIN`/`MAILGUN_SECRET` populated and a worker running. Re-confirm in an integration environment.
- **Tenant restoration depends on Laravel Context propagation** (auto-registered, verified) — if a future change disables the `ContextServiceProvider` queue hooks, queued mail would lose the tenant tag; the mailable data captured at build time is unaffected, but any tenant-scoped model touched during render would need the context. Watch when wiring real mailables.
- **Mailer is the single transport** (not a swappable `Driver`) — by design (the stack mandates one Mailgun transport); a second transport would justify the driver pattern then (rule-of-two).

ship it
