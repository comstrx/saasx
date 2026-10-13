import { isRecord } from "@engine/base";

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
export type Detail = {
    status?: number | undefined;
    errors?: FieldErrors | undefined;
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

/**
 * The one failure every layer throws and every caller reads: a kind, an HTTP-shaped status,
 * optional machine codes, field errors and the cause that produced it.
 */
export class Failure extends Error {
    readonly kind: Kind;
    readonly status: number;
    readonly errors: FieldErrors;
    readonly reason: string | undefined;
    readonly code: string | undefined;
    readonly retryAfter: number | undefined;
    readonly requestId: string | undefined;

    constructor(kind: Kind, { status = 0, errors = {}, message, ...detail }: Detail = {}) {
        const resolved = status >= lowest && status <= highest ? status : kinds[kind];

        super(message ?? `${kind} (${resolved})`, detail.cause === undefined ? undefined : { cause: detail.cause });

        this.name = "Failure";
        this.kind = kind;
        this.status = resolved;
        this.errors = errors;
        this.reason = detail.reason;
        this.code = detail.code;
        this.retryAfter = detail.retryAfter;
        this.requestId = detail.requestId;
    }

    facts(): Facts {
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

export function isFailure(value: unknown): value is Failure {
    return value instanceof Failure;
}
/**
 * Whether a retry could succeed: a transport problem, a timeout, a server error or a rate limit.
 */
export function transient(error: unknown): boolean {
    if (!isFailure(error)) return false;

    return (
        error.kind === "network" || error.kind === "timeout" || error.status >= serverFloor || error.status === tooMany
    );
}
/**
 * Whether the failure is final for this input: nothing on our side will change the answer.
 */
export function settled(error: unknown): boolean {
    return isFailure(error) && (error.kind === "configuration" || error.kind === "missing" || error.kind === "denied");
}
/**
 * Runs `work` and turns anything thrown that is not already a failure into one of the given kind.
 */
export function guarded<T>(work: () => T, kind: Kind = "input"): T {
    try {
        return work();
    } catch (error) {
        throw isFailure(error) ? error : new Failure(kind, { cause: error });
    }
}
export async function attempt<T>(work: () => Promise<T>, kind: Kind = "unknown"): Promise<T> {
    try {
        return await work();
    } catch (error) {
        throw isFailure(error) ? error : new Failure(kind, { cause: error });
    }
}
/**
 * Reads any thrown value as a failure without throwing: unknown values become `unknown` failures.
 */
export function failureOf(error: unknown): Failure {
    if (isFailure(error)) return error;
    if (error instanceof Error) return new Failure("unknown", { message: error.message, cause: error });
    if (isRecord(error) && typeof error.message === "string")
        return new Failure("unknown", { message: error.message, cause: error });

    return new Failure("unknown", { message: String(error), cause: error });
}
/**
 * Plain facts of an error and its causes, safe to log.
 */
export function describe(error: unknown, depth = 0): Record<string, unknown> {
    if (!(error instanceof Error)) return { message: String(error) };

    const facts: Record<string, unknown> = { name: error.name, message: error.message };

    if (isFailure(error)) Object.assign(facts, error.facts());
    if (isRecord(error) && typeof error.code === "string") facts.code = error.code;
    if (depth < 3 && error.cause !== undefined) facts.cause = describe(error.cause, depth + 1);

    return facts;
}
/**
 * A short reference a person can quote from a screen: the request id, or nothing.
 */
export function reference(error: unknown): string | null {
    if (!isFailure(error) || !error.requestId) return null;

    return `REQ-${error.requestId
        .replace(/[^a-z0-9]/gi, "")
        .slice(0, 8)
        .toUpperCase()}`;
}
/**
 * A form's view of a failure: one message per field, or one `_form` message when the failure
 * carries no field errors; strangers get the fallback.
 */
export function formErrors(error: unknown, fallback: string): Record<string, string> {
    if (!isFailure(error)) return { _form: fallback };

    const fields = Object.fromEntries(
        Object.entries(error.errors).map(([key, messages]) => [key, messages[0] ?? fallback]),
    );

    return Object.keys(fields).length ? fields : { _form: error.message || fallback };
}
