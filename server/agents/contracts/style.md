# contracts/style.md — Code style (LAW)

> The code must be **indistinguishable from the owner's hand.** Anyone reading it must not be able to tell
> whether the owner or an agent wrote it. There is **NO formatter** (Pint is removed and never run)
> because this hand-style is intentionally not PSR-12 / Pint-compatible. Match it exactly, every line.
> The existing files `app/Support/str/*` and `app/Support/response/*` are the reference hand — mirror them.

## Hard rules

- `declare(strict_types=1);` at the top of **every** PHP file. Full param & return types on every
  signature; type every property.
- **4-space indent. K&R braces** (opening brace on the same line).
- **Declarations and control structures: a space before `(` AND spaces inside it.**
  `public function index ( Request $req ): JsonResponse {`, `if ( $cond )`, `match ( $x )`,
  `foreach ( $a as $b )`, `catch ( \Throwable $e )`.
- **Native function *calls* use no inner spaces:** `array_merge($a, $b)`, `is_array($value)`,
  `str_starts_with($method, $func)`. (Declarations breathe; calls do not — match surrounding code.)
- **Breathing bodies:** one blank line right after a method's opening `{` and one right before its `}`.
- **NO blank line BETWEEN consecutive methods** — a method's closing `}` is immediately followed by the
  next method's signature on the very next line. The breathing is *inside* bodies, never *between* methods.
- **Declarations vs methods:** property/const declarations are grouped at the **top** of the class,
  separated from the method block by **ONE blank line** (a blank line may also separate distinct
  declaration groups). The class also breathes: blank line after the opening `{` and before the closing `}`.
- **NEVER a one-line function/method body** — always the multi-line breathing form, even for a single
  statement or an empty body. No `function x () { return $y; }`, no `) {}`. An empty body is still
  `{` newline blank newline `}`.
- `namespace` then `use` lines immediately (no blank line between); blank line before the class.
- Multiple properties on one line may share a modifier (`protected array $scopes = [], $permissions = [];`).
  Align `=>` in multi-line array literals.
- Heavy use of `match`, arrow fns `fn() =>`, ternaries, `??`, destructuring `[$a, $b] = …`, `compact()`,
  and inline guard clauses (`if ( !$id ) return …;`).

## The canonical example (this is the exact hand)

```php
<?php

declare(strict_types=1);

namespace App\Support;

class Cast {

    public static function string ( mixed $value ): ?string {

        if ( is_array($value) || is_object($value) ) return null;

        $value = trim((string) $value);

        return in_array($value, ['', 'null', 'undefined'], true) ? null : $value;

    }

}
```

Shape of a class with declarations + multiple methods:

```php
class HasBaseController {

    protected array $scopes = [], $permissions = [];

    public function index ( Request $req ): JsonResponse {

        return $this->baseService->index($req->all(), $this->scopes, $this->permissions);

    }
    public function show ( Request $req, string $id ): JsonResponse {

        return $this->baseService->show($id, $this->scopes, $this->permissions);

    }

}
```

Note: declarations at top → one blank line → methods with breathing bodies and **no** blank line between
them. (UUIDv7 ids are `string`, not `int` — see `arch.md` §9; `vsample` uses `int`, do not copy that.)

## Comments & PHPDoc

- **Zero prose comments.** No explanatory comments, no section banners, no `// TODO`, except absolute
  necessity (a genuinely non-obvious invariant). If the code needs a comment to be understood, rename and
  restructure until it doesn't.
- **PHPDoc is typing, not prose.** DELETE any docblock the native type already expresses
  (`/** @return string */`, `/** @param string $x */` are pure noise). **KEEP ONLY** what PHP cannot
  express natively: `list<…>`, `array<K, V>`, `non-empty-string`, `class-string<T>`, `@template T` +
  generic `@param`/`@return T`.
- **Load-bearing test for a kept tag:** remove it, run the gate. Still green → it was noise, leave it out.
  Errors (`return.type` / `argument.type`) → it was a real contract, keep it.
- **Array/iterable RETURNS are always documented** (mandatory — exempt from the load-bearing test): every
  method whose return type is `array` carries a one-line shape tag — `/** @return list<string> */`,
  `/** @return array<string, mixed> */`, `/** @return array{…} */`. `missingType.iterableValue` stays
  suppressed for **params**, but array **returns** are always typed. When the shape is genuinely open,
  `/** @return array<mixed> */` is acceptable — never leave an `array` return untagged.

## Discipline

- Match the surrounding file's exact spacing and idiom before adding to it — read neighbours first.
- No drive-by reformatting of code you are not changing. The smallest correct diff wins (`tolerance.md`).
- `declare(strict_types=1);` is added by stubs automatically where stubs exist; if you hand-create a file,
  add it yourself.
</content>
