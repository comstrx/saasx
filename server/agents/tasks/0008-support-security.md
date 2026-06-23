# 0008 — support/security — crypto wrappers (no DIY crypto)

Requirement: requires/0001-support-layer.md (Support layer — owner-sanctioned full build).
Layer: `app/Support/security/` · Facade: `App\Support\Security` (`app/Support/security/index.php`).
Depends on: none.

## Goal
Thin wrappers over **core / battle-tested crypto** (the sanctioned "don't roll your own" exception — `tools.md`).
Tokens, hashing, signatures, secret handling, sanitization, symmetric encryption. **No DIY crypto algorithms.**

## Build
- `index.php` → `namespace App\Support; class Security`.
- Pieces (`namespace App\Support\Security`): `Token` (CSPRNG token/random bytes via `random_bytes`), `Hash`
  (password hash/verify via Laravel `Hash`; content hash where needed), `Signature` (HMAC sign/verify, constant-time
  compare), `Secret` (compare/wipe; never log — pairs with `log/Redact`), `Sanitize` (strip/escape untrusted strings),
  `Encrypt` (wrap Laravel `Crypt` encrypt/decrypt).
- Use core primitives (`random_bytes`, `hash_hmac`, `hash_equals`, Laravel `Hash`/`Crypt`) — wrap, never reimplement.

## Tour first (intent only — vsample.md)
No 1:1 analog; tour `vsample/app/Helpers/*` for hand/intent, build to §5.

## Constraints
- `declare(strict_types=1)`; exact hand-style; zero comments; array returns carry shape phpdoc.
- Never weaken auth/escaping; constant-time comparisons for secrets/signatures. No secrets logged or returned in errors.
- `composer dump-autoload` after adding files.

## Done when
- `App\Support\Security` resolves and is callable; `composer lint` exits 0.
