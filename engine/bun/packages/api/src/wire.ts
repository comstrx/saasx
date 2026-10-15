import { compact, safeKey } from "engine/base";
import { isEndpoint } from "engine/net";
import { z } from "engine/validate";

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const executions = ["server", "client", "hybrid"] as const;
const encodings = ["json", "multipart"] as const;
const pageKeys = ["page", "limit", "total", "pages"] as const;
const forbidden = [
    "host",
    "cookie",
    "set-cookie",
    "content-length",
    "connection",
    "transfer-encoding",
    "upgrade",
    "origin",
    "referer",
];
const segment = "(?:[a-zA-Z0-9_~-]+|\\{[a-zA-Z][a-zA-Z0-9_]*\\})";

export const headerKeys = [
    "accept",
    "contentType",
    "language",
    "currency",
    "tenant",
    "client",
    "auth",
    "requestId",
    "idempotency",
] as const;
export const requiredHeaders: readonly HeaderKey[] = ["accept", "language", "currency", "requestId"];
export const personalHeaders: readonly HeaderKey[] = ["client", "auth", "requestId", "idempotency"];

export const nameShape = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/);
export const url = z
    .string()
    .refine(( value ) => isEndpoint(value))
    .nullable();
const field = z
    .string()
    .regex(/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/)
    .refine(( value ) => value.split(".").every(safeKey));
const path = z.string().regex(new RegExp(`^/${segment}(?:/${segment})*/?$|^/$`));
const scalar = z.union([z.string().max(2048), z.number().finite(), z.boolean()]);
const source = field.or(z.literal("$"));
const wireName = field.or(z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*(?:\[[a-zA-Z0-9_]+\])+$/));
const target = z
    .string()
    .regex(/^(?:query:|body:)?[^:]+$/)
    .refine(( value ) => wireName.safeParse(value.replace(/^(?:query|body):/, "")).success);
const headerName = z
    .string()
    .regex(/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/)
    .refine(( value ) => !forbidden.includes(value.toLowerCase()));
const header = z.strictObject({
    name: headerName,
    prefix: z
        .string()
        .max(100)
        .regex(/^[^\r\n\0]*$/)
        .optional(),
});
const disabledShape = z.strictObject({ enabled: z.literal(false) });

const envelopeShape = z.strictObject({
    data: source,
    success: z.strictObject({ path: field, equals: scalar }).nullable(),
    message: field.nullable(),
    errors: field.nullable(),
    code: field.nullable(),
    reason: field.nullable(),
    requestId: field.nullable(),
    fields: z.record(nameShape, source),
    pagination: z.partialRecord(z.enum(pageKeys), source).nullable(),
    empty: z.boolean(),
});
export const layerShape = z.strictObject({
    enabled: z.boolean().optional(),
    execution: z.enum(executions).optional(),
    encoding: z.enum(encodings).optional(),
    method: z.enum(methods).optional(),
    path: path.optional(),
    cache: z.number().int().min(0).max(86_400).optional(),
    request: z
        .strictObject({
            headers: z.partialRecord(z.enum(headerKeys), z.union([headerName, header]).nullable()).optional(),
            fields: z.record(nameShape, target.nullable()).optional(),
        })
        .optional(),
    response: envelopeShape.partial().optional(),
});
export const wireShape = layerShape.required().extend({
    enabled: z.literal(true),
    request: z.strictObject({
        headers: z.partialRecord(z.enum(headerKeys), header),
        fields: z.record(nameShape, target.nullable()),
    }),
    response: envelopeShape,
});
export const contractShape = z.strictObject({
    values: z.record(nameShape, z.record(z.string(), z.unknown())),
    features: z.record(nameShape, z.record(nameShape, z.union([wireShape, disabledShape]))),
});
export const headerDefaults: NonNullable<Layer["request"]>["headers"] = {
    accept: "Accept",
    contentType: "Content-Type",
    language: "Accept-Language",
    currency: "X-Currency",
    tenant: "X-Tenant",
    client: "X-Client",
    idempotency: "Idempotency-Key",
    requestId: "X-Request-Id",
    auth: { name: "Authorization", prefix: "Bearer " },
};
export const envelopeDefaults: Envelope = {
    data: "data",
    success: null,
    message: "message",
    errors: "errors",
    code: "code",
    reason: "reason",
    requestId: "meta.request_id",
    fields: {},
    pagination: { page: "meta.page", limit: "meta.limit", total: "meta.total", pages: "meta.pages" },
    empty: false,
};

export type Method = (typeof methods)[number];
export type Execution = (typeof executions)[number];
export type HeaderKey = (typeof headerKeys)[number];
export type Envelope = z.output<typeof envelopeShape>;
export type Layer = z.input<typeof layerShape>;
export type Wire = z.output<typeof wireShape>;
export type Contract = z.output<typeof contractShape>;

export { methods };

function nested<T extends object> ( base: T | null | undefined, patch: T | null | undefined ): T | null | undefined {

    return patch === undefined ? base : patch === null ? null : ({ ...base, ...compact(patch) } as T);

}
export function merge ( base: Layer, patch: Layer ): Layer {

    const layer: Layer = { ...base, ...compact(patch) };

    if ( base.request || patch.request ) {

        layer.request = {
            ...base.request,
            ...compact(patch.request),
            headers: { ...base.request?.headers, ...patch.request?.headers },
            fields: { ...base.request?.fields, ...patch.request?.fields },
        };

    }

    if ( base.response || patch.response ) {

        layer.response = {
            ...base.response,
            ...compact(patch.response),
            fields: { ...base.response?.fields, ...patch.response?.fields },
            pagination: nested(base.response?.pagination, patch.response?.pagination),
        };

    }

    return layer;

}
