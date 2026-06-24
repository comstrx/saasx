# Task 0008 — `HasBaseService` engine trait + `BaseService` shell

Executor: claude_1. First/only executor (no prior `0008` work; the file held my finished `0007` report, now overwritten). `app/Services` was empty; the model + repository engine (0006/0007) is present.

## What I implemented (2 files)
- **`app/Services/BaseService.php`** — thin shell: `use HasBaseService;`, `__construct(protected BaseRepository $repository)`.
- **`app/Traits/Bases/HasBaseService.php`** — the orchestration engine. A concrete service with no overrides gains:
  - `index/show/statistics` — wrap the repository read in `successRemember` (cache keyed by query shape, tagged, tenant-prefixed).
  - `store/update/delete/deleteMany` — `App\Support\Database::transaction(repo write)` then `deleteCache(tag)`.
  - `buildParams` — the single options struct (`id,text,page,limit,sortBy,cursor,filter,field,scope,permission,callback`).
  - `successRemember(tag, key, fn)` → `Cache::remember(cacheKey, ttl, fn, [tag])`; `deleteCache(tag)` → `Cache::reset(tag)` (tag/index invalidation, never `flush`).
  - `resource(): class-string<JsonResource>` (convention + `is_subclass_of` guard) and derived `tag()`.

## Key decisions (the concrete WHY)
- **Cache by query shape, busted by tag.** `successRemember` builds a deterministic key = `<tag>:<sha256(Json::encode(shape))>`, tenant-prefixed by `App\Support\Cache`, tagged with the resource tag. The read shape is `buildParams(...)` minus `callback` (closures aren't serializable) plus a `type` discriminator (`index`/`show`/`statistics`), so the three reads share one struct yet never collide. Every write calls `deleteCache(tag)` → `Cache::reset(tag)`, which busts only that tag's indexed keys — **never a full flush** (verified: a sentinel under a different tag survived a write).
- **`tag()` derives from the service class name** (`ProductService`→`products`), **independent of `resource()` existence**, so a write always busts its cache even before any Resource class exists. `resource()` (per the interface) derives by convention with a fail-loud guard and is the declared/override point.
- **Reads cache the repository's hydrated payload** (Resource collection + meta). Verified it serializes and round-trips through Redis correctly (a stale read after a direct DB insert returned the cached count — proving a real hit; `show`/`resolve` worked off cache).
- **Writes are transactional at the service boundary** — `Database::transaction` here is where multi-repository orchestration becomes atomic (the repo's own transaction nests as a savepoint for a single delegate; the service transaction earns its keep when a concrete service touches several repositories). The `@template` on `Database::transaction` carries the closure's return type, so `store/update`→`mixed`, `delete`→`bool`, `deleteMany`→`int` are gate-clean with no casts.
- **`statistics` returns `array`** via `is_array($result) ? $result : []` — narrows the cache's `mixed` to the frozen `array` return, fail-closed, no cast.
- **Nothing native, no inline Laravel.** Every step is a pipeline over `App\Support\{Arr,Cache,Cast,Database,Json,Security,Str}` + the repository — no `array_*`/`preg_*`/`json_*`/`DB::`/`Cache::flush` (grep-verified). Octane-safe (no statics); tenant isolation stays the model's; ids UUIDv7 `string`.

## Acceptance criteria — all met (sqlite + live Redis probe)
- ✅ `WidgetService extends BaseService` with **zero overrides** yielded full CRUD + cached reads + tag-busting writes.
- ✅ One `buildParams` struct (11 keys) feeds index/show/statistics; a write busted **exactly its tag** — `index` re-read fresh (3→5) after `store`, while the sentinel under tag `gadgets` survived (no full flush).
- ✅ Cache hit proven by a stale read (direct DB insert invisible until the tag was busted); `show`/`update`(→777)/`delete`/`deleteMany`(4)/`statistics`(count 5, sum 2376) all worked.
- ✅ No native primitive; `composer verify` exits 0.

## Gate
`composer verify` → **exit 0** (phpstan level 8 → No errors; `route:cache` boots and clears). Probe removed; `git status` shows only `app/Services/`, `app/Traits/`.

## Remaining risks
- **Cache stores hydrated Resource payloads** (Eloquent models serialized into Redis) — works for standard models (verified) but is heavier than caching raw rows, and a model holding non-serializable state would fail to cache. If this bites at scale, switch the cached unit to `getItems`+meta and hydrate after the cache (a repo/0007 change). Flagged.
- **`resource()` redundancy** — both the service (this task's interface) and the repository (0007, used for hydration) derive the resource by the same convention; they agree, but hydration currently lives in the repo, so the service's `resource()` is the declared/override point rather than the base read path's hydrator. Clean to consolidate when the resource layer (0009) lands.
- **Cache-key serialization is fail-loud** — `Json::encode(key)` throws if a concrete service puts a closure/resource in `scope`/`permission` (the base never does); acceptable (surfaces, not silent), but document for overriders.
- **TTL fixed at 300s** (override `ttl()` per service); nested service+repo transactions are intentional (orchestration boundary).

ship it
