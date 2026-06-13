# Guides — How This Codebase Is Written

The law for **how** code is written. (What is built lives in `../product/`;
the **why** behind locked calls lives in `../decisions/` — required reading
before reopening any settled decision.) Reading the relevant guide before you
write code is part of the task, not optional context.

## The one idea

This is a layered system. Code flows in one direction, and every layer has
exactly one job. Ask one question before writing anything — *what layer am
I in, and what is it allowed to do?* — and you will derive almost every
rule in this folder yourself.

    lib → hooks → components → features → app
                  cross-cutting: api · stores · i18n · proxy · styles

A module knows only about the layers **below** it. The floor (`lib`) is
pure TypeScript with no React and no project concepts. The roof (`app`) is
sterile composition with no markup. Everything interesting is a **feature**
in between, assembled from the layers under it.

## Reading order

Each guide builds on the one before it. First session in this repo: read
them in this order.

1. **`architecture.md`** — the layer law. The spine. Always start here.
2. **`stdlib.md`** — the floor: pure, framework-free DSLs.
3. **`style.md`** — how every line is written: formatter, naming, classes.
4. **`api.md`** — the only door to the backend.
5. **`state.md`** — client state, and what is *not* client state.
6. **`i18n.md`** — four languages, two directions.
7. **`errors.md`** — nothing fails silently.
8. **`auth.md`** — identity, permissions, the request gate.
9. **`motion.md`** — motion and the performance budget.

## How every guide is shaped

Each opens with a **mental model** — internalize it and the rules follow
on their own. Then the rules, each paired with a ✅/❌ example, because the
contrast teaches faster than the rule. Each closes with **"You are doing
it wrong if…"** — the smells that catch a violation before review does.
When a fact belongs to another guide, the guide **links** instead of
restating it: every fact has exactly one home.

## Non-negotiables (the short list — full law in each guide)

- Imports point down. A feature never imports another feature.
- `app/**` pages are sterile: zero markup, classes, or logic.
- `fetch(` exists only in `src/api/client.ts`.
- `process.env` is read only in `src/lib/env`.
- Zero comments. Zero `any`. Zero manual `useMemo`/`useCallback`/`memo`.
- Every visible string goes through next-intl. Every value is a token.
- `src/components/ui/**` is registry-owned — never hand-written.
- Create the capability at its layer first, then consume it — never inline
  lower-layer logic higher up "to save a file."

## When the spec is missing

A guide tells you **how**. The matching `../product/` spec tells you
**what**. If the spec for a feature or page does not exist, STOP and
request it — never build from imagination.
