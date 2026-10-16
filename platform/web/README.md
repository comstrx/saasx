# Web

A spec-driven Next.js engine over the `engine` package. The engine (`src/`, `tools/`, `messages/`, `tests/`) holds no product; a site or a panel is a spec under `specs/<name>` and the build selects it with `NEXT_PUBLIC_SPEC`.

## The language

One system at every depth — `{ options, children }`:

```text
screen   contents (name, path, title, description, icon, entity)  ·  options (render, title, seo, nav, footer, sidebar, loader)  ·  access  ·  redirect  ·  blocks
block    options (width, height, grid, sizes, gap, padding, align, tone, radius, shadow)  ·  features  ·  blocks
feature  name  ·  heading  ·  options  ·  ports  ·  access
```

A feature is generic. `src/features/<name>/feature.ts` declares its `owner` (`server` or `client`), the `options` it understands (literal defaults), the `ports` it needs (`list`, `one`, `write`; `required: false` for optional ones) and the `signals` it emits. The spec binds every port:

| Binding                                              | Meaning                                                                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `read("feature.operation", input?, live?)`           | a GET from the catalogue; `input` may hold `param("id")`, `query("page")`, `signal("search")`, `signal("selected", { wait: true })` |
| `write("feature.operation", input?, fields?)`        | a mutation; `fields` names and orders what a form edits (bound inputs are never edited)                                             |
| `data([...])` / `site("links")`                      | inline rows or the site document; the spec runs without a backend on these alone                                                    |
| `live("channel", ["event"], { path, key, version })` | a realtime subscription; a payload patches the shown rows, every event schedules one reconciling read                               |

Signals let features talk on one screen: `search` emits `search`, `table` emits `selected`, `sort`, `page`; a port bound to `signal(name)` reloads when it changes and `wait: true` keeps it idle until a value exists. The compiler refuses a consumed signal no feature emits.

## What the compiler enforces

- Every `t("key")` exists in every enabled language; `t("catalog.fields")` may name a whole dictionary branch (labels, choices, errors).
- Ports match their operation (list/one/write), inputs are known, path parameters are bound, patch keys exist in the output.
- **States contract:** a client feature that reads speaks `loading`, `failed`, `offline`, `cached` (a list also `empty`); one that writes speaks `failed` and an `errors` dictionary. A text the spec leaves out is the surface's own `state.<name>` (and `errors`) message, so a spec names only the texts it changes; it may never leave one empty.
- **Permissions:** an operation declared with `need(["delete_x"], …)` carries its permissions into the compiled write port; the feature itself is gated only by what it reads. `usePermission(port)` / `<Permission port>` hide what the session may not run.
- **Icons:** `contents.icon` must exist in the surface's icon set.
- SEO is behavioral: `content.seo.robots` and `sitemap` lists drive robots.txt, the sitemap and page metadata; there is no flag.

## Runtime pieces

- `usePort` (`hooks/use-client`, from `defineClient` in `engine/client`) — any port as a resource (idle · loading · ready · failed) with a persistent cache, stale answers kept offline, live patches, and `meta.pagination`.
- `useWrite` — a write port as an action; bound inputs ride along; `{ queue: true }` parks an undeliverable write in the outbox and replays it when the device is back online (same idempotency key).
- `useForm` — a form over a write port: fields from the catalogue, one idempotency key per unchanged values, failures spoken through `errors` (`reasons`, `rules`, `fields`), never a backend sentence as a key.
- `components/schema-form` — one control per field kind: text/email/phone/password/number/date, choice, boolean, localized (one input per language), list, file.
- Device DSL (`engine/device`): `require(permission)`, `locate()`, `pick(source)`, `pushToken()`; `location`, `avatar`, `notifications` features are the reference consumers.
- Boundaries: every feature and every screen is wrapped; a screen failure shows a retry and is reported through `/api/report` (same beacon failed and slow calls use).
- Code splitting: a page ships only its own client features (`next/dynamic`); at idle it preloads the features of the screens it links to (skipped under Save-Data), so a first navigation renders at once instead of behind a loader.

## Setup

With `"engine": "link:engine"` in `package.json`, run `bun link` once inside the `engine` package, then `bun install --frozen-lockfile` here; a part that pins a git tag of the engine installs it directly.

## Gates

```text
bun run check       biome · architecture layers · messages (every reason and rule speaks) · specs
bun run typecheck   compile the selected spec · next typegen · tsc
bun run bench       spec compile and message composition
bun test            compiler rules · modes · forms · components · live backend (skips when down)
bun run build       compile · next build
bun run start       the standalone server under Bun, as it ships (public and static copied beside it)
```

## Modes, by values alone

The same engine answers six shapes from one spec folder: SEO site (robots allow + sitemap), non-SEO panel (empty lists), with backend (`contracts.urls`), without backend (`contracts: null`, data/site ports only), single tenant (`contracts.options.tenant`) and multi tenant (tenant from the request host). `tests/modes.test.ts` proves each from the real specs.

## License

Copyright © 2026 Abdulrahman Yasser (comstrx).

Licensed under the [Apache License 2.0](https://github.com/comstrx/saasx/blob/main/LICENSE).
