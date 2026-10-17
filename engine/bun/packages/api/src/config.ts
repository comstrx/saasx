import { unique } from "engine/array";
import { currency, specName, z } from "engine/validate";
import { nameShape, url } from "./wire.ts";

export const connectionDefaults = {
    browser: true,
    browserBaseUrl: null,
    timeoutMs: 10_000,
    retries: 1,
    retryOn: [502, 503, 504],
    maxResponseBytes: 1_048_576,
    credentials: "omit",
} as const;
const connectionShape = z.strictObject({
    baseUrl: url,
    browser: z.boolean(),
    browserBaseUrl: url,
    timeoutMs: z.number().int().positive().max(60_000),
    retries: z.number().int().min(0).max(3),
    retryOn: z.array(z.number().int().min(400).max(599)).max(10),
    maxResponseBytes: z.number().int().min(1024).max(10_000_000),
    credentials: z.enum(["omit", "same-origin", "include"]),
    development: z.strictObject({ baseUrl: url, browserBaseUrl: url }).optional(),
});
export const apiShape = z.strictObject({
    context: z.strictObject({
        spec: specName,
        currency,
        sessionCookie: z
            .string()
            .regex(/^[a-zA-Z0-9._-]+$/)
            .nullable(),
        proxies: z.number().int().min(0).max(5),
        tenant: z
            .string()
            .regex(/^[a-z0-9.-]+$/i)
            .nullable()
            .default(null),
    }),
    connections: z.record(nameShape, connectionShape),
});
export const apiInputShape = apiShape.extend({
    connections: z.record(nameShape, connectionShape.partial().extend({ baseUrl: url })),
});

export type ApiInput = z.input<typeof apiInputShape>;
export type ApiConfig = z.output<typeof apiShape>;
export type Connection = ApiConfig["connections"][string];
export type Connected = { connections: Readonly<Record<string, { baseUrl?: string | null | undefined }>> } | null | undefined;

export function connectionOrigins ( api: Connected ): string[] {

    const addresses = Object.values(api?.connections ?? {}).flatMap(( connection ) => (connection.baseUrl ? [connection.baseUrl] : []));

    return unique(addresses.map(( address ) => new URL(address).origin));

}
