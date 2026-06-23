# 0006 — support/file — filesystem-path & content helpers

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/file/` · Facade: `App\Support\File` (`app/Support/file/index.php`).
Depends on: none.

## Goal
Native path / name / mime / size / hash / stream helpers. Local-filesystem & path math only — object storage is
`support/storage`, this is the std-lib underneath it. Zero business logic.

## Build
- `index.php` → `namespace App\Support; class File`.
- Pieces (`namespace App\Support\File`): `Path` (join/normalize/extension/dirname — no traversal escapes), `Name`
  (basename/sanitize/unique), `Mime` (detect/guess from extension+content), `Size` (bytes/human), `Hash`
  (content hash, sha/crc), `Stream` (open/read/write/copy resource-safe).

## Tour first (intent only — vsample.md)
`vsample/app/Traits/Model/HasFileStorage.php` for the owner's file intent — intent only, build native helpers here.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- No silent error-swallowing on IO; native only.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\File` resolves and is callable; `composer lint` exits 0.
