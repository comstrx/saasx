# 0004 — Build the `storage` swappable adapter (s3 everywhere)

- Requirement: `0002-support-foundation.md` (clears `0001-compliance-floor.md`: tenant-namespaced, private-by-default, no secrets).
- Deliverable type: lib
- Order: 0001 (built domains green). Independent of 0002/0003.

## Responsibility
One `Storage` abstraction over the `s3` driver (MinIO dev / AWS prod) with tenant-namespaced object keys and signed temporary URLs, behind a neutral `Driver`.

## Path
- `app/Support/storage/{index.php, Driver.php, S3Driver.php, ObjectKey.php, Upload.php, TemporaryUrl.php}` — facade `App\Support\Storage`.

## Public interface
- `App\Support\Storage`:
  - `put(string $path, mixed $contents, array $options = []): string` — returns the stored object key.
  - `putFile(\Illuminate\Http\UploadedFile $file, ?string $dir = null): string` (via `Upload`/`ObjectKey`).
  - `get(string $key): ?string` · `exists(string $key): bool` · `delete(string $key): bool`.
  - `temporaryUrl(string $key, int $minutes = 5): string` (via `TemporaryUrl`).
  - `ObjectKey::for(string $path): string` — prefixes the key with the current `tenant_id`.
- `Driver`: neutral contract `S3Driver` implements; another backend = ONE new `Driver` file.

## Invariants
- Every object key is tenant-namespaced via `ObjectKey` (reads `App\Support\Context`) — private by default; downloads are signed `temporaryUrl`, never public ACLs.
- Single `s3` driver across envs — only endpoint/creds differ (config, never code); no provider named in business code.
- No secret/credential in code or logs; reads config only (no `env()` outside config).
- Octane-safe; zero business logic; `declare(strict_types=1)`; exact hand-style; zero comments; no reserved-keyword names; first-party + the configured `league/flysystem` s3 adapter Laravel already ships (no new external library).

## Acceptance criteria
- Folder exists with `index.php` facade + `Driver` interface + `S3Driver` + manager; `App\Support\Storage` resolves and is callable after `composer dump-autoload`.
- `ObjectKey::for('x.png')` yields a tenant-prefixed key; `temporaryUrl` returns a signed, expiring URL.
- No public-read default; no credential literal in any file.
- `composer verify` exits 0.

## Deliverable type
lib

## Order
After 0001.
