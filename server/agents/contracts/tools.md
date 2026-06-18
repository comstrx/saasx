# contracts/tools.md — Stack, tools, libraries & the gate (LAW)

> Never assume versions or API shape from memory. **`composer.json` + `composer.lock` win** over anything
> you think you know; read them. Read `config/*` and `.env*` before claiming behaviour. Re-read every turn.

## Stack (confirmed in `composer.json`/`composer.lock` — verify, don't assume)

- **PHP `^8.5`** · **Laravel `^13.8`** · **Octane `^2.17` + FrankenPHP** · **Horizon `^5.47`** ·
  **Reverb `^1.0`** · **Sanctum `^4.3`** · Tinker.
- **PostgreSQL 16** (+ extensions) · **Redis 8** (logical DBs: default/cache/queue/horizon/reverb/session/
  rate_limit/lock).
- Mail transport: **`symfony/mailgun-mailer` + `symfony/http-client`** (Mailgun HTTP API, never SMTP).
- Dev: Larastan `^3.10`, Pail, Collision, PHPUnit `^12`, Faker, Mockery.

**Deferred (roadmap, NOT v1):** Redpanda, Rust/Actix `engine` via gRPC, Elasticsearch (→ OpenSearch at
scale). Design their abstractions now (`design.md` §6) so each is "add one file" later; do not build them.

## Subsystem tooling

- **Auth:** Sanctum, **stateless Bearer tokens everywhere** (SPA cookie mode breaks with many custom
  domains). Every token is **bound to a tenant**; middleware asserts `token.tenant == domain.tenant`. v1
  tenant resolution = subdomain + Bearer token; custom domains + FrankenPHP/Caddy on-demand TLS later.
  API prefix `/v1`.
- **Mail:** the **`mailgun` mailer** in `config/mail.php` (`transport: mailgun`, creds in
  `config/services.php → mailgun`). A `failover` chain exists (mailgun included). Send through `mailgun`
  (or `failover`). **NEVER SMTP.** Mail is **always queued** (`ShouldQueue`).
- **Storage:** one `Storage` abstraction, the **`s3` driver everywhere** — AWS S3 in production, **MinIO
  in local dev** (S3-compatible: same driver, only endpoint/creds differ). `LocalDriver` is a dev-only
  fallback. Object keys are tenant-namespaced; private by default; signed `TemporaryUrl` for downloads.
- **Realtime:** Reverb; chat events broadcast immediately (`ShouldBroadcastNow`). Contrast: mail is queued.
- **Queues:** Horizon (run as web behind a proxy). Jobs carry `tenant_id`, restore/reset tenant context.

## Libraries policy

- **Build it ourselves. No new external libraries except in extreme necessity.** Auth, RBAC, cache,
  search, payments, events, storage, idempotency, throttling are **hand-built** behind our own
  abstractions. Reuse what is already in the lockfile before reaching outward; name the conflict if a new
  dep duplicates an existing capability.
- **The only "don't roll your own" exceptions:** cryptography and money rounding/ledger primitives — use
  core / battle-tested code there (`support/security` wraps crypto; `support/num/Money` does integer
  minor-unit math only).
- Never hand-edit `composer.lock`. Never add a dependency without a concrete, reported reason.

## Autoload

- **PSR-4** `App\ → app/` for normal classes (file name = class name).
- **Classmap** for the `index.php` folder convention in `app/Support` & `app/Traits` (clean class names;
  see `naming.md`). **Run `composer dump-autoload` after adding a new support/trait file** — classmap is
  static, the class will not resolve until you do.
- Ugly FQCNs stay hidden behind the Support facades / curated helpers.

## The gate (the real judge — agentx runs `GATE_CMD`, not self-report)

- **Gate now = Larastan + `declare(strict_types=1)`.** `phpstan.neon`: **level 8**, paths `app`,
  `vsample` excluded, `missingType.iterableValue` suppressed. Command: `composer lint`
  (`vendor/bin/phpstan analyse --memory-limit=1G`).
- A change is **"done" only when the gate is green.**
- **Never** suppress errors with `@phpstan-ignore`, baselines, casts-to-widen, or `any`-style widening —
  **fix the root cause.** A green gate obtained by suppression is a contract violation.
- **NO formatter.** Pint is removed and never run (the hand-style in `style.md` is intentionally not
  PSR-12). Do not add or invoke a formatter.
- **Tests are DEFERRED until v1 ships.** Do **not** write tests now (no new test files, no TDD) unless
  explicitly asked — the skeleton still churns, test maintenance now is wasted effort. Once v1 ships,
  tests become a gate alongside Larastan and this flips.

## Ground-truth checklist (before claiming any behaviour)

1. `composer.lock` for the exact installed version of any package you touch.
2. `config/<area>.php` for how a subsystem is wired (mail, cache, queue, sanctum, filesystems…).
3. `.env` / `.env.example` / `.env.production` for environment shape (read keys, **never print secret
   values**, never commit secrets).
4. If a dependency ships docs under `vendor/*/`, read them before using an unfamiliar API.
</content>
