## Part

<!-- api | infra | skill | web | mobile | global -->

## What

<!-- one paragraph: the change and why -->

## Checklist

- [ ] Scoped to one part (or genuinely cross-cutting and explained above)
- [ ] The part's `verify` gate passes locally
- [ ] Tests / benchmarks updated where behavior changed
- [ ] No product-specific code leaked into a generic core (`api/core`, `infra` engine, `skill` engine, `web`/`mobile` engines)
- [ ] No secrets, credentials or private data
- [ ] Commit messages use the part prefix (`api(...)`, `infra(...)`, `skill(...)`, `web(...)`, `mobile(...)`, `global(...)`)

## Rollback

<!-- how to revert safely if this breaks production -->
