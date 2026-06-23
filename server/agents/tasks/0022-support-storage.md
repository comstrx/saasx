# 0022 — support/storage † — object storage (s3 everywhere)

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/storage/` · Facade: `App\Support\Storage` (`app/Support/storage/index.php`).
Depends on: 0011-support-context (tenant-namespaced keys), 0006-support-file (path/name/mime helpers). **† swappable adapter.**

## Goal
One `Storage` abstraction, **`s3` driver everywhere** (AWS prod / MinIO dev — same driver, only endpoint/creds differ;
`tools.md`). Tenant-namespaced object keys, **private by default**, signed `TemporaryUrl` for downloads (`arch.md` §5/§10).
`LocalDriver` is a dev-only fallback. Swappable: add a backend = ONE Driver file.

## Build
- `index.php` → `namespace App\Support; class Storage` (manager/facade): put/get/exists/delete/temporaryUrl/visibility.
- Pieces (`namespace App\Support\Storage`): `Driver` (interface), `S3Driver` (primary — over Laravel `s3` filesystem),
  `LocalDriver` (dev fallback), `ObjectKey` (tenant-namespaced key building via `Context`), `Upload` (validated put),
  `Visibility` (private default / public toggle), `TemporaryUrl` (signed, time-bounded download URL).
- Keep the neutral `Driver` interface; `s3` is the real backend, Local is fallback only.
- Facade `Storage` **shadows Illuminate `Storage`** — never alias-import both in one file.

## Tour first (intent only — vsample.md)
`vsample/app/Traits/Model/HasFileStorage.php` for storage intent — build ours stronger, tenant-namespaced, signed URLs.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Tenant-namespaced keys + private-by-default are mandatory. No business logic (no model/file records here).
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Storage` resolves; `Driver` + `S3Driver` + `LocalDriver` + manager present; `composer lint` exits 0.
