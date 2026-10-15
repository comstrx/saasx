import { Failure, type FieldErrors, type Issue, type Issues } from "engine/error";
import type * as z from "./z.ts";

export type Parsed<T> = { ok: true; value: T } | { ok: false; failure: Failure };

export function issuesOf ( error: z.ZodError ): FieldErrors {

    const errors: FieldErrors = {};

    for ( const issue of error.issues ) {

        const field = issue.path.length ? issue.path.map(String).join(".") : "_form";

        errors[field] = [...(errors[field] ?? []), issue.message];

    }

    return errors;

}
export const ruleNames = ["required", "min", "max", "type", "format", "choice", "unknown", "invalid"] as const;

type RawIssue = {
    code: string;
    path: PropertyKey[];
    minimum?: number | bigint;
    maximum?: number | bigint;
    expected?: string;
    format?: string;
    values?: unknown[];
    input?: unknown;
};

function ruleOf ( issue: RawIssue ): Issue {

    const number = ( value: number | bigint | undefined ): number => Number(value ?? 0);

    if ( issue.code === "too_small" ) return { rule: "min", params: { minimum: number(issue.minimum) } };
    if ( issue.code === "too_big" ) return { rule: "max", params: { maximum: number(issue.maximum) } };

    if ( issue.code === "invalid_type" )
        return issue.input === undefined
            ? { rule: "required" }
            : { rule: "type", params: { expected: issue.expected ?? "value" } };

    if ( issue.code === "invalid_format" ) return { rule: "format", params: { format: issue.format ?? "value" } };
    if ( issue.code === "invalid_value" ) return { rule: "choice", params: { choices: (issue.values ?? []).join(", ") } };
    if ( issue.code === "unrecognized_keys" ) return { rule: "unknown" };

    return { rule: "invalid" };

}
export function rulesOf ( error: z.ZodError ): Issues {

    const issues: Issues = {};

    for ( const issue of error.issues as unknown as RawIssue[] ) {

        const field = issue.path.length ? issue.path.map(String).join(".") : "_form";

        issues[field] = [...(issues[field] ?? []), ruleOf(issue)];

    }

    return issues;

}
export function parse<T extends z.ZodType> ( schema: T, value: unknown, reason = "invalid_input" ): Parsed<z.output<T>> {

    const result = schema.safeParse(value, { reportInput: true });

    if ( result.success ) return { ok: true, value: result.data };

    return {
        ok: false,
        failure: new Failure("input", {
            errors: issuesOf(result.error),
            issues: rulesOf(result.error),
            reason,
        }),
    };

}
export function assert<T extends z.ZodType> ( schema: T, value: unknown, reason = "invalid_input" ): z.output<T> {

    const result = parse(schema, value, reason);

    if ( !result.ok ) throw result.failure;

    return result.value;

}
export function shapeKeys ( schema: z.ZodType ): string[] {

    const shape = (schema as z.ZodType & { shape?: Record<string, unknown> }).shape;

    return shape ? Object.keys(shape) : [];

}
