# Task 0004 — Build the `storage` swappable adapter (s3 everywhere)

Executor: claude_1. First/only executor on this task (no prior `0004` work; the file held my finished `0003` report, now overwritten). `app/Support/storage` was empty — greenfield.

## What I implemented (6 new files)
**`app/Support/storage/`** — facade `App\Support\Storage` over the s3 driver, tenant-namespaced keys, signed URLs:
- `index.php` — manager: `put / putFile / get / exists / delete / temporaryUrl` over a lazy `static ?Driver`.
- `Driver.php` — neutral contract (`put/get/exists/delete/temporaryUrl`); another backend = one new Driver file.
- `S3Driver.php` — default: targets the cloud disk (`config('filesystems.cloud', 's3')`) via `FilesystemAdapter`; **forces `visibility => private`** on every write; validates contents type and fails loud on garbage.
- `ObjectKey.php` — `for()/in()` prefix every key with `tenants/<tenant_id|platform>/` (reads `App\Support\Context`); normalizes the path (`File::normalize`) so `..` can never escape the prefix.
- `Upload.php` — `key()` for an `UploadedFile`: sanitizes the untrusted client name (`File::sanitize`) + adds entropy (`File::unique`) + tenant/dir prefix.
- `TemporaryUrl.php` — `for()` converts minutes → expiry (`App\Support\Date`) and delegates to the driver's presigned URL.

## Key decisions (the concrete WHY)
- **Cloud disk is config-driven, default `s3`** (`config('filesystems.cloud', 's3')`) — honors "s3 everywhere, only endpoint/creds differ via config" and lets dev point at MinIO with zero code change. No `env()` in code (config only).
- **Private forced, not defaulted** — `options()` merges `['visibility' => 'private']` LAST so a caller cannot flip an object to public; downloads are signed `temporaryUrl` only. Fail-closed, no public ACL.
- **Tenant isolation on write via the unconditional `tenants/<tenant>/` prefix** — the caller never controls the prefix, so every stored object lands in the current tenant's namespace. Reads take the already-namespaced key (callers obtain keys only from tenant-scoped rows, e.g. the `files` table under `HasTenant`); I did not add a read-time prefix guard because it would break `super` cross-tenant reads and the model layer already scopes which keys a tenant can reference.
- **`mixed $contents` kept (frozen signature) + a boundary type-guard** in `S3Driver::put`: validates `string|resource|StreamInterface|File|UploadedFile` and throws `InvalidArgumentException` otherwise — keeps the public surface flexible, satisfies the adapter's typed union (gate-clean), and validates untrusted input.
- **`disk()` typed `FilesystemAdapter`** — Larastan infers `Storage::disk()` as `FilesystemAdapter` (has `temporaryUrl`, absent from the `Filesystem`/`Cloud` contracts), so the call chain is gate-clean with no narrowing needed (an initial `instanceof` guard was provably redundant and removed — not a suppression, the type is genuinely correct).

## Deviation — installed the s3 adapter (concrete, reported reason)
The task assumes "the configured `league/flysystem-aws-s3-v3` adapter Laravel already ships" — but it was **not installed** (only a `suggest` entry in the lock; `vendor/league/flysystem-aws-s3-v3` absent, class load failed at runtime). The s3 driver mandated by the stack ("s3 everywhere") and named by this task is non-functional without it, so I ran `composer require league/flysystem-aws-s3-v3:"^3.0"` (tool-managed, not hand-editing the lock). This pulled the standard s3 stack: `aws/aws-sdk-php`, `aws/aws-crt-php`, `league/flysystem-aws-s3-v3`, `mtdowling/jmespath.php`, `symfony/filesystem`. This is the only path to satisfy the `temporaryUrl` acceptance criterion; it is the standard, architecture-mandated adapter (not a general-purpose domain library), and it is trivially reversible (`composer remove`). Flagging for the manager's awareness.

## Bug/issue fixed mid-build
PHPStan flagged an `instanceof FilesystemAdapter` guard as "always true" (Larastan already types `disk()` as `FilesystemAdapter`). Removed the dead guard — the type is correct without it; no suppression.

## Nothing kept/changed/removed from prior work
No prior `0004` code existed; added only the 6 storage files + the dependency. No existing source file touched (only `composer.json`/`composer.lock` via `composer require`).

## Octane safety
`static ?Driver $driver` holds a stateless `S3Driver` (builds the disk per call, reads config/Context fresh). No per-request/tenant state in statics. ✓

## Acceptance criteria — all met (live probe)
- ✅ Folder has `index.php` facade + `Driver` interface + `S3Driver` + manager; `App\Support\Storage` resolves after `composer dump-autoload`.
- ✅ `ObjectKey::for('x.png')` → `tenants/<tenant_id>/x.png`; `../../etc/passwd` stays under the tenant prefix with no `..`. **put/get/exists/delete round-trip** (content `hello-tenant-A` round-tripped; missing → null; delete → exists false). **`putFile`** → `tenants/<t>/avatars/photo-<entropy>.png` (tenant-prefixed, keeps extension, stored). Bad contents type → `InvalidArgumentException`.
- ✅ **`temporaryUrl` returns a signed, expiring URL** — presigned (`X-Amz-Signature=`), `X-Amz-Expires=300` (5 min), targets the tenant key.
- ✅ **No public-read default** (visibility forced private); **no credential literal** in any storage file; no `env()` outside config (grep-verified).
- ✅ Zero business logic; `declare(strict_types=1)`; hand-style; zero comments; no reserved-keyword names; no facade-shadow clash (Illuminate `Storage` referenced fully-qualified, never `use`d alongside ours).

## Gate
`composer verify` → **exit 0** (`composer validate --strict` passed with the new require; phpstan level 8 → No errors, 142 files; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Support/storage/` (new) + `composer.json`/`composer.lock` (the require) for this task.

## Remaining risks
- **Pre-existing dependency CVEs (NOT introduced here):** `composer audit` flags 3 medium advisories in `guzzlehttp/guzzle` + `guzzlehttp/psr7` — these were already in the lock (Laravel HTTP client transitive deps), confirmed via `git diff composer.lock` (guzzle not newly added). Recommend a project-wide `composer update guzzlehttp/guzzle guzzlehttp/psr7` to patched versions — out of scope for a storage task, flagged for dep-hygiene follow-up.
- **aws-sdk-php footprint:** the s3 stack is sizable but is the mandated, standard adapter for s3 — unavoidable given the architecture.
- **Read-time isolation** relies on keys coming from tenant-scoped rows (no prefix guard on `get/delete/temporaryUrl`); correct for the `files`/`HasTenant` model but worth a note when wiring the file morph table.
- **Runtime CRUD/temporaryUrl** proven via `Storage::fake` + the real AWS signer with injected test creds (MinIO not running, dev `.env` creds empty); a live MinIO/S3 round-trip should be re-confirmed in an integration environment.

ship it
