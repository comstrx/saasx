import type { z } from "../../lib/providers/schema.ts";
import { retryAfter, retryReads, type Transport } from "../../lib/std/fetch.ts";
import { type UploadLimits, uploadLimits } from "../../lib/std/form.ts";
import { mapValues } from "../../lib/std/object.ts";
import { uuid } from "../../lib/std/security.ts";
import { loopbackAlias } from "../../lib/std/url.ts";
import { type Endpoints, endpoints } from "../features/index.ts";
import type { Reachable } from "./config.ts";
import type { Endpoint } from "./dsl.ts";
import { ApiError, type Observer, type Outcome } from "./error.ts";
import { invalidate, rejectSession } from "./invalidation.ts";
import { type Context, encode, encodeBody, requestHeaders } from "./request.ts";
import { type ApiResult, decode, readJson } from "./response.ts";
import { type Contract, personalHeaders, type Wire } from "./wire.ts";

export type Execution = "server" | "client";
export type RequestOptions = { signal?: AbortSignal; idempotencyKey?: string; cache?: number };
export type ClientOptions = { execution?: Execution; transport?: typeof fetch; limits?: UploadLimits; observe?: Observer };
export type Result<E extends Endpoint> = ApiResult<E["many"] extends true ? z.output<E["output"]>[] : z.output<E["output"]>>;

type Call<E extends Endpoint> = Record<string, never> extends z.input<E["input"]>
    ? ( input?: z.input<E["input"]>, options?: RequestOptions ) => Promise<Result<E>>
    : ( input: z.input<E["input"]>, options?: RequestOptions ) => Promise<Result<E>>;

export type ApiClient = {
    [F in keyof Endpoints]: {
        [O in keyof Endpoints[F]]: Endpoints[F][O] extends Endpoint ? Call<Endpoints[F][O]> : never
    }
};
export type Operation = ( input?: unknown, options?: RequestOptions ) => Promise<ApiResult<unknown>>;
export type ApiSurface = Readonly<Record<string, Readonly<Record<string, Operation>>>>;

type Local = Record<string, unknown> | undefined;
type Target = { feature: string; endpoint: Endpoint; wire: Wire; local: Local; connection: Reachable };
type Signals = { signal?: AbortSignal; timeout: AbortSignal };
type Prepared = {
    url: URL;
    body?: Record<string, unknown>;
    headers: Headers;
    current: Context;
    mutation: boolean;
    lifetime: number;
};

type Setup = {
    settings: { connections: Readonly<Record<string, Reachable>> };
    contract: Contract;
    context: Context | (() => Context | Promise<Context>);
    execution: Execution;
    transport: Transport;
    limits: UploadLimits;
    observe?: Observer;
};

const catalogue: Record<string, Record<string, Endpoint>> = endpoints;

