import { z } from "../../lib/providers/schema.ts";
import { readText } from "../../lib/std/fetch.ts";
import { isRecord, pathGet } from "../../lib/std/object.ts";
import { identifier } from "../../lib/std/security.ts";
import { type Alias, rewriteAlias } from "../../lib/std/url.ts";
import type { Endpoint } from "./dsl.ts";
import { ApiError, type FailureDetail } from "./error.ts";
import { channel } from "./fields.ts";
import { target } from "./request.ts";
import { parseResource } from "./resource.ts";
import type { Envelope, Wire } from "./wire.ts";

const names = z.array(z.string()).nullish().transform(( value ) => value ?? []);
const measure = z.union([z.number(), z.string()]).nullable();
const rows = z.array(z.record(z.string(), z.unknown()));

const paginationShape = z.object({
    page: z.number().int().positive().nullable().default(null),
    limit: z.number().int().positive().nullable().default(null),
    total: z.number().int().nonnegative().nullable().default(null),
    pages: z.number().int().nonnegative().nullable().default(null),
    paged: z.boolean().nullable().default(null),
});
const supportsShape = z.object({
    filters: names,
    sorts: names,
    sortable: keyed(z.string().nullable()),
    facets: names,
    stats: names,
    metrics: names,
    groups: names,
    series: names,
});
const aggregatesShape = z.object({
    facets: keyed(keyed(z.number())),
    stats: keyed(z.object({ min: measure, max: measure, avg: measure, sum: measure })),
    metrics: keyed(measure),
    groups: keyed(rows),
    series: keyed(rows),
});
const confirmationShape = z.object({
    channel: channel.nullish(),
    destination: z.string().max(200).nullish(),
    length: z.number().int().min(1).max(20).nullish(),
    expiresIn: z.number().int().min(0).max(86400).nullish(),
    retryAfter: z.number().int().min(0).max(86400).nullish(),
    sent: z.boolean().nullish(),
});

export type Pagination = z.output<typeof paginationShape>;
export type Confirmation = z.output<typeof confirmationShape>;
type Supports = z.output<typeof supportsShape>;
type Aggregates = z.output<typeof aggregatesShape>;
type Reply = { body: unknown; status: number; ok: boolean; retryAfter?: number };

export type ApiResult<T> = {
    resource: T;
    message: string | null;
    meta: { source: "local" | "remote"; requestId?: string; pagination?: Pagination; supports?: Supports; aggregates?: Aggregates };
};

type Local = Record<string, unknown> | undefined;
type Decoded = { resource: unknown; pagination?: Pagination };

const nullable = new WeakMap<z.ZodType, boolean>();

