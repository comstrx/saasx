# Std lib — src/lib

The project's standard library. Rust philosophy: small, sharp,
composable modules with stable signatures. Everything above it (hooks,
components, features) is built on top of it — never around it.

## Map

Modules are born on first real consumer — never speculatively. This map
fixes WHERE each capability lives the day it is needed:

```
str/          slugify, truncate, capitalize, initials, …
num/          clamp, round, formatBytes, percent, …
list/         unique, groupBy, chunk, sortBy, …
json/         safeParse, stableStringify, …
date/         wrappers over Intl — never hand-rolled date math
net/          url + query-string helpers (transport lives in src/api/client.ts)
env/          the ONLY process.env reader, zod-parsed
log/          leveled logger; console.* anywhere else is a violation
validate/     shared zod schemas and schema helpers
permissions/  pure permission-set logic: has, hasAll, hasAny
motion/       animation tokens: durations, easings, named variants
i18n/         locale config: locales, defaultLocale, getDirection
auth/         Better Auth server + client config (see auth.md)
hash/         wrappers over Web Crypto digest ONLY
crypto/       wrappers over Web Crypto / node:crypto ONLY
fs/           server-only (first line: import "server-only")
path/         server-only
```

## Module rules

- Each subdir: flat files + one `index.ts` barrel — the only barrels
  allowed in the project.
- A module is born WITH its sibling test: `slugify.ts` +
  `slugify.test.ts`. Tests are the usage documentation — comments stay
  at zero. Runner: Vitest (the devDependency lands with the first
  module; node environment, no jsdom until a hook needs it).
- Isomorphic by default: no `window`, no `node:*`, no React imports
  anywhere in `lib/`. Server-only modules are marked with
  `import "server-only"` as the first line.
- Wrap the platform, never replace it: `hash`/`crypto` delegate to Web
  Crypto, `date` and number formatting delegate to `Intl`. Hand-rolling
  any of these is forbidden — no exceptions, no "small" ones.
- The module is the namespace: `lib/str` exports `slugify`, never
  `strSlugify`. Call sites read `import { slugify } from "@/lib/str"`.
- Pure functions with explicit inputs and outputs; no hidden state, no
  module-level mutable singletons.
- Stable signatures: changing a lib signature touches every consumer.
  Prefer adding a sibling function over breaking an existing one; a
  breaking change is its own commit with every consumer updated in it.
