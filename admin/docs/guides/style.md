# Style — naming, flatness, vertical whitespace

Biome lints and organizes imports only; the formatter is retired by
design. This file IS the formatter. Committed code must survive
`pnpm exec biome check --write .` byte-identical.

## Naming

- Files kebab-case; components PascalCase; hooks `use-<thing>`.
- Functions: short, single-purpose verbs — `toggle`, `parse`,
  `fetchUsers`. Underscore-wrapped names (`_get_`) are forbidden.
- Variables: the shortest unambiguous name. Booleans read as questions
  (`isOpen`, `hasAccess`, `canEdit`); arrays are plural nouns.
- The module is the namespace: `lib/str` exports `slugify`, never
  `strSlugify`.

## Flatness (numbers are review criteria, not suggestions)

- Max 3 nesting levels inside a function; deeper → extract a helper.
- Flat guard chains of single-line `if (...) return;` over nested
  conditionals. No nested ternaries. No clever one-liner chains.
- JSX deeper than ~4 levels, or any block past ~40 lines → extract a
  subcomponent.
- One component per file; ~150-line soft cap per file (`ui/` exempt).

## Comments: zero. Everywhere.

No exceptions — including `lib/`. If the "why" is unclear, the fix is a
better name, a smaller function, or a line in the commit body.
TypeScript signatures plus sibling tests are the documentation.

## Vertical whitespace (probe-proven against Biome)

- 4-space indent, ~120-col soft limit, double quotes, semicolons,
  trailing commas in multi-line literals.
- Blank line after the opening `{` of a multi-line function/component
  body and before its closing `}`. Same for `return (` … `)`.
- Multi-line JSX containers with element children: blank line after the
  opening tag and before the closing tag; blank line between multi-line
  siblings. Single-line siblings stay adjacent; text-only elements stay
  tight.
- Tight groups: consecutive hooks/consts of one concern stay adjacent;
  one blank line between concerns.
- Spaces inside parens ONLY for named helper parameter lists and
  control-flow conditions: `const toggle = ( id: string ) => {`,
  `if ( !items.length ) return null;` — never at call sites, never in
  inline callbacks, never in component signatures.
- `src/components/ui/**` keeps upstream registry style — never
  re-space it.

## Canonical example (mirror this shape)

```tsx
"use client";

import { useState } from "react";

export function Example({ items }: { items: string[] }) {

    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string | null>(null);

    const toggle = ( id: string ) => {

        setActive(id);
        setOpen((e) => !e);

    };

    if ( !items.length ) return null;

    return (

        <div onClick={() => setOpen(false)}>

            <button type="button" onClick={() => toggle("root")}>
                {open ? "close" : "open"}
            </button>

            <ul>

                {items.map((item) => (

                    <li key={item} onClick={() => toggle(item)}>

                        <span className={active === item ? "font-semibold" : ""}>{item}</span>

                    </li>

                ))}

            </ul>

        </div>

    );

}
```
