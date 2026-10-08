# Contributing

Welcome to `saasx` 👋 We love high-quality contributions.

- This guide is the shortest path from idea -> merged PR.

## Where to go

| You want to...                    | Use...                                                                  |
| --------------------------------- | ----------------------------------------------------------------------- |
| Ask a question / propose a design | 💬 [Discussions](https://github.com/comstrx/saasx/discussions)          |
| Report a reproducible bug         | 🐞 [Issues](https://github.com/comstrx/saasx/issues)                    |
| Report a security issue (private) | 🔒 [Security](https://github.com/comstrx/saasx/security/advisories/new) |

[Repository](https://github.com/comstrx/saasx)

---

## What makes a great contribution

- Small and focused: one logical change per PR when possible.
- Verified: tests updated (or a clear explanation why not).
- Clear: describe the why, not just the what.
- Documented: if behavior/API changes, update docs/examples.

If you are unsure about scope, start with a short [discussion](https://github.com/comstrx/saasx/discussions) first.

---

## Getting started

1. Fork the repo and clone it locally.
2. Create a new branch for your change.
3. Follow the [README](https://github.com/comstrx/saasx/blob/main/README.md), then the README of the part you are changing (`api/`, `web/`, `mobile/`, `infra/`, `skill/`) — each part owns its own setup and `verify` gate.
4. Make your change, add/adjust tests/docs as needed.
5. Open a PR scoped to one part when possible and follow the [PR template](https://github.com/comstrx/saasx/blob/main/.github/PULL_REQUEST_TEMPLATE.md).

---

## PR checklist (fast reviews)

Before opening a PR, make sure:

- ✅ The change is easy to understand and review
- ✅ Tests pass and new behavior is covered (when applicable)
- ✅ The part's `verify` gate passes locally (formatting, lints, tests)
- ✅ Commit messages use the part prefix: `api(...)`, `web(...)`, `mobile(...)`, `infra(...)`, `skill(...)`, or `global(...)`
- ✅ Docs/examples match the new behavior (if changed)

---

## Code of Conduct

By participating, you agree to follow the [Code of Conduct](https://github.com/comstrx/saasx/blob/main/CODE_OF_CONDUCT.md).

## Security

Do not disclose security issues publicly. [Report them privately](https://github.com/comstrx/saasx/security/advisories/new).
