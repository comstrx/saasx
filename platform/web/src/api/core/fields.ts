import { z } from "../../lib/providers/schema.ts";
import { currencyCode } from "../../lib/std/geo.ts";

export const id = z.number().int().positive();
export const ref = z.union([id, z.string().min(1).max(200)]);
export const text = z.string().nullish();
export const count = z.number().nullish();
export const flag = z.boolean().nullish();
export const label = z.string().min(1).max(200);
export const body = z.string().min(1).max(10000);
export const currency = z.string().regex(currencyCode);
export const amount = z.string().regex(/^\d+(?:\.\d{1,8})?$/).max(30);
export const positiveAmount = amount.refine(( value ) => Number(value) > 0);
export const confirmCode = z.string().max(20);
export const channel = z.enum(["email", "sms", "whatsapp"]);
export const httpUrl = z.url().refine(( value ) => /^https?:\/\//.test(value));
export const decimal = z.union([z.string(), z.number()]).nullish();
export const variants = z.union([z.record(z.string(), z.string().nullable()), z.array(z.never())]).nullish();
export const person = z.object({ id, name: text, image: text });
export const picture = { image: text, image_variants: variants };
export const tallies = { views: count, likes: count, dislikes: count };
export const uploadFile = z.custom<File>(( value ) => typeof File !== "undefined" && value instanceof File)
    .refine(( file ) => file.size > 0 && file.name.length <= 255);
export const imageFile = uploadFile.refine(( file ) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));

const price = z.object({amount: decimal, currency: text, exponent: z.number().int().min(0).max(8).nullish(), usd: decimal, binding: z.boolean().nullish()});
const filter = z.union([z.string().max(500), z.number(), z.boolean(), z.array(z.union([z.string().max(500), z.number()])).max(100)]);
const key = z.string().regex(/^[a-z_]{1,60}$/);

export const money = z.union([price.extend({ display: price.nullish() }), z.string(), z.number()]).nullish();
export const ack = z.object({ success: z.literal(true).default(true) });
export const bulk = z.object({ asked: count, affected: count, missed_ids: z.array(id).nullish() });

export const seoFields = {
    slug: text,
    locales: z.array(z.string().max(10)).max(30).nullish(),
    image_width: z.number().int().positive().nullish(),
    image_height: z.number().int().positive().nullish(),
    image_alt: text,
    updated_at: text,
};
export const page = {
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
};
export const list = {
    ...page,
    query: z.string().max(200).optional(),
    sort: key.optional(),
    filters: z.record(key, filter).optional(),
    ids: z.array(id).min(1).max(100).optional(),
    fields: z.array(key).min(1).max(50).optional(),
    facets: z.array(key).min(1).max(20).optional(),
    stats: z.array(key).min(1).max(20).optional(),
    ranges: z.record(key, z.string().regex(/^-?\d+(?:\.\d+)?(?:,-?\d+(?:\.\d+)?){1,40}$/)).optional(),
    view: z.enum(["full", "tiny"]).optional(),
};
export const suggest = {
    query: z.string().max(200).optional(),
    limit: page.limit,
};
export const selection = z.strictObject({
    ids: z.array(id).min(1).max(100).optional(),
    all: z.literal(true).optional(),
}).refine(( value ) => !value.ids !== !value.all);

export function maybeObject<T extends z.ZodType> ( schema: T ) {

    return z.union([schema, z.array(z.never()).transform(() => null)]).nullish();

}
export function dict<T extends z.ZodType> ( schema: T ) {

    return z.union([z.record(z.string(), schema), z.array(z.never())]).nullish();

}
