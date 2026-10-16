import { isRecord, mapValues } from "engine/base";

export const kinds = {
    configuration: 503,
    input: 400,
    network: 502,
    timeout: 504,
    aborted: 499,
    http: 502,
    response: 502,
    execution: 403,
    denied: 403,
    missing: 404,
    conflict: 409,
    unknown: 500,
} as const;

export type Kind = keyof typeof kinds;
export type FieldErrors = Record<string, string[]>;
export type Issue = { rule: string; params?: Record<string, string | number> | undefined };
export type Issues = Record<string, Issue[]>;
export type Detail = {
    status?: number | undefined;
    errors?: FieldErrors | undefined;
    issues?: Issues | undefined;
    reason?: string | undefined;
    code?: string | undefined;
    message?: string | undefined;
    retryAfter?: number | undefined;
    requestId?: string | undefined;
    cause?: unknown;
};
export type Facts = {
    kind: Kind;
    status: number;
    reason?: string | undefined;
    code?: string | undefined;
    retryAfter?: number | undefined;
    requestId?: string | undefined;
};

const lowest = 400;
const highest = 599;
const serverFloor = 500;
const tooMany = 429;

export class Failure extends Error {
    readonly kind: Kind;
    readonly status: number;
    readonly errors: FieldErrors;
    readonly issues: Issues;
    readonly reason: string | undefined;
    readonly code: string | undefined;
    readonly retryAfter: number | undefined;
    readonly requestId: string | undefined;
    readonly spoken: boolean;
    constructor ( kind: Kind, { status = 0, errors = {}, issues = {}, message, ...detail }: Detail = {} ) {

        const resolved = status >= lowest && status <= highest ? status : kinds[kind];

        super(message ?? `${kind} (${resolved})`, detail.cause === undefined ? undefined : { cause: detail.cause });

        this.name = "Failure";
        this.kind = kind;
        this.status = resolved;
        this.errors = errors;
        this.issues = issues;
        this.reason = detail.reason;
        this.code = detail.code;
        this.retryAfter = detail.retryAfter;
        this.requestId = detail.requestId;
        this.spoken = message !== undefined;

    }
    facts (): Facts {

        return {
            kind: this.kind,
            status: this.status,
            reason: this.reason,
            code: this.code,
            retryAfter: this.retryAfter,
            requestId: this.requestId,
        };

    }
}

export function isFailure ( value: unknown ): value is Failure {

    return value instanceof Failure;

}
export function unreachable ( error: unknown ): boolean {

    return isFailure(error) && (error.kind === "network" || error.kind === "timeout");

}
export function transient ( error: unknown ): boolean {

    return unreachable(error) || (isFailure(error) && (error.status >= serverFloor || error.status === tooMany));

}
export function settled ( error: unknown ): boolean {

    return isFailure(error) && (error.kind === "configuration" || error.kind === "missing" || error.kind === "denied");

}
export function guarded<T> ( work: () => T, kind: Kind = "input" ): T {

    try {

        return work();

    } catch ( error ) {

        throw isFailure(error) ? error : new Failure(kind, { cause: error });

    }

}
export function failureOf ( error: unknown ): Failure {

    if ( isFailure(error) ) return error;
    if ( error instanceof Error ) return new Failure("unknown", { message: error.message, cause: error });

    if ( isRecord(error) && typeof error.message === "string" )
        return new Failure("unknown", { message: error.message, cause: error });

    return new Failure("unknown", { message: String(error), cause: error });

}
export function describe ( error: unknown, depth = 0 ): Record<string, unknown> {

    if ( !(error instanceof Error) ) return { message: String(error) };

    const facts: Record<string, unknown> = { name: error.name, message: error.message };

    if ( isFailure(error) ) Object.assign(facts, error.facts());
    if ( isRecord(error) && typeof error.code === "string" ) facts.code = error.code;
    if ( depth < 3 && error.cause !== undefined ) facts.cause = describe(error.cause, depth + 1);

    return facts;

}
export function reference ( error: unknown ): string | null {

    if ( !isFailure(error) || !error.requestId ) return null;

    return `REQ-${error.requestId
        .replace(/[^a-z0-9]/gi, "")
        .slice(0, 8)
        .toUpperCase()}`;

}
export function formErrors ( error: unknown, fallback: string ): Record<string, string> {

    if ( !isFailure(error) ) return { _form: fallback };

    const fields = mapValues(error.errors, ( messages ) => messages[0] ?? fallback);

    return Object.keys(fields).length ? fields : { _form: error.message || fallback };

}
