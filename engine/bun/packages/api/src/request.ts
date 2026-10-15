import { isScalar, pathSet, uuid } from "engine/base";
import { Failure, guarded } from "engine/error";
import { toFormData } from "engine/file";
import { hostname, joinUrl } from "engine/net";
import { expandTemplate, isQuery, type Query, type QueryValue, templateKeys } from "engine/parse";
import { currency as currencyShape } from "engine/validate";
import type { ApiConfig } from "./config.ts";
import { type HeaderKey, requiredHeaders, type Wire } from "./wire.ts";

export type Context = Readonly<Partial<Record<HeaderKey, string | undefined>>>;
export type Target = { place: "query" | "body"; name: string };
export type Encoded = { url: URL; body?: Record<string, unknown> | undefined };
export type ContextValues = {
    language: string;
    currency?: string | undefined;
    tenant?: string | undefined;
    host?: string | undefined;
    client?: string | undefined;
    auth?: string | undefined;
    requestId?: string | undefined;
};

type Parts = {
    params: Record<string, QueryValue>;
    query: Record<string, Query[string]>;
    body: Record<string, unknown>;
};

export function resolveTenant ( host: string | undefined ): string | undefined {

    return host ? hostname(host) : undefined;

}
export function requestContext (
    settings: Pick<ApiConfig["context"], "currency" | "tenant">,
    values: ContextValues,
): Context {

    const currency = currencyShape.safeParse(values.currency).success ? values.currency : settings.currency;

    return Object.freeze({
        accept: "application/json",
        language: values.language,
        currency,
        tenant: values.tenant ?? settings.tenant ?? resolveTenant(values.host),
        client: values.client,
        auth: values.auth,
        requestId: values.requestId ?? uuid(),
    });

}
export function requestHeaders (
    mapping: Wire["request"]["headers"],
    context: Context,
    omitted: readonly HeaderKey[] = [],
): Headers {

    const headers = new Headers();

    for ( const [key, header] of Object.entries(mapping) as [HeaderKey, Wire["request"]["headers"][HeaderKey]][] ) {

        const value = context[key];

        if ( !header || omitted.includes(key) ) continue;
        if ( !value && requiredHeaders.includes(key) ) throw new Failure("input", { reason: `missing_${key}` });
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

        if ( !isScalar(value) ) throw new Failure("input", { reason: `invalid_${key}` });

        parts.params[key] = value;

        return;

    }

    const destination = target(wire, key);

    if ( destination?.place === "body" ) pathSet(parts.body, destination.name, value);
    if ( destination?.place !== "query" ) return;
    if ( !isQuery(value) ) throw new Failure("input", { reason: `invalid_${key}` });

    parts.query[destination.name] = value;

}
function split ( wire: Wire, input: Record<string, unknown> ): Parts {

    const parts: Parts = { params: {}, query: {}, body: {} };
    const params = templateKeys(wire.path);

    for ( const [key, value] of Object.entries(input) ) if ( value !== undefined ) place(wire, parts, params, key, value);

    return parts;

}
export function encode ( wire: Wire, input: Record<string, unknown>, baseUrl: string ): Encoded {

    return guarded(() => {

        const { params, query, body } = split(wire, input);
        const url = joinUrl(baseUrl, expandTemplate(wire.path, params), query);

        return Object.keys(body).length ? { url, body } : { url };

    });

}
export function encodeBody (
    value: Record<string, unknown> | undefined,
    encoding: Wire["encoding"],
): RequestInit["body"] | undefined {

    if ( !value ) return undefined;

    return guarded(() => (encoding === "multipart" ? toFormData(value) : JSON.stringify(value)));

}
