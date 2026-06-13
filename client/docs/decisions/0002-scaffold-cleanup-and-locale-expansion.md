# 0002 — Scaffold cleanup + locale expansion

> One file per session (see `README.md`). Immutable — supersede, never edit.

- **Session:** Scaffold cleanup to a single Hello World page; locale expansion
- **Date:** 2026-06-13

---

### 1. Supported locales = en · ar · fr · de

- **Date:** 2026-06-13
- **Decision:** The locale set is `en`, `ar`, `fr`, `de` (default `en`).
  `getDirection` returns `rtl` only for `ar`; `en` / `fr` / `de` are `ltr`. The
  single source is `src/lib/utils/i18n/direction.ts` (`locales`), consumed by
  the next-intl `routing`, the `NEXT_PUBLIC_APP_LOCALE` enum, and the layout's
  `generateStaticParams`. Each locale has a full `messages/<locale>.json`
  carrying the same keys; routes `/en` `/ar` `/fr` `/de` prerender.
- **Why:** Broaden reach (FR/DE) while exercising the i18n/RTL system with both
  LTR and RTL locales. Adding a locale is now one array entry + one message
  file.
- **Supersedes:** the "Supported locales: en, ar" note in
  `0001-project-bootstrap.md` §7.

### 2. Scaffold reduced to a single Hello World page

- **Date:** 2026-06-13
- **Decision:** Executed bootstrap §10 (scaffold non-binding). **Deleted:**
  `src/features/hello.tsx` and `src/hooks/use-now.ts` (no consumers);
  `src/lib/std/{date,fs,list,net,parse,str,validate}` and
  `tests/lib/std/date/format.test.ts` (six empty stub `index.ts` + one sample
  helper consumed only by its own test). **Kept:** `src/lib/std/country/` (59 KB
  real reference data + typed accessors — the documented exemplar) and all
  load-bearing infrastructure (`api`, `lib/env`, `lib/utils`, `i18n`, `stores`,
  `proxy`, `components/ui`, `components/layout`, `styles/globals.css` incl. the
  design-token scale). The home page now composes a single
  `src/components/custom/hello.tsx` greeting; any missing std helper is recreated
  **create-down** at first use (bootstrap §8) — e.g. the Auth task creates
  `lib/std/validate`.
- **Why:** A clean foundation to build on; the scaffold had served its purpose
  of demonstrating intent.
