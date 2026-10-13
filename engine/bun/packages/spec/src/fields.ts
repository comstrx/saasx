import { key, path, text, word, z } from "@engine/validate";

export type SpecText = z.infer<typeof specText>;
export type Localized<T> = T extends string | number | boolean | null | undefined
    ? T
    : T extends readonly (infer U)[]
      ? Localized<U>[]
      : T extends { key: string }
        ? [keyof T] extends ["key"]
            ? string
            : { [K in keyof T]: Localized<T[K]> }
        : { [K in keyof T]: Localized<T[K]> };

export { key, path, text, word };

export const operation: z.ZodString = z.string().regex(/^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/);
const specKey = z.strictObject({ key: z.string().regex(/^[^.\s]+(?:\.[^.\s]+)*$/) });
export const specText: z.ZodUnion<readonly [z.ZodString, typeof specKey]> = z.union([text, specKey]);

export function isSpecKey ( value: unknown ): value is z.infer<typeof specKey> {

    return specKey.safeParse(value).success;

}
