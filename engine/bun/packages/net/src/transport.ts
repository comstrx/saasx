import { anySignal, now, sleep, timeoutSignal } from "@engine/base";
import { Failure, isFailure, transient } from "@engine/error";
import { retryAfter } from "./headers.ts";

export type Transport = ( url: string, init: RequestInit ) => Promise<Response>;
export type SendOptions = {
    timeoutMs?: number | undefined;
    retries?: number | undefined;
    retryOn?: readonly number[] | undefined;
    signal?: AbortSignal | undefined;
    transport?: Transport | undefined;
    maxRetryAfter?: number | undefined;
};
export type Reply = { response: Response; ms: number; attempts: number };

const defaults = { timeoutMs: 10000, retries: 0, retryOn: [502, 503, 504], maxRetryAfter: 2 };

function base ( count: number ): number {

    return 150 * count + Math.random() * 100;

}
function failed ( error: unknown, signal: AbortSignal | undefined, timeout: AbortSignal ): Failure {

    if ( signal?.aborted ) return new Failure("aborted");

    if ( timeout.aborted ) return new Failure("timeout");

    return isFailure(error) ? error : new Failure("network", { cause: error });

}
function status ( response: Response, retryOn: readonly number[] ): void {

    if ( !retryOn.includes(response.status) ) return;

    throw new Failure("http", { status: response.status, retryAfter: retryAfter(response.headers.get("retry-after")) });

}
export async function send ( url: string, init: RequestInit, options: SendOptions = {} ): Promise<Reply> {

    const timeoutMs = options.timeoutMs ?? defaults.timeoutMs;
    const retries = options.retries ?? defaults.retries;
    const retryOn = options.retryOn ?? defaults.retryOn;
    const maxRetryAfter = options.maxRetryAfter ?? defaults.maxRetryAfter;
    const transport: Transport = options.transport ?? (( target, config ) => fetch(target, config));
    const started = now();

    for ( let attempt = 1; ; attempt += 1 ) {

        const timeout = timeoutSignal(timeoutMs);
        const signal = options.signal ? anySignal([options.signal, timeout]) : timeout;

        try {

            const response = await transport(url, { ...init, signal });

            if ( attempt <= retries ) status(response, retryOn);

            return { response, ms: now() - started, attempts: attempt };

        } catch ( error ) {

            const failure = failed(error, options.signal, timeout);
            const again = attempt <= retries && transient(failure) && (failure.retryAfter ?? 0) <= maxRetryAfter;

            if ( !again ) throw failure;

            await sleep(Math.max(base(attempt), (failure.retryAfter ?? 0) * 1000));

        }

    }

}
export async function readText ( response: Response, maxBytes: number ): Promise<string> {

    const length = Number(response.headers.get("content-length"));

    if ( Number.isFinite(length) && length > maxBytes )
        throw new Failure("response", { status: response.status, reason: "too_large" });

    const text = await response.text();

    if ( text.length > maxBytes ) throw new Failure("response", { status: response.status, reason: "too_large" });

    return text;

}
export async function readJson ( response: Response, maxBytes: number ): Promise<unknown> {

    const text = await readText(response, maxBytes);

    if ( !text ) return undefined;

    try {

        return JSON.parse(text) as unknown;

    } catch ( error ) {

        throw new Failure("response", { status: response.status, reason: "not_json", cause: error });

    }

}
