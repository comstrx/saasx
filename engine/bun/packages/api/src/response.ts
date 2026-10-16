import { isRecord, mapValues, pathGet } from "engine/base";
import { Failure, type FieldErrors, type Kind } from "engine/error";
import { z } from "engine/validate";
import type { Endpoint } from "./dsl.ts";
import { target } from "./request.ts";
import { parseResource } from "./resource.ts";
import type { Envelope, Wire } from "./wire.ts";

const paginationShape = z.object({
    page: z.number().int().positive().nullable().default(null),
    limit: z.number().int().positive().nullable().default(null),
    total: z.number().int().nonnegative().nullable().default(null),
    pages: z.number().int().nonnegative().nullable().default(null),
});
const identifier = /^[a-zA-Z0-9_.-]{1,100}$/;
const machine = /^[a-z0-9_.-]+$/i;

export type Pagination = z.output<typeof paginationShape>;
export type Reply = { body: unknown; status: number; ok: boolean; retryAfter?: number | undefined };
export type ApiResult<T> = {
    resource: T;
    message: string | null;
    meta: { source: "local" | "remote"; requestId?: string | undefined; pagination?: Pagination | undefined };
};

type Local = Record<string, unknown> | undefined;

function read ( body: unknown, path: string | null, max: number, pattern = /^[\s\S]*$/ ): string | undefined {

    const value = path ? pathGet(body, path) : undefined;

    return typeof value === "string" && value.length <= max && pattern.test(value) ? value : undefined;

}
function wireName ( wire: Wire, key: string ): string {

    return target({ ...wire, method: "POST" }, key)?.name ?? key;

}
function failures ( wire: Wire, endpoint: Endpoint, body: unknown ): FieldErrors {

    const raw = wire.response.errors ? pathGet(body, wire.response.errors) : undefined;
    const errors: FieldErrors = {};

    if ( !isRecord(raw) ) return errors;

    const names = Object.keys(endpoint.input.shape).map(( key ) => ({ key, name: wireName(wire, key) }));

    for ( const [key, messages] of Object.entries(raw) ) {

        const semantic = names.find(( item ) => key === item.name || key.startsWith(`${item.name}.`))?.key ?? "_form";
        const valid =
            Array.isArray(messages) && messages.every(( value ) => typeof value === "string" && value.length <= 500);

        if ( valid ) errors[semantic] = [...(errors[semantic] ?? []), ...messages].slice(0, 10);

    }

    return errors;

}
const kindsByStatus: Record<number, Kind> = {
    400: "input",
    401: "denied",
    403: "denied",
    404: "missing",
    409: "conflict",
    422: "input",
};

function kindOf ( status: number ): Kind {

    return kindsByStatus[status] ?? "http";

}
function succeeded ( envelope: Envelope, reply: Reply ): boolean {

    if ( !reply.ok ) return false;
    if ( !envelope.success ) return true;

    return pathGet(reply.body, envelope.success.path) === envelope.success.equals;

}
function project ( envelope: Envelope, value: unknown ): unknown {

    if ( !isRecord(value) || !Object.keys(envelope.fields).length ) return value;

    const projected: Record<string, unknown> = { ...value };

    for ( const [key, path] of Object.entries(envelope.fields) ) {

        const found = pathGet(value, path);

        if ( found !== undefined ) projected[key] = found;

    }

    return projected;

}
function pagination ( envelope: Envelope, body: unknown ): Pagination | undefined {

    if ( !envelope.pagination ) return undefined;

    const located = mapValues(envelope.pagination, ( path ) => pathGet(body, path));
    const parsed = paginationShape.safeParse(located);

    return parsed.success ? parsed.data : undefined;

}
function resource ( wire: Wire, endpoint: Endpoint, local: Local, body: unknown ): unknown {

    const { response } = wire;
    const raw = pathGet(body, response.data);

    if ( endpoint.local ) return parseResource(endpoint.local, { ...local, ...(isRecord(raw) ? raw : {}) });
    if ( raw === undefined && response.empty ) return endpoint.many ? [] : null;

    const schema = endpoint.many ? z.array(endpoint.output) : endpoint.output;
    const parsed = schema.safeParse(
        Array.isArray(raw) ? raw.map(( item ) => project(response, item)) : project(response, raw),
    );

    if ( !parsed.success ) throw new Failure("response", { reason: "schema_drift", cause: parsed.error });

    return parsed.data;

}
export function decode ( wire: Wire, endpoint: Endpoint, local: Local, reply: Reply ): ApiResult<unknown> {

    const requestId = read(reply.body, wire.response.requestId, 100, identifier);

    if ( !succeeded(wire.response, reply) ) {

        throw new Failure(kindOf(reply.status), {
            status: reply.status,
            errors: failures(wire, endpoint, reply.body),
            reason: read(reply.body, wire.response.reason, 100, machine),
            code: read(reply.body, wire.response.code, 100, machine),
            message: read(reply.body, wire.response.message, 1000),
            retryAfter: reply.retryAfter,
            requestId,
        });

    }

    return {
        resource: resource(wire, endpoint, local, reply.body),
        message: read(reply.body, wire.response.message, 1000) ?? null,
        meta: { source: "remote", requestId, pagination: pagination(wire.response, reply.body) },
    };

}
