import { clone, mapValues, now, uuid } from "engine/base";
import { dedupe } from "engine/cache";
import { Failure } from "engine/error";
import { readJson, retryAfter, send, type Transport } from "engine/net";
import { issuesOf, rulesOf, type z } from "engine/validate";
import type { Connection } from "./config.ts";
import type { Catalogue, Endpoint } from "./dsl.ts";
import type { Observer, Outcome } from "./observe.ts";
import { type Context, encode, encodeBody, requestHeaders } from "./request.ts";
import { type ApiResult, decode } from "./response.ts";
import { type Contract, personalHeaders, type Wire } from "./wire.ts";

export type Execution = "server" | "client";
export type RequestOptions = {
    signal?: AbortSignal | undefined;
    idempotencyKey?: string | undefined;
    cache?: number | undefined;
};
export type Caching = ( lifetime: number ) => Record<string, unknown>;
export type ClientOptions = {
    execution?: Execution;
    transport?: Transport;
    observe?: Observer | undefined;
    onFailure?: (( failure: Failure ) => void) | undefined;
    caching?: Caching | undefined;
    share?: boolean | undefined;
};
export type Result<E extends Endpoint> = ApiResult<
    E["many"] extends true ? z.output<E["output"]>[] : z.output<E["output"]>
>;
export type Operation = ( input?: unknown, options?: RequestOptions ) => Promise<ApiResult<unknown>>;
export type ApiSurface = Readonly<Record<string, Readonly<Record<string, Operation>>>>;
export type Caller = ( feature: string, operation: string, input?: unknown, options?: RequestOptions ) => Promise<ApiResult<unknown>>;
export type Call<E extends Endpoint> =
    Record<string, never> extends z.input<E["input"]>
        ? ( input?: z.input<E["input"]>, options?: RequestOptions ) => Promise<Result<E>>
        : ( input: z.input<E["input"]>, options?: RequestOptions ) => Promise<Result<E>>;
export type ApiClient<C extends Catalogue> = {
    [F in keyof C]: { [O in keyof C[F]]: C[F][O] extends Endpoint ? Call<C[F][O]> : never };
};
export type Settings = { connections: Readonly<Record<string, Connection>> };
export type ContextSource = Context | (() => Context | Promise<Context>);

type Local = Record<string, unknown> | undefined;
type Target = { feature: string; endpoint: Endpoint; wire: Wire; local: Local; connection: Connection };
type Setup = {
    catalogue: Catalogue;
    settings: Settings;
    contract: Contract;
    context: ContextSource;
    execution: Execution;
    transport: Transport | undefined;
    observe: Observer | undefined;
    onFailure: (( failure: Failure ) => void) | undefined;
    caching: Caching;
    inflight: ReturnType<typeof dedupe<ApiResult<unknown>>> | undefined;
};

const maxLifetime = 86400;
const caching: Caching = ( lifetime ) => ({ cache: lifetime ? "force-cache" : "no-store" });

