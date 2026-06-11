# Languages — multi-language & direction

## Locales

- v1 ships `en` (LTR) and `ar` (RTL). Default locale: `en`
  `[OPERATOR INPUT]` confirm the default and any v2 locales.
- Every locale is a first-class citizen: a feature is done only when it
  reads correctly in both directions.

## URL strategy

- Always-prefixed routes: `/en/products`, `/ar/products` — one
  strategy, zero ambiguity, shareable links carry their language.
- First visit: the proxy locale guard detects `Accept-Language` and
  redirects to the matching prefix; afterwards the URL is the truth.
- Locale switching swaps the prefix and preserves the rest of the path
  and query.

## Who translates what

- **UI strings** (labels, buttons, messages, errors): frontend-owned in
  `messages/en.json` + `messages/ar.json`. Both files, same commit,
  feature-namespaced keys — law in `docs/guides/i18n.md`.
- **Business content** (product names, descriptions, category titles):
  backend-owned; arrives already localized per the request locale
  (`system/backend.md`). The frontend never translates business data
  and never stores parallel copies of it.
- Untranslated business content falls back to the store's default
  content language, marked by the backend `[OPERATOR INPUT]` confirm
  the fallback marker shape.

## Direction

Direction is a consequence of locale, set once on `<html dir>`, and
handled everywhere else by logical properties — full law in
`docs/guides/i18n.md`. No feature spec needs to mention RTL unless it
has a genuinely direction-specific behavior (e.g. a chart axis).
