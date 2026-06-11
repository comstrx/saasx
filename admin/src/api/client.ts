import { z } from "zod";
import { env } from "@/lib/env";
import { ApiError } from "./error";
import type { ApiEntry, Method } from "./resource";

type RequestOptions = {
    params?: Record<string, string>;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    signal?: AbortSignal;
};

type ApiResult<T> = {
    data: T;
    meta?: Record<string, unknown>;
};

const successEnvelope = z.object({
    data: z.unknown(),
    meta: z.record(z.string(), z.unknown()).optional(),
});

const failureEnvelope = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
        fields: z.record(z.string(), z.array(z.string())).optional(),
    }),
});

const sleep = ( ms: number ) => new Promise((resolve) => setTimeout(resolve, ms));

const compile = ( path: string, params: Record<string, string> = {} ) =>
    path.replace(/:(\w+)/g, (match, key: string) => {

        const value = params[key];

        if ( value === undefined ) throw new Error(`missing path param ${match} for ${path}`);

        return encodeURIComponent(value);

    });

const withQuery = ( url: string, query: RequestOptions["query"] ) => {

    if ( !query ) return url;

    const search = new URLSearchParams();

    for ( const [key, value] of Object.entries(query) ) {

        if ( value !== undefined ) search.set(key, String(value));

    }

    const qs = search.toString();

    return qs ? `${url}?${qs}` : url;

};

const toApiError = ( status: number, payload: unknown ) => {

    const parsed = failureEnvelope.safeParse(payload);

    if ( !parsed.success ) return new ApiError({ status, code: "invalid_response", message: "malformed error response" });

    const { code, message, fields } = parsed.data.error;

    return new ApiError({ status, code, message, fields });

};

const send = async ( url: string, method: Method, opts: RequestOptions, attempt = 0 ): Promise<Response> => {

    let response: Response;

    try {

        response = await fetch(url, {
            method,
            credentials: "include",
            signal: opts.signal,
            headers: opts.body === undefined ? undefined : { "Content-Type": "application/json" },
            body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        });

    } catch (cause) {

        if ( opts.signal?.aborted ) throw cause;

        throw new ApiError({ status: 0, code: "network_error", message: "connection failed" });

    }

    if ( response.status === 429 && attempt === 0 ) {

        const seconds = Number(response.headers.get("Retry-After") ?? 1);

        await sleep(seconds * 1000);

        return send(url, method, opts, 1);

    }

    return response;

};

export async function request<T>( entry: ApiEntry<T>, opts: RequestOptions = {} ): Promise<ApiResult<T>> {

    const url = withQuery(`${env.NEXT_PUBLIC_API_URL}${compile(entry.path, opts.params)}`, opts.query);
    const response = await send(url, entry.method, opts);
    const payload: unknown = await response.json().catch(() => null);

    if ( !response.ok ) throw toApiError(response.status, payload);

    const invalid = ( message: string ) => new ApiError({ status: response.status, code: "invalid_response", message });

    const envelope = successEnvelope.safeParse(payload);

    if ( !envelope.success ) throw invalid("malformed success envelope");

    if ( !entry.schema ) return { data: envelope.data.data as T, meta: envelope.data.meta };

    const parsed = entry.schema.safeParse(envelope.data.data);

    if ( !parsed.success ) throw invalid("response shape mismatch");

    return { data: parsed.data, meta: envelope.data.meta };

}
