import { errorFacts, type Facts, type Level } from "../../lib/std/log.ts";
import type { Confirmation } from "./response.ts";

const statuses = {
    configuration: 503,
    input: 400,
    network: 502,
    timeout: 504,
    aborted: 499,
    http: 502,
    response: 502,
    execution: 403,
};

export type ApiFailure = keyof typeof statuses;
export type FailureDetail = {
    status?: number;
    errors?: Record<string, string[]>;
    reason?: string;
    code?: string;
    confirmation?: Confirmation;
    retryAfter?: number;
    requestId?: string;
    resource?: unknown;
    cause?: unknown;
};

export type Outcome = { call: string; ms: number; trace?: string; request?: string; error?: ApiError };
export type Observer = ( outcome: Outcome ) => void;
export type Report = { level: Level; event: string; facts: Facts };

export class ApiError extends Error {

    readonly status: number;
    readonly kind: ApiFailure;
    readonly errors: Record<string, string[]>;
    readonly reason?: string;
    readonly code?: string;
    readonly confirmation?: Confirmation;
    readonly retryAfter?: number;
    readonly requestId?: string;
    readonly resource?: unknown;

    constructor ( kind: ApiFailure, { status = 0, errors = {}, ...detail }: FailureDetail = {} ) {

        const failure = status >= 400 && status <= 599 ? status : statuses[kind];

        super(`API ${kind} (${failure})`, detail.cause === undefined ? undefined : { cause: detail.cause });

        this.name = "ApiError";
        this.status = failure;
        this.kind = kind;
        this.errors = errors;
        this.reason = detail.reason;
        this.code = detail.code;
        this.confirmation = detail.confirmation;
        this.retryAfter = detail.retryAfter;
        this.requestId = detail.requestId;
        this.resource = detail.resource;

    }

}

export function transient ( error: unknown ): boolean {

    return error instanceof ApiError && (error.kind === "network" || error.kind === "timeout" || error.status >= 500);

}
export function guarded<T> ( run: () => T ): T {

    try { return run(); }
    catch ( error ) { throw error instanceof ApiError ? error : new ApiError("input", { cause: error }); }

}
function severity ( error: ApiError ): Level | undefined {

    if ( error.kind === "aborted" || error.kind === "configuration" ) return undefined;
    if ( ["network", "timeout", "input"].includes(error.kind) || error.status === 429 ) return "warn";

    return error.kind !== "http" || error.status >= 500 ? "error" : undefined;

}
export function reportOf ( { call, ms, trace, request, error }: Outcome, slow: number ): Report | undefined {

    const time = Math.round(ms);

    if ( !error ) return time >= slow ? { level: "warn", event: "api.slow", facts: { call, ms: time, trace, request } } : undefined;

    const level = severity(error);

    if ( !level ) return undefined;

    const { kind, status, reason, code, retryAfter } = error;
    const cause = errorFacts(error).cause;

    return { level, event: "api.failure", facts: { call, ms: time, kind, status, reason, code, retryAfter, trace, request, cause } };

}
export function failureReference ( error: unknown ): string | null {

    if ( !(error instanceof ApiError) || !error.requestId ) return null;

    return `REQ-${error.requestId.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`;

}
