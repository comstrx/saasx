import { z } from "zod";
import { baseCurrency, envelope } from "@/api/contracts";
import type { UploadFile } from "@/std/file";
import type { Picture, Rung } from "@/std/picture";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const patience = 20000;

type ApiFields = Record<string, string[]>;

type Request<T> = {
    path: string;
    method?: Method;
    body?: unknown;
    schema?: z.ZodType<T>;
    idempotencyKey?: string;
    signal?: AbortSignal;
};

type Context = {
    baseUrl: string;
    tenant: string;
    locale: string;
    currency: string;
    token: string | null;
    viewer: number;
    onExpire: (() => void) | null;
};

const retryable = new Set([ "offline", "timeout", "server", "unavailable" ]);

export class ApiError extends Error {

    readonly code: string;
    readonly reason: string;
    readonly status: number;
    readonly fields: ApiFields | null;
    readonly data: unknown;
    readonly meta: Meta;

    constructor ( status: number, code: string, message: string, fields: ApiFields | null, data: unknown = null, reason = "", meta: Meta = {} ) {

        super(message);

        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.reason = reason || code;
        this.fields = fields;
        this.data = data;
        this.meta = meta;

    }
    get unauthenticated () {

        return this.code === "unauthenticated";

    }
    get identityRequired () {

        return this.code === "forbidden" && Boolean(this.fields?.identity);

    }
    get confirmable () {

        return this.reason === "verification_required" || Boolean(this.fields?.confirm_code);

    }
    get offline () {

        return this.code === "offline";

    }
    get throttled () {

        return this.code === "throttled";

    }
    get missing () {

        return this.code === "not_found" || this.code === "gone";

    }
    get transient () {

        return retryable.has(this.code);

    }
    get answered () {

        return this.status > 0;

    }
    get reference () {

        const id = this.meta.request_id;

        return this.status >= 500 && typeof id === "string" && id ? id : null;

    }

}

export const failureOf = ( reason: unknown ): ApiError =>
    reason instanceof ApiError ? reason : new ApiError(0, "offline", "", null);

let context: Context = {
    baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
    tenant: process.env.EXPO_PUBLIC_TENANT_DOMAIN ?? "",
    locale: "en",
    currency: baseCurrency,
    token: null,
    viewer: 0,
    onExpire: null,
};

const watchers = new Set<() => void>();

export const configure = ( patch: Partial<Context> ) => {

    context = { ...context, ...patch };

    for ( const watcher of watchers ) watcher();

};

export const observe = ( watcher: () => void ) => {

    watchers.add(watcher);

    return () => { watchers.delete(watcher); };

};

export const current = (): Readonly<Context> => context;

export const origin = () => context.baseUrl.replace(/\/v\d+\/?$/, "");

