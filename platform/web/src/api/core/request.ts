import { toFormData, type UploadLimits, uploadLimits } from "../../lib/std/form.ts";
import { isCurrency } from "../../lib/std/geo.ts";
import { isScalar, pathSet } from "../../lib/std/object.ts";
import { expandPath, isQuery, type Query, type QueryValue, templateKeys } from "../../lib/std/route.ts";
import { uuid } from "../../lib/std/security.ts";
import { hostname, joinUrl } from "../../lib/std/url.ts";
import type { ApiConfig } from "./config.ts";
import { ApiError, guarded } from "./error.ts";
import { type HeaderKey, requiredHeaders, type Wire } from "./wire.ts";

export type Context = Readonly<Partial<Record<HeaderKey, string>>>;
type Encoded = { url: URL; body?: Record<string, unknown> };
export type Target = { place: "query" | "body"; name: string };

type Parts = { params: Record<string, QueryValue>; query: Record<string, Query[string]>; body: Record<string, unknown> };
type Values = { language: string; currency?: string; host?: string; client?: string; front?: string; auth?: string; requestId?: string };

const forced = process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_DEV_TENANT : undefined;

export function resolveTenant ( host: string | undefined ): string {

    const tenant = forced || (host ? hostname(host) : undefined);

    if ( !tenant ) throw new ApiError("input");

    return tenant;

}
export function requestContext ( settings: Omit<ApiConfig["context"], "authCookie">, values: Values ): Context {

    return Object.freeze({
        language: values.language,
        currency: isCurrency(values.currency) ? values.currency : settings.currency,
        tenant: resolveTenant(values.host),
        host: values.host,
        client: values.client,
        front: values.front,
        spec: settings.spec,
        auth: values.auth,
        requestId: values.requestId ?? uuid(),
        accept: "application/json",
    });

}
export function requestHeaders ( mapping: Wire["request"]["headers"], context: Context, omitted: readonly HeaderKey[] = [] ): Headers {

    const headers = new Headers();

    for ( const [key, header] of Object.entries(mapping) as [HeaderKey, Wire["request"]["headers"][HeaderKey]][] ) {

        const value = context[key];

        if ( !header || omitted.includes(key) ) continue;
        if ( !value && requiredHeaders.includes(key) ) throw new ApiError("input");
        if ( value ) guarded(() => headers.set(header.name, `${header.prefix ?? ""}${value}`));

    }

    return headers;

}
export function target ( wire: Pick<Wire, "method" | "request">, key: string ): Target | null {

    const mapped = Object.hasOwn(wire.request.fields, key) ? wire.request.fields[key] : key;

    if ( mapped === null || mapped === undefined ) return null;

    const [, place, name = key] = /^(?:(query|body):)?(.*)$/.exec(mapped) ?? [];
    const fallback = wire.method === "GET" ? "query" : "body";

    return { place: place === "query" || place === "body" ? place : fallback, name };

}
function place ( wire: Wire, parts: Parts, params: readonly string[], key: string, value: unknown ): void {

    if ( params.includes(key) ) {

        if ( !isScalar(value) ) throw new TypeError(key);

        parts.params[key] = value;
        return;

    }

    const destination = target(wire, key);

    if ( destination?.place === "body" ) pathSet(parts.body, destination.name, value);
    if ( destination?.place !== "query" ) return;
    if ( !isQuery(value) ) throw new TypeError(key);

    parts.query[destination.name] = value;

}
function split ( wire: Wire, input: Record<string, unknown> ): Parts {

    const parts: Parts = { params: {}, query: {}, body: {} };
    const params = templateKeys(wire.path);

    for ( const [key, value] of Object.entries(input) ) {

        if ( value !== undefined ) place(wire, parts, params, key, value);

    }

    return parts;

}
function located ( wire: Wire, input: Record<string, unknown>, baseUrl: string ): Encoded {

    const { params, query, body } = split(wire, input);
    const url = joinUrl(baseUrl, expandPath(wire.path, params), query);

    return Object.keys(body).length ? { url, body } : { url };

}
function plain ( _key: string, item: unknown ): unknown {

    if ( item instanceof Blob ) throw new TypeError("Files require multipart encoding.");

    return item;

}
export function encode ( wire: Wire, input: Record<string, unknown>, baseUrl: string ): Encoded {

    return guarded(() => located(wire, input, baseUrl));

}
export function encodeBody (
    value: Record<string, unknown> | undefined,
    encoding: Wire["encoding"],
    limits: UploadLimits = uploadLimits,
): BodyInit | undefined {

    if ( !value ) return undefined;

    return guarded(() => (encoding === "multipart" ? toFormData(value, limits) : JSON.stringify(value, plain)));

}
