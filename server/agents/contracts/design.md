# contracts/design.md — Design pattern & abstraction philosophy (LAW)

> How to think. `arch.md` says where things live; this says how the code must be shaped. The whole point
> of this project is **abstraction at the highest level**. Re-read every turn.

## 1 — Repository pattern, layered

`model → repository → service → controller → route`, with FormRequest objects inside the controller and
trait DNA inside the models. Responsibilities are strictly separated:

| Layer | Owns | Never does |
|-------|------|-----------|
| **Model** | Schema mapping, casts, relations, DNA traits. | Query orchestration, HTTP, validation. |
| **Repository** | Data access: `fields()`, query building, CRUD, scopes, boot hooks. | HTTP, authorization, response shaping. |
| **Service** | Business logic, orchestration across repositories, transactions, domain events. | Direct query building, HTTP concerns. |
| **Controller** | Thin: read the role/tenant tag, assemble scopes/permissions, call the service, return a Resource. | Business logic, data access. |
| **Request** | Mandatory validation + authorization at the boundary. | Business logic. |
| **Resource** | Output shaping into the uniform envelope. | Data access, side effects. |

The base engine (`arch.md` §3) carries the repeated work for **every** layer, so concrete classes are
near-empty. A concrete class exists to **declare differences**, not to re-implement the pattern.

## 2 — Schema & conventions are the single source of truth

Relations, routes, permissions, and fields are **DERIVED, not hand-written.** The model's declared
relations drive eager-loading and nested-relation endpoints; the resource name drives the route set and
the `view_/add_/edit_/delete_<resource>` permissions (`naming.md`). When you add a column or a relation,
the engine should already know what to do with it — you declare, the engine materializes.

The DX target — what you write per new resource:

```
migration  +  Model (use traits)  +  Repository::fields()  +  Service (overrides only)  →  full auto API
```

The engine materializes CRUD / search / stats / files / permissions / relations / nested relations /
tenant-scope. If you find yourself hand-writing the same shape twice, it belongs in the engine.

## 3 — Engine holds behaviour; concrete is declaration

- Generic behaviour is pushed **DOWN** into the engine (`support → traits → bases`).
- Concrete classes (`CategoryService`, `ProductRepository`, …) are **pure declaration** — overrides and
  `fields()` only.
- New shared behaviour goes in the `HasBaseXxx` **trait**, never duplicated into a concrete class.
- If a behaviour is needed by two systems, it is engine-level; if by one, it is a concrete override.

## 4 — DNA traits (opt-in capability)

A capability is a **trait a model `use`s** to gain a giant feature: `HasRoles`, `HasPermissions`,
`HasFiles`, `HasSearch`, `HasCache`, `HasRelations`, `HasState`, … (illustrative). Rules:
- A DNA trait is **self-contained**: it brings its own scopes, accessors, boot hooks, and config surface.
- It is built **on top of the Support DSL** — never re-implements native/infra work.
- Mounting it is the **whole** integration: `use HasFiles;` on a model means that model now has files,
  end to end, with no per-model wiring.
- Keep the opt-in surface minimal and hard to misuse (a few well-named methods/properties to configure).

## 5 — Uniform surface

Every resource exposes the **same** API shape (CRUD + search + stats + files + permissions + relations +
nested relations), served by the unified controller and the base engine. This makes the codebase
**self-similar and predictable**: learning one resource teaches all of them, and a new resource inherits
the full surface for free. Do not give one resource a bespoke shape when the uniform surface fits.

## 6 — Swappable drivers (every infrastructure capability)

`cache`, `lock`, `throttle`, `queue`, `event`, `storage`, plus `payments`, `search`, and `ai`, are
**adapters behind a neutral interface**:

```
support/<domain>/
├── index.php        // the manager/facade: App\Support\<Domain> — the ONLY thing callers touch
├── Driver.php       // the interface
├── RedisDriver.php  // a concrete backend
└── …                // pieces
```

Adding or replacing a backend = **ONE new Driver file + config**. Callers never reference a concrete
backend; business code never references a broker/provider directly. Keep the neutral interface even when
only one backend exists today (Redis-only, Postgres-only, Stripe-only) — the interface is the contract
that makes the swap a one-file change later.

- **Events:** all publishing via `App\Support\Event::publish(event, payload, key)`; default driver
  Redis/Horizon; add `outbox` table when durable delivery is needed.
- **Payments:** `PaymentGateway` contract + `StripeDriver` + manager + webhook pipeline + full lifecycle
  state machine (intent→authorize→capture→refund→dispute→payout). Add a provider = ONE file.
- **Cache:** full DSL (get/read/set/update/remember/refresh/forget/**index**/reset/flush) with indexed
  (tag) partial invalidation, so a single index/tag can be invalidated without flushing everything, and
  the cache is refreshed on the relevant write.
- **AI / Search:** provider abstraction; default AI = Claude/Anthropic latest.

## 7 — The "magic" policy (deterministic automation, never obscurity)

"Magic" — schema-derived relations, auto eager-load, reusable route blocks, the `__call`-style relation
dispatch, the auto resource action set — is **welcome and intended**. The bar:

- It must be **deterministic automation the team understands**, not accidental obscurity.
- It must be **Octane-safe**: no per-request state in singletons/statics; tag lives in `Context`.
- It must be **`route:cache`-safe**: explicit reusable route blocks, **no route closures**, no boot-time
  globbing of the filesystem to register routes.
- It must fail **loud and closed**, never silently wrong (e.g. tenant scope is fail-closed).

The structure stays clear; a little deterministic magic on top of a clear structure is exactly the goal.
N+1 is eliminated by auto eager-load from auto-discovered relations + requested includes, with
`Model::preventLazyLoading()` as the dev tripwire.

## 8 — Simple, hard-to-misuse public surfaces

- Minimal public API per Support facade / DSL; explicit over implicit; stable contracts.
- No speculative abstraction, no premature generality — abstract a thing the **second** time you need it,
  not the first. Delete before adding; reuse what exists before introducing a new pattern or dependency
  (`tolerance.md`).
- A new capability earns its abstraction only when a real system needs it. Build on demand.
</content>