export const media = ( path: string | null | undefined ) => {

    if ( !path || /^https?:\/\//i.test(path) || path.startsWith("file:") ) return path ?? null;

    return `${ origin() }/storage/${ path.replace(/^\/+/, "") }`;

};

type Variants = Record<string, string | null | undefined> | null | undefined;

export const picture = ( path: string | null | undefined, variants?: Variants ): Picture | null => {

    const uri = media(path);

    if ( !uri ) return null;

    const rungs = Object.entries(variants ?? {})
        .flatMap(([ width, at ]): Rung[] => {

            const rung = media(at);
            const span = Number(width);

            return rung && span > 0 ? [ { uri: rung, width: span } ] : [];

        })
        .sort(( first, second ) => first.width - second.width );

    return { uri, rungs };

};

const headers = ( key: string | undefined, hasBody: boolean ) => {

    const map: Record<string, string> = {
        "Accept": "application/json",
        "X-Currency": context.currency,
        "Locale": context.locale,
    };

    if ( context.tenant ) map["X-Tenant-Domain"] = context.tenant;

    if ( hasBody ) map["Content-Type"] = "application/json";
    if ( key ) map["Idempotency-Key"] = key;
    if ( context.token ) map.Authorization = `Bearer ${ context.token }`;

    return map;

};

export const credentials = () => headers(undefined, false);

type Meta = Record<string, unknown>;

type Paged<T> = {
    data: T;
    meta: Meta;
};

type Answer = {
    status: number;
    ok: boolean;
    json: () => Promise<unknown>;
};

const passthrough = <T>() => z.unknown() as unknown as z.ZodType<T>;

async function reach ( path: string, init: RequestInit, signal: AbortSignal | undefined ): Promise<Response> {

    const guard = new AbortController();
    const timer = setTimeout(() => guard.abort(), patience);

    signal?.addEventListener("abort", () => guard.abort());

    try {

        return await fetch(`${ context.baseUrl }/${ path.replace(/^\/+/, "") }`, { ...init, signal: guard.signal });

    }
    catch {

        throw new ApiError(0, signal?.aborted ? "cancelled" : "offline", "", null);

    }
    finally {

        clearTimeout(timer);

    }

}

async function unwrap<T> ( response: Answer, schema: z.ZodType<T> | undefined ): Promise<Paged<T>> {

    const payload = await response.json().catch(() => null );
    const parsed = envelope(schema ?? passthrough<T>()).safeParse(payload);

    if ( !parsed.success ) throw new ApiError(response.status, response.ok ? "server" : "unavailable", JSON.stringify(parsed.error.issues.slice(0,6)), null);

    const result = parsed.data;

    if ( !result.status ) {

        const failure = new ApiError(response.status, result.code, result.message, result.errors ?? null, result.data, result.reason ?? "", result.meta ?? {});

        if ( failure.unauthenticated ) context.onExpire?.();

        throw failure;

    }

    return { data: result.data as T, meta: result.meta ?? {} };

}

export async function call<T> ( request: Request<T> ): Promise<T> {

    const { data } = await paged(request);

    return data;

}

const leaf = z.object({
    page: z.number().nullable().optional(),
    pages: z.number().nullable().optional(),
    total: z.number().nullable().optional(),
});

export type Page<T> = {
    rows: T;
    page: number;
    pages: number;
    total: number;
    meta: Meta;
};

export async function page<T> ( request: Request<T>, at: number ): Promise<Page<T>> {

    const answer = await paged({ ...request, path: `${ request.path }${ request.path.includes("?") ? "&" : "?" }page=${ at }` });
    const read = leaf.safeParse(answer.meta);
    const current = read.success ? read.data.page ?? at : at;

    return {
        rows: answer.data,
        page: current,
        pages: read.success ? read.data.pages ?? current : current,
        total: read.success ? read.data.total ?? 0 : 0,
        meta: answer.meta,
    };

}

export async function paged<T> ({ path, method = "GET", body, schema, idempotencyKey, signal }: Request<T> ): Promise<Paged<T>> {

    const hasBody = body !== undefined;

    const response = await reach(path, {
        method,
        headers: headers(idempotencyKey, hasBody),
        body: hasBody ? JSON.stringify(body) : null,
    }, signal);

    return unwrap(response, schema);

}

type UploadRequest<T> = Omit<Request<T>, "body"> & {
    fields?: Record<string, string | number | boolean | null | undefined>;
    field?: string;
    files: readonly UploadFile[];
};

function transmit ( path: string, method: string, body: FormData, head: Record<string, string>, signal: AbortSignal | undefined ): Promise<Answer> {

    return new Promise(( resolve, reject ) => {

        const request = new XMLHttpRequest();

        request.open(method, `${ context.baseUrl }/${ path.replace(/^\/+/, "") }`);

        for ( const [ name, value ] of Object.entries(head) ) request.setRequestHeader(name, value);

        request.timeout = patience;

        request.onload = () => resolve({
            status: request.status,
            ok: request.status >= 200 && request.status < 300,
            json: async () => JSON.parse(request.responseText) as unknown,
        });

        request.onerror = () => reject(new Error("transport"));
        request.ontimeout = () => reject(new Error("timeout"));
        request.onabort = () => reject(new Error("aborted"));

        signal?.addEventListener("abort", () => request.abort());

        request.send(body);

    });

}

export async function upload<T> ({ path, method = "POST", fields = {}, field = "files[]", files, schema, idempotencyKey, signal }: UploadRequest<T> ): Promise<T> {

    const body = new FormData();

    for ( const [ name, value ] of Object.entries(fields) ) {

        if ( value !== undefined && value !== null ) body.append(name, String(value));

    }

    for ( const file of files ) body.append(field, file as unknown as Blob);

    const response = await transmit(path, method, body, headers(idempotencyKey, false), signal)
        .catch(() => { throw new ApiError(0, signal?.aborted ? "cancelled" : "offline", "", null); });

    const { data } = await unwrap(response, schema);

    return data;

}
