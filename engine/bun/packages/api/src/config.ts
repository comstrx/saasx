import { currency, z } from "@engine/validate";
import { name, url } from "./wire.ts";

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
        spec: name,
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
    connections: z.record(name, connectionShape),
});
export const apiInputShape = apiShape.extend({
    connections: z.record(name, connectionShape.partial().extend({ baseUrl: url })),
});

export type ApiInput = z.input<typeof apiInputShape>;
export type ApiConfig = z.output<typeof apiShape>;
export type Connection = ApiConfig["connections"][string];