function locate ( { catalogue, contract, settings }: Setup, feature: string, operation: string ) {

    const endpoint = catalogue[feature]?.[operation];
    const wire = contract.features[feature]?.[operation];

    if ( !endpoint || !wire )
        throw new Failure("input", { reason: "unknown_operation", message: `${feature}.${operation}` });

    const local = endpoint.local ? contract.values[endpoint.local] : undefined;
    const connection = wire.enabled ? settings.connections.primary : undefined;

    return { endpoint, wire, local, connection };

}
function offline ( local: Local ): ApiResult<unknown> {

    if ( !local ) throw new Failure("configuration", { reason: "no_backend" });

    return { resource: clone(local), message: null, meta: { source: "local" } };

}
function lifetime ( setup: Setup, wire: Wire, current: Context, requested = wire.cache ): number {

    if ( !Number.isSafeInteger(requested) || requested < 0 || requested > maxLifetime )
        throw new Failure("input", { reason: "invalid_cache" });

    return setup.execution === "server" && wire.method === "GET" && !current.auth ? requested : 0;

}
async function exchange (
    setup: Setup,
    feature: string,
    operation: string,
    raw: unknown,
    options: RequestOptions,
    outcome: Outcome,
) {

    if ( options.signal?.aborted ) throw new Failure("aborted");

    const { endpoint, wire, local, connection } = locate(setup, feature, operation);

    if ( !wire.enabled || !connection?.baseUrl ) return offline(local);

    if ( wire.execution !== "hybrid" && wire.execution !== setup.execution )
        throw new Failure("execution", { reason: "wrong_side" });

    const input = endpoint.input.safeParse(raw, { reportInput: true });

    if ( !input.success )
        throw new Failure("input", {
            reason: "invalid_input",
            errors: issuesOf(input.error),
            issues: rulesOf(input.error),
        });

    const current = typeof setup.context === "function" ? await setup.context() : setup.context;

    outcome.trace = current.requestId;

    const { url, body } = encode(wire, input.data, connection.baseUrl);
    const mutation = wire.method !== "GET";
    const shared = lifetime(setup, wire, current, options.cache);
    const headers = requestHeaders(
        wire.request.headers,
        {
            ...current,
            idempotency: mutation ? (options.idempotencyKey ?? uuid()) : undefined,
            requestId: uuid(),
            contentType: body && wire.encoding === "json" ? "application/json" : undefined,
        },
        shared ? personalHeaders : [],
    );
    const init = {
        method: wire.method,
        headers,
        body: encodeBody(body, wire.encoding) ?? null,
        credentials: connection.credentials,
        redirect: "error",
        ...setup.caching(shared),
    } as RequestInit;
    const idempotent = !mutation || headers.has(wire.request.headers.idempotency?.name ?? "");
    const perform = async (): Promise<ApiResult<unknown>> => {

        const { response } = await send(String(url), init, {
            timeoutMs: connection.timeoutMs,
            retries: idempotent ? connection.retries : 0,
            retryOn: connection.retryOn,
            signal: options.signal,
            transport: setup.transport,
        });
        const wait = retryAfter(response.headers.get("retry-after"));
        const payload = await readJson(response, connection.maxResponseBytes);
        const target: Target = { feature, endpoint, wire, local, connection };

        return decode(target.wire, target.endpoint, target.local, {
            status: response.status,
            ok: response.ok,
            retryAfter: wait,
            body: payload,
        });

    };

    if ( mutation || !setup.inflight ) return perform();

    return setup.inflight(`${String(url)}|${current.auth ?? ""}|${current.language}|${current.currency}`, perform);

}
async function request (
    setup: Setup,
    feature: string,
    operation: string,
    raw: unknown = {},
    options: RequestOptions = {},
) {

    const outcome: Outcome = { call: `${feature}.${operation}`, ms: 0 };
    const started = now();

    try {

        const result = await exchange(setup, feature, operation, raw, options, outcome);

        setup.observe?.({ ...outcome, ms: now() - started, request: result.meta.requestId });

        return result;

    } catch ( error ) {

        if ( error instanceof Failure ) {

            setup.observe?.({ ...outcome, ms: now() - started, request: error.requestId, error });
            setup.onFailure?.(error);

        }

        throw error;

    }

}
export function surfaceOf ( catalogue: Catalogue, call: Caller ): ApiSurface {

    return mapValues(catalogue, ( operations, feature ) => mapValues(operations, ( _, operation ) => {

        return ( input?: unknown, options?: RequestOptions ) => call(feature, operation, input, options);

    }));

}
export function createSurface (
    catalogue: Catalogue,
    settings: Settings,
    contract: Contract,
    context: ContextSource,
    { execution = "server", transport, observe, onFailure, caching: cache = caching, share = true }: ClientOptions = {},
): ApiSurface {

    const setup: Setup = {
        catalogue,
        settings,
        contract,
        context,
        execution,
        transport,
        observe,
        onFailure,
        caching: cache,
        inflight: share ? dedupe<ApiResult<unknown>>() : undefined,
    };

    return surfaceOf(catalogue, ( feature, operation, input, options ) => request(setup, feature, operation, input, options));

}
export function createApi<const C extends Catalogue> (
    catalogue: C,
    settings: Settings,
    contract: Contract,
    context: ContextSource,
    options: ClientOptions = {},
): ApiClient<C> {

    return createSurface(catalogue, settings, contract, context, options) as ApiClient<C>;

}
