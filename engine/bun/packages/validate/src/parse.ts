import { Failure, type FieldErrors } from "@engine/error";
import type { z } from "zod";

export type Parsed<T> = { ok: true; value: T } | { ok: false; failure: Failure };

/**
 * Zod issues as field errors keyed by their dotted path; issues without a path land under `_form`.
 */
export function issuesOf(error: z.ZodError): FieldErrors {
    const errors: FieldErrors = {};

    for (const issue of error.issues) {
        const field = issue.path.length ? issue.path.map(String).join(".") : "_form";

        errors[field] = [...(errors[field] ?? []), issue.message];
    }

    return errors;
}
/**
 * Parses without throwing; a rejection is an `input` failure carrying the field errors.
 */
export function parse<T extends z.ZodType>(schema: T, value: unknown, reason = "invalid_input"): Parsed<z.output<T>> {
    const result = schema.safeParse(value);

    if (result.success) return { ok: true, value: result.data };

    return {
        ok: false,
        failure: new Failure("input", { errors: issuesOf(result.error), reason, cause: result.error }),
    };
}
export function assert<T extends z.ZodType>(schema: T, value: unknown, reason = "invalid_input"): z.output<T> {
    const result = parse(schema, value, reason);

    if (!result.ok) throw result.failure;

    return result.value;
}
/**
 * The top-level keys of an object schema, or none when the schema is not an object.
 */
export function shapeKeys(schema: z.ZodType): string[] {
    const shape = (schema as z.ZodType & { shape?: Record<string, unknown> }).shape;

    return shape ? Object.keys(shape) : [];
}
