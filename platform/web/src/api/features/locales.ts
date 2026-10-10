import { z } from "../../lib/providers/schema.ts";
import { get, many } from "../core/dsl.ts";
import { count, decimal, flag, list, text } from "../core/fields.ts";

const locale = z.object({
    id: z.number(),
    code: text,
    iso: text,
    name: text,
    native: text,
    rtl: flag,
});

const rate = z.object({
    value: decimal,
    source: text,
    as_of: count,
    pinned: flag,
});

const currency = z.object({
    id: z.number(),
    code: text,
    iso: text,
    name: text,
    native: text,
    symbol: text,
    exponent: count,
    active: flag,
    allow_display: flag,
    allow_authoring: flag,
    rate: rate.nullish(),
});

export const currencies = {
    list: get("/currencies", list, many(currency), { cache: 300 }),
};

export default {
    list: get("/locales", list, many(locale), { cache: 300 }),
};
