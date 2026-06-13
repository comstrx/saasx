import type { z } from "zod";
import { ApiError, type ApiErrorFields } from "@/api/error";
import { env } from "@/lib/env/client";

let config: ApiConfig = {};
let refreshing: Promise<boolean> | null = null;
const baseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiMeta = Record<string, unknown>;

export type ApiEntry<T = unknown> = {
    resource: string;
    action: string;
    method: ApiMethod;
    path: string;
    need?: string;
    schema?: z.ZodType<T>;
    bare?: true;
    guest?: true;
    credentials?: RequestCredentials;
};
export type ApiResult<T> = {
    data: T;
    meta?: ApiMeta;
};
export type RequestOptions = {
    params?: Record<string, string | number>;
    query?: Record<string, unknown>;
    body?: unknown;
    signal?: AbortSignal;
    idempotencyKey?: string;
    timeoutMs?: number;
};
export type ApiContext = {
    locale?: string;
    currency?: string;
    timezone?: string;
};
export type ApiConfig = {
    token?: () => string | null;
    refresh?: () => Promise<boolean>;
    context?: () => ApiContext;
    observe?: ( entry: ApiEntry, status: number, duration: number ) => void;
};

function uuid () {

    if ( typeof crypto !== "undefined" && "randomUUID" in crypto ) return crypto.randomUUID();

    return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

}
function safeJson ( text: string ) {

    try { return JSON.parse(text) as unknown; } catch { return undefined; }

}
function buildPath ( path: string, params: RequestOptions["params"] = {} ) {

    return path.replace(/:(\w+)/g, (_, name: string) => {

        const value = params[name];

        if ( value === undefined ) throw new Error(`Missing ":${name}" param for "${path}"`);

        return encodeURIComponent(String(value));

    });

}
function buildQuery ( query: RequestOptions["query"] = {} ) {

    const search = new URLSearchParams();

    for ( const [key, value] of Object.entries(query) ) {

        if ( value === undefined || value === null ) continue;

        if ( Array.isArray(value) ) {

            for ( const item of value ) search.append(`${key}[]`, String(item));
            continue;

        }

        search.append(key, String(value));

    }

    const text = search.toString();

    return text ? `?${text}` : "";

}
function buildHeaders <T> ( entry: ApiEntry<T>, options: RequestOptions, payload: boolean ) {

    const headers = new Headers({ Accept: "application/json" });
    const context = config.context?.() ?? {};
    const token = entry.guest ? null : config.token?.() ?? null;

    if ( payload ) headers.set("Content-Type", "application/json");
    if ( token ) headers.set("Authorization", `Bearer ${token}`);
    if ( options.idempotencyKey ) headers.set("Idempotency-Key", options.idempotencyKey);

    if ( context.locale ) headers.set("Accept-Language", context.locale);
    if ( context.currency ) headers.set("X-Currency", context.currency);
    if ( context.timezone ) headers.set("X-Timezone", context.timezone);

    return headers;

}

function invalidResponse <T> ( entry: ApiEntry<T>, status: number, reason: string ) {

    return new ApiError({ status, code: "invalid_response", message: `${entry.resource}.${entry.action}: ${reason}` });

}
function toApiError ( status: number, payload: unknown ) {

    const error = (payload as { error?: { code?: string; message?: string; fields?: ApiErrorFields } } | null)?.error;

    return new ApiError({
        status,
        code: error?.code ?? "http_error",
        message: error?.message ?? `Request failed with status ${status}`,
        fields: error?.fields,
    });

}
function validate <T> ( entry: ApiEntry<T>, status: number, data: unknown ): T {

    if ( !entry.schema ) return data as T;

    const parsed = entry.schema.safeParse(data);
    if ( !parsed.success ) throw invalidResponse(entry, status, "body does not match its schema");

    return parsed.data;

}
function cooldown ( header: string | null, signal?: AbortSignal ) {

    const seconds = Number(header);
    const wait = Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 10) * 1000 : 1000;

    return new Promise<void>((resolve, reject) => {

        if ( signal?.aborted ) return reject(signal.reason);

        const timer = setTimeout(resolve, wait);

        signal?.addEventListener("abort", () => {

            clearTimeout(timer);
            reject(signal.reason);

        }, { once: true });

    });

}
function refreshOnce () {

    if ( !config.refresh ) return Promise.resolve(false);

    refreshing ??= config.refresh().catch(() => false).finally(() => { refreshing = null; });

    return refreshing;

}

async function parse <T> ( entry: ApiEntry<T>, response: Response ): Promise<ApiResult<T>> {

    const text = await response.text();
    const payload = text ? safeJson(text) : null;

    if ( !response.ok ) throw toApiError(response.status, payload);
    if ( payload === undefined ) throw invalidResponse(entry, response.status, "body is not valid JSON");

    if ( entry.bare ) return { data: validate(entry, response.status, payload) };

    const envelope = (payload ?? {}) as { data?: unknown; meta?: ApiMeta };

    return { data: validate(entry, response.status, envelope.data), meta: envelope.meta };

}
async function execute <T> ( entry: ApiEntry<T>, options: RequestOptions ) {

    const url = baseUrl + buildPath(entry.path, options.params) + buildQuery(options.query);
    const payload = options.body !== undefined;
    const timeout = AbortSignal.timeout(options.timeoutMs ?? 15000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    const started = performance.now();

    try {

        const response = await fetch(url, {
            method: entry.method,
            headers: buildHeaders(entry, options, payload),
            body: payload ? JSON.stringify(options.body) : undefined,
            credentials: entry.credentials ?? "omit",
            signal,
        });

        config.observe?.(entry, response.status, performance.now() - started);

        return response;

    } catch ( error ) {

        config.observe?.(entry, 0, performance.now() - started);

        if ( options.signal?.aborted ) throw error;

        throw new ApiError({ status: 0, code: "network_error", message: "Network request failed" });

    }

}
async function recover <T> ( entry: ApiEntry<T>, options: RequestOptions, response: Response ) {

    if ( response.status === 401 && !entry.guest ) return refreshOnce();

    if ( response.status === 429 ) {

        await cooldown(response.headers.get("Retry-After"), options.signal);
        return true;

    }

    return false;

}

export function configure ( next: ApiConfig ) {

    if ( typeof window === "undefined" ) return;

    config = next;

}
export function queryKey ( entry: ApiEntry, options: RequestOptions = {} ) {

    return [entry.resource, entry.action, options.params ?? null, options.query ?? null] as const;

}
export async function request <T> ( entry: ApiEntry<T>, options: RequestOptions = {} ): Promise<ApiResult<T>> {

    if ( entry.method !== "GET" && !options.idempotencyKey ) options = { ...options, idempotencyKey: uuid() };

    const response = await execute(entry, options);
    const retried = await recover(entry, options, response);

    if ( !retried ) return parse(entry, response);
    void response.body?.cancel();

    return parse(entry, await execute(entry, options));

}
