import * as z from "./z.ts";

const hex = /^#[a-fA-F0-9]{6}(?:[a-fA-F0-9]{2})?$/;

export const id: z.ZodNumber = z.number().int().positive();
export const key: z.ZodString = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const word: z.ZodString = z.string().regex(/^[a-z][a-zA-Z0-9]*$/);
export const slug: z.ZodString = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);
export const text: z.ZodString = z.string().refine(( value ) => value.trim().length > 0, "Expected non-empty text.");
export const optionalText = z.string().nullish();
export const flag = z.boolean().nullish();
export const count = z.number().int().nonnegative().nullish();
export const currency: z.ZodString = z.string().regex(/^[A-Z]{3}$/);
export const language: z.ZodString = z.string().regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/);
export const email: z.ZodEmail = z.email();
export const phone: z.ZodString = z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/)
    .meta({ kind: "phone" });
export const password: z.ZodString = z.string().min(8).max(255).meta({ kind: "password" });
export const color: z.ZodString = z.string().regex(hex);
export const path: z.ZodString = z.string().regex(/^\/(?:[\p{L}\p{N}_:-]+(?:\/[\p{L}\p{N}_:-]+)*)?$/u);
export const isoDate: z.ZodISODateTime = z.iso.datetime({ offset: true });
export const money: z.ZodString = z.string().regex(/^-?\d+(?:\.\d{1,6})?$/);
export const ack = z.object({}).passthrough();

export function localized ( min = 1 ) {

    return z.record(language, z.string().min(min)).meta({ kind: "localized" });

}
export const list = {
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    sort: z.string().max(60).optional(),
    search: z.string().max(200).optional(),
    filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
};
