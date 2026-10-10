import { z } from "zod";
import { identity } from "@/brand/identity";

export const baseCurrency = "USD";

export const homing = {
    redirect_url: `${ identity.scheme }://payment/return`,
    failed_url: `${ identity.scheme }://payment/return?failed=1`,
} as const;

export const envelope = <T extends z.ZodTypeAny>( data: T ) => z.object({
    status: z.boolean(),
    code: z.string(),
    reason: z.string().nullable().optional(),
    message: z.string(),
    data: data.nullable(),
    errors: z.record(z.string(), z.array(z.string())).nullable().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
});

export const maybeObject = <T extends z.ZodTypeAny>( schema: T ) =>
    z.union([ schema, z.array(z.unknown()) ]).nullable().optional();

export const dict = <T extends z.ZodTypeAny>( schema: T ) =>
    z.union([ z.record(z.string(), schema), z.array(z.unknown()) ])
        .nullable()
        .optional()
        .transform(( value ): Record<string, z.infer<T>> =>
            !value || Array.isArray(value) ? {} : value );

export const variants = maybeObject(z.record(z.string(), z.string().nullable()));

export const oneOf = <T>( value: T | null | undefined ): Exclude<T, readonly unknown[]> | null =>
    Array.isArray(value) ? null : ( ( value ?? null ) as Exclude<T, readonly unknown[]> | null );

export const otpChallenge = z.object({
    status: z.enum([ "otp_required", "otp_pending" ]),
    challenge_token: z.string(),
    channel: z.enum([ "email", "sms", "whatsapp" ]),
    destination: z.string(),
    length: z.number().nullable().optional(),
    locked: z.boolean().nullable().optional(),
    retry_at: z.string().nullable().optional(),
    expires_at: z.string().nullable().optional(),
});

const linkSent = z.object({
    status: z.literal("link_sent"),
    channel: z.enum([ "email", "sms", "whatsapp" ]),
    destination: z.string(),
    expires_at: z.string().nullable().optional(),
});

export const recovered = z.union([ otpChallenge, linkSent ]);

export const authUser = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    theme: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    language: z.string().nullable().optional(),
    verified: z.boolean().optional(),
    permissions: z.array(z.string()).optional(),
});

export const verification = z.object({
    steps: dict(z.boolean()),
    remained: z.array(z.string()).optional(),
});

export type AuthUser = z.infer<typeof authUser>;

const scalar = z.union([ z.string(), z.number() ]);

export const decimal = scalar.nullable().optional();

export const numeric = ( value: z.infer<typeof decimal> ): number => Number(value ?? 0);

const rendered = z.object({
    amount: scalar.nullable().optional(),
    currency: z.string().nullable().optional(),
    binding: z.boolean().nullable().optional(),
});

export const money = z.union([
    rendered.extend({ display: rendered.nullable().optional() }),
    scalar,
]).nullable().optional();

export type MoneyShape = z.infer<typeof money>;

export type Cash = {
    amount: number;
    currency: string;
    binding?: boolean;
};

const stated = ( value: z.infer<typeof rendered>, fallback: string ): Cash | null =>
    value.amount === null || value.amount === undefined
        ? null
        : { amount: Number(value.amount), currency: value.currency ?? fallback, ...( value.binding === false ? { binding: false } : {} ) };

export const cash = ( value: MoneyShape, fallback = baseCurrency ): Cash | null => {

    if ( value === null || value === undefined ) return null;

    if ( typeof value !== "object" ) return { amount: Number(value), currency: fallback };

    return ( value.display ? stated(value.display, fallback) : null ) ?? stated(value, fallback);

};

export const cashOr = ( value: MoneyShape, fallback = baseCurrency ): Cash =>
    cash(value, fallback) ?? { amount: 0, currency: fallback };

export const bare = ( value: MoneyShape, fallback = baseCurrency ): Cash => {

    if ( value === null || value === undefined ) return { amount: 0, currency: fallback };

    if ( typeof value !== "object" ) return { amount: Number(value), currency: fallback };

    return stated(value, fallback) ?? { amount: 0, currency: fallback };

};

const gated = z.object({
    pay_url: z.string().nullable().optional(),
});

export const intent = z.object({
    id: z.number().nullable().optional(),
    ref_id: z.string().nullable().optional(),
    reference: z.string().nullable().optional(),
    order_id: z.number().nullable().optional(),
    manual: z.boolean().nullable().optional(),
    pay_url: z.string().nullable().optional(),
    pay_data: gated.nullable().optional(),
}).nullable();

export type IntentRow = z.infer<typeof intent>;

export type Supports = {
    filters: readonly string[];
    sorts: readonly string[];
    facets: readonly string[];
};

const noSupports: Supports = { filters: [], sorts: [], facets: [] };

const backing = z.object({
    supports: z.object({
        filters: z.array(z.string()).nullable().optional(),
        sorts: z.array(z.string()).nullable().optional(),
        facets: z.array(z.string()).nullable().optional(),
    }).nullable().optional(),
});

export const supportsOf = ( meta: unknown ): Supports => {

    const read = backing.safeParse(meta);

    if ( !read.success ) return noSupports;

    const able = read.data.supports;

    return {
        filters: able?.filters ?? [],
        sorts: able?.sorts ?? [],
        facets: able?.facets ?? [],
    };

};