function locate ( { contract, settings }: Setup, feature: string, operation: string ) {

    const endpoint = catalogue[feature]?.[operation];
    const wire = contract.features[feature]?.[operation];

    if ( !endpoint || !wire ) throw new ApiError("input");
    if ( !wire.enabled && wire.restricted ) throw new ApiError("execution");

    return {
        endpoint,
        wire,
        local: endpoint.local ? contract.values[endpoint.local] : undefined,
        connection: wire.enabled ? settings.connections[wire.connection] : undefined,
    };

}
function offline ( local: Local ): ApiResult<unknown> {

    if ( !local ) throw new ApiError("configuration");

    return { resource: structuredClone(local), message: null, meta: { source: "local" } };

}
function lifetime ( setup: Setup, wire: Wire, current: Context, requested = wire.cache ): number {

    if ( !Number.isSafeInteger(requested) || requested < 0 || requested > 86400 ) throw new ApiError("input");

    return setup.execution === "server" && wire.method === "GET" && !current.auth ? requested : 0;

}
async function prepare (
    setup: Setup,
    { wire, endpoint }: Target,
    baseUrl: string,
    raw: unknown,
    options: RequestOptions,
    outcome: Outcome,
): Promise<Prepared> {

    const input = endpoint.input.safeParse(raw);

    if ( !input.success ) throw new ApiError("input", { cause: input.error });

    const current = typeof setup.context === "function" ? await setup.context() : setup.context;

    outcome.trace = current.requestId;

    const { url, body } = encode(wire, input.data, baseUrl);
    const key = options.idempotencyKey;
    const bodyKey = typeof input.data.idempotency_key === "string" ? input.data.idempotency_key : undefined;
    const mutation = wire.method !== "GET";
    const shared = lifetime(setup, wire, current, options.cache);

    if ( bodyKey && key && bodyKey !== key ) throw new ApiError("input");

    const headers = requestHeaders(wire.request.headers, {
        ...current,
        idempotency: mutation ? key ?? bodyKey ?? uuid() : undefined,
        requestId: uuid(),
        contentType: body && wire.encoding === "json" ? "application/json" : undefined,
    }, shared ? personalHeaders : []);

    return { url, body, headers, current, mutation, lifetime: shared };

}
function caching ( { lifetime: revalidate }: Prepared ): RequestInit {

    return revalidate ? { cache: "force-cache", next: { revalidate } } : { cache: "no-store" };

}
function failed ( setup: Setup, wire: Wire, current: Context, error: unknown, { signal, timeout }: Signals ): ApiError {

    if ( signal?.aborted ) return new ApiError("aborted");
    if ( timeout.aborted ) return new ApiError("timeout");
    if ( !(error instanceof ApiError) ) return new ApiError("network", { cause: error });
    if ( setup.execution === "client" && error.status === 401 && current.auth && wire.request.headers.auth ) rejectSession(current.auth);

    return error;

}
async function send ( setup: Setup, { feature, wire, endpoint, local, connection }: Target, prepared: Prepared, signal?: AbortSignal ) {

    const timeout = AbortSignal.timeout(connection.timeoutMs);
    const transport = retryReads(setup.transport, connection.retries);

    try {

        const response = await transport(prepared.url, {
            method: wire.method,
            headers: prepared.headers,
            body: encodeBody(prepared.body, wire.encoding, setup.limits),
            signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
            credentials: connection.credentials,
            redirect: "error",
            ...caching(prepared),
        });

        const received = { status: response.status, ok: response.ok, retryAfter: retryAfter(response.headers.get("retry-after")) };
        const alias = loopbackAlias(connection.baseUrl);
        const body = await readJson(response, connection.maxResponseBytes, { retryAfter: received.retryAfter }, alias);
        const result = decode(wire, endpoint, local, { ...received, body });

        if ( setup.execution === "client" && prepared.mutation ) invalidate(feature);

        return result;

    }
    catch ( error ) {

        throw failed(setup, wire, prepared.current, error, { signal, timeout });

    }

}
async function exchange (
    setup: Setup,
    feature: string,
    operation: string,
    raw: unknown,
    options: RequestOptions,
    outcome: Outcome,
): Promise<ApiResult<unknown>> {

    if ( options.signal?.aborted ) throw new ApiError("aborted");

    const { endpoint, wire, local, connection } = locate(setup, feature, operation);

    if ( !wire.enabled || !connection?.baseUrl ) return offline(local);
    if ( wire.execution !== "hybrid" && wire.execution !== setup.execution ) throw new ApiError("execution");

    const call: Target = { feature, endpoint, wire, local, connection };

    return send(setup, call, await prepare(setup, call, connection.baseUrl, raw, options, outcome), options.signal);

}
async function request (
    setup: Setup,
    feature: string,
    operation: string,
    raw: unknown = {},
    options: RequestOptions = {},
): Promise<ApiResult<unknown>> {

    const outcome: Outcome = { call: `${feature}.${operation}`, ms: 0 };
    const started = performance.now();

    try {

        const result = await exchange(setup, feature, operation, raw, options, outcome);

        setup.observe?.({ ...outcome, ms: performance.now() - started, request: result.meta.requestId });

        return result;

    }
    catch ( error ) {

        if ( error instanceof ApiError ) setup.observe?.({ ...outcome, ms: performance.now() - started, request: error.requestId, error });

        throw error;

    }

}
export function createSurface (
    settings: Setup["settings"],
    contract: Contract,
    context: Context | (() => Context | Promise<Context>),
    { execution = "server", transport = fetch, limits = uploadLimits, observe }: ClientOptions = {},
): ApiSurface {

    const setup: Setup = { settings, contract, context, execution, transport, limits, observe };

    return mapValues(catalogue, ( operations, feature ) => mapValues(operations, ( _, operation ) => {

        return ( input?: unknown, options?: RequestOptions ) => request(setup, feature, operation, input, options);

    }));

}
export function typed ( surface: ApiSurface ): ApiClient {

    return surface as ApiClient;

}
export function createApi ( ...parameters: Parameters<typeof createSurface> ): ApiClient {

    return typed(createSurface(...parameters));

}
