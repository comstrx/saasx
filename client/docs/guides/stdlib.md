# stdlib — The Floor

`src/lib/std` is the foundation every other layer stands on. It is pure,
framework-free TypeScript: small, composable DSLs over native JavaScript.
If a function knows nothing about React, about the network, or about this
specific product — it belongs here.

## Mental model

**stdlib is the vocabulary; everything above is sentences.** A hook, a
component, a feature should read like prose built from words defined here.
When you write logic higher up and it contains a loop, a date calc, a
string transform, a parse, a guard — you are defining a word inline
instead of reaching for (or adding) it to the vocabulary. Stop and move it
down.

The test: *could this function be published to npm and used by a totally
unrelated project?* If yes, it is stdlib. If it mentions a user, a tenant,
a route, an API shape, or JSX — it is not.

## Why this layer exists

- **One home per primitive.** `formatDate` written once, tested once, used
  everywhere — never re-implemented in three features three different ways.
- **Testable in isolation.** Pure in, pure out: a sibling test pins the
  behavior with zero mocking, zero render.
- **Keeps the layers above thin.** Features stay about *composition* and
  *domain*; the mechanical work lives here.
- **It compounds.** Every primitive you add makes the next feature shorter.
  This is the asset that grows.

## The categories

Each is a folder with an `index.ts` barrel. Pick by *what the data is*, not
by which feature needs it.

| Category | Holds | Examples |
|---|---|---|
| `country` | country / locale reference data + lookups | `getCountry`, `dialCode`, `flagOf` |
| `date` | time math, formatting, relative time | `formatDate`, `fromNow`, `isPast` |
| `fs` | file/blob, sizes, mime, extensions | `humanSize`, `extOf`, `isImage` |
| `list` | array & collection ops | `groupBy`, `chunk`, `uniqueBy`, `move` |
| `net` | URL / query / header helpers (NO fetching) | `buildQuery`, `joinUrl`, `parseQuery` |
| `parse` | safe parsing & coercion | `toInt`, `safeJson`, `clamp` |
| `str` | string transforms | `slugify`, `truncate`, `initials`, `capitalize` |
| `validate` | pure predicates & format checks | `isEmail`, `isUuid`, `isStrongPassword` |

`country` already ships its data as `data.json` + an `index.ts` of typed
accessors — follow that shape for any reference-data category.

## Adding a new category — the bar is high

Add one ONLY when the logic fits none above. Before creating `crypto/` or
`color/`, ask: is this `parse`? is this `str`? Most things are. A new
category is a structural decision — when unsure, place it in the closest
existing one and flag it in your report rather than inventing a folder.

## How to write a stdlib function

- **Pure.** Same input → same output. No `Date.now()` reached implicitly
  (take the date as an argument), no `fetch`, no reading globals, no
  mutation of inputs.
- **Named, not clever.** `isEmail(value)` not `chk(v)`. The name is the doc
  — there are no comments (see `style.md`).
- **Typed at the edge.** Accept the narrowest input, return the narrowest
  output. No `any` — `unknown` + narrowing where input is untrusted.
- **Small.** One job. Compose two primitives rather than branching one into
  two jobs.
- **Born with a test.** A new `foo.ts` ships with `tests/lib/std/<cat>/foo.test.ts`
  in the mirror path. (Tests are deferred for now by operator
  decision, but the mirror location is reserved — see `architecture.md`.)

## Right vs wrong

A feature needs the user's initials for an avatar fallback.

✅ **Right** — define the word once, reach for it:

```ts
// src/lib/std/str/index.ts
export function initials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
```

```tsx
// in the feature — prose, not mechanics
import { initials } from "@/lib/std/str";
const fallback = initials(user.name);
```

❌ **Wrong** — mechanics inlined in the component:

```tsx
// the transform is trapped here, untested, and about to be
// copy-pasted into the next feature that needs it
const fallback = user.name
  .trim()
  .split(" ")
  .slice(0, 2)
  .map((p) => p[0].toUpperCase())
  .join("");
```

The wrong version isn't wrong because it's long — it's wrong because it
defines a reusable primitive in a place no one else can find or test.

## You are doing it wrong if…

- You wrote `.map`, `.filter`, `.reduce`, a regex, or a date calculation
  **inside** a component or feature → it's a stdlib word; move it down.
- You're about to copy a helper from one feature into another → it was
  always stdlib; promote it now.
- A function in `lib/std` imports from `@/hooks`, `@/components`,
  `@/features`, `@/api`, or anything React → it's mislabeled; it isn't
  stdlib.
- You reached for lodash/date-fns for something that's five lines → write
  the five lines here instead (see the no-duplicate-capability rule in
  AGENTS.md).
- Your function reads `Date.now()`, `window`, or `process.env` directly →
  it's impure; take the value as a parameter (`env` is read only in
  `lib/env`).

## Boundaries with neighbors

- Needs React (`useState`, effects)? → it's a hook, not stdlib. See
  `state.md`.
- Touches the network/fetching? → that's `api`, never `lib/std/net`
  (`net` only builds and parses URLs/queries — it never calls them). See
  `api.md`.
- Cross-cutting UI glue like `cn` or text-direction? → `lib/utils`, not
  `lib/std`. See `style.md` and `i18n.md`.
