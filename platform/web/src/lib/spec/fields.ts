import { z } from "../providers/schema.ts";

export type SpecText = z.infer<typeof specText>;
export type Localized<T> = T extends string | number | boolean | null | undefined ? T
    : T extends readonly (infer U)[] ? Localized<U>[]
    : T extends { key: string } ? [keyof T] extends ["key"] ? string : { [K in keyof T]: Localized<T[K]> }
    : { [K in keyof T]: Localized<T[K]> };

export const text = z.string().refine(( value ) => value.trim().length > 0, "Expected non-empty text.");
export const key = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const specKey = z.strictObject({ key: z.string().regex(/^[^.\s]+(?:\.[^.\s]+)*$/) });
export const specText = z.union([text, specKey]);
export const path = z.string().regex(/^\/(?:[\p{L}\p{N}_:-]+(?:\/[\p{L}\p{N}_:-]+)*)?$/u);

export function isSpecKey ( value: unknown ): value is z.infer<typeof specKey> {

    return specKey.safeParse(value).success;

}
