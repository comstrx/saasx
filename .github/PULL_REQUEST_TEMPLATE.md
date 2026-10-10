## Part

<!-- engine | api | infra | skill | web | mobile | global -->

## What

<!-- one paragraph: the change and why -->

## Checklist

- [ ] Scoped to one part (or genuinely cross-cutting and explained above)
- [ ] The part's `verify` gate passes locally
- [ ] Tests / benchmarks updated where behavior changed
- [ ] No product-specific code leaked into an engine or a generic part (`engine/`, `platform/api`, `platform/infra`, `platform/skill`, the `platform/web` and `platform/mobile` engines)
- [ ] No secrets, credentials or private data
- [ ] Commit messages use the part prefix (`engine(...)`, `api(...)`, `infra(...)`, `skill(...)`, `web(...)`, `mobile(...)`, `global(...)`)

## Rollback

<!-- how to revert safely if this breaks production -->
