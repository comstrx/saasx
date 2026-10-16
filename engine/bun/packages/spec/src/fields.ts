import { messageKeyPattern } from "engine/translate";
import { text, z } from "engine/validate";

export type SpecText = z.infer<typeof specText>;

export const operation: z.ZodString = z.string().regex(/^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/);
const specKey = z.strictObject({ key: z.string().regex(messageKeyPattern) });
export const specText: z.ZodUnion<readonly [z.ZodString, typeof specKey]> = z.union([text, specKey]);