function keyed<T extends z.ZodType> ( value: T ) {

    return z.union([z.record(z.string(), value), z.array(z.never())]).nullish().transform(( entries ): Record<string, z.output<T>> => {

        return entries && !Array.isArray(entries) ? entries : {};

    });

}
function read ( body: unknown, path: string | null, max: number, pattern = /^[\s\S]*$/ ): string | undefined {

    const value = path ? pathGet(body, path) : undefined;

    return typeof value === "string" && value.length <= max && pattern.test(value) ? value : undefined;

}
function locate ( body: unknown, mapping: Record<string, string> ): Record<string, unknown> {

    const entries = Object.entries(mapping).map(( [key, path] ) => [key, pathGet(body, path)]);

    return Object.fromEntries(entries.filter(( [, value] ) => value !== undefined));

}
function wireName ( wire: Wire, key: string ): string {

    return target({ ...wire, method: "POST" }, key)?.name ?? key;

}
function failures ( wire: Wire, endpoint: Endpoint, body: unknown ): Record<string, string[]> {

    const raw = wire.response.errors ? pathGet(body, wire.response.errors) : undefined;
    const errors: Record<string, string[]> = {};

    if ( !isRecord(raw) ) return errors;

    const names = Object.keys(endpoint.input.shape).map(( key ) => ({ key, name: wireName(wire, key) }));

    for ( const [key, messages] of Object.entries(raw) ) {

        const semantic = names.find(( item ) => key === item.name || key.startsWith(`${item.name}.`))?.key ?? "_form";
        const valid = Array.isArray(messages) && messages.every(( value ) => typeof value === "string" && value.length <= 500);

        if ( valid ) errors[semantic] = [...errors[semantic] ?? [], ...messages].slice(0, 10);

    }

    return errors;

}
function confirmation ( envelope: Envelope, body: unknown ): Confirmation | undefined {

    if ( !envelope.confirmation || !isRecord(body) ) return undefined;

    const decoded = confirmationShape.safeParse(locate(body, envelope.confirmation));

    return decoded.success && Object.keys(decoded.data).length ? decoded.data : undefined;

}
function acceptsNull ( schema: z.ZodType ): boolean {

    const known = nullable.get(schema) ?? schema.safeParse(null).success;

    nullable.set(schema, known);

    return known;

}
function project ( value: unknown, endpoint: Endpoint, envelope: Envelope, local: Local ): unknown {

    const output = endpoint.output;

    if ( !(output instanceof z.ZodObject) ) return output.parse(value);
    if ( !isRecord(value) ) throw new TypeError("Expected an object response.");

    const picked: Record<string, unknown> = { ...local };

    for ( const [key, schema] of Object.entries(output.shape as Record<string, z.ZodType>) ) {

        const item = pathGet(value, envelope.fields[key] ?? key);

        if ( item === undefined || (item === null && !acceptsNull(schema)) ) continue;

        picked[key] = item;

    }

    return endpoint.local ? parseResource(endpoint.local, picked) : output.parse(picked);

}
function vacant ( data: unknown, status: number ): boolean {

    return data === null || (Array.isArray(data) && data.length === 0) || status === 204 || status === 205;

}
function verify ( envelope: Envelope, reply: Reply, errors: Record<string, string[]> ): void {

    const detail = {
        code: read(reply.body, envelope.code, 100, identifier),
        reason: read(reply.body, envelope.reason, 100, identifier),
        confirmation: confirmation(envelope, reply.body),
        retryAfter: reply.retryAfter,
        requestId: read(reply.body, envelope.requestId, 100, identifier),
    };

    if ( !reply.ok ) throw new ApiError("http", { ...detail, errors, status: reply.status });
    if ( !envelope.success ) return;

    const success = pathGet(reply.body, envelope.success.path);

    if ( typeof success !== typeof envelope.success.equals ) throw new ApiError("response");
    if ( success !== envelope.success.equals ) throw new ApiError("http", { ...detail, errors, status: 422 });

}
function collection ( body: unknown, data: unknown, endpoint: Endpoint, envelope: Envelope, local: Local ): Decoded {

    if ( !Array.isArray(data) || data.length > 10000 ) throw new TypeError("Invalid collection.");

    const resource = data.map(( item ) => project(item, endpoint, envelope, local));
    const pagination = envelope.pagination ? paginationShape.parse(locate(Array.isArray(body) ? {} : body, envelope.pagination)) : undefined;

    return { resource, pagination };

}
function resource ( body: unknown, endpoint: Endpoint, envelope: Envelope, local: Local, status: number ): Decoded {

    const data = pathGet(body, envelope.data);

    try {

        if ( endpoint.many ) return collection(body, data, endpoint, envelope, local);
        if ( envelope.empty && vacant(data, status) ) return { resource: project({}, endpoint, envelope, local) };

        return { resource: project(data, endpoint, envelope, local) };

    }
    catch ( error ) {

        throw new ApiError("response", { cause: error });

    }

}
function aggregates ( body: unknown, envelope: Envelope ): Aggregates | undefined {

    if ( !envelope.aggregates || !isRecord(body) ) return undefined;

    const decoded = aggregatesShape.safeParse(locate(body, envelope.aggregates));
    const asked = decoded.success && Object.values(decoded.data).some(( entries ) => Object.keys(entries).length > 0);

    return asked ? decoded.data : undefined;

}
function meta ( body: unknown, endpoint: Endpoint, envelope: Envelope, pagination?: Pagination ): ApiResult<unknown>["meta"] {

    const supports = envelope.supports && endpoint.many ? supportsShape.safeParse(pathGet(body, envelope.supports)) : undefined;
    const sidebar = endpoint.many ? aggregates(body, envelope) : undefined;
    const requestId = read(body, envelope.requestId, 100, identifier);

    return {
        source: "remote",
        ...(pagination ? { pagination } : {}),
        ...(supports?.success ? { supports: supports.data } : {}),
        ...(sidebar ? { aggregates: sidebar } : {}),
        ...(requestId ? { requestId } : {}),
    };

}
export function decode ( wire: Wire, endpoint: Endpoint, local: Local, reply: Reply ): ApiResult<unknown> {

    const envelope = wire.response;

    try {

        verify(envelope, reply, failures(wire, endpoint, reply.body));

    }
    catch ( error ) {

        if ( !(error instanceof ApiError) || error.kind !== "http" ) throw error;

        let recovered: unknown;

        try { recovered = resource(reply.body, endpoint, envelope, local, reply.status).resource; }
        catch { recovered = undefined; }

        throw new ApiError(error.kind, { ...error, resource: recovered });

    }

    const decoded = resource(reply.body, endpoint, envelope, local, reply.status);

    return {
        resource: decoded.resource,
        message: read(reply.body, envelope.message, 2000) ?? null,
        meta: meta(reply.body, endpoint, envelope, decoded.pagination),
    };

}
export async function readJson ( response: Response, limit: number, detail: FailureDetail = {}, alias?: Alias ): Promise<unknown> {

    if ( response.status === 204 || response.status === 205 ) return null;

    const type = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();

    if ( !response.body || !(type === "application/json" || type?.endsWith("+json")) ) {

        await response.body?.cancel();

        throw new ApiError(response.ok ? "response" : "http", { ...detail, status: response.status });

    }
    try {

        return JSON.parse(rewriteAlias(await readText(response.body, limit), alias)) as unknown;

    }
    catch ( error ) {

        throw new ApiError("response", { ...detail, status: response.status, cause: error });

    }

}
