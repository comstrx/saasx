import { z } from "zod";
import { call } from "@/api/client";

const localeRow = z.object({
    code: z.string(),
    name: z.string().nullable().optional(),
    native: z.string().nullable().optional(),
    rtl: z.boolean().nullable().optional(),
});

const currencyRow = z.object({
    code: z.string(),
    name: z.string().nullable().optional(),
    native: z.string().nullable().optional(),
    symbol: z.string().nullable().optional(),
    exponent: z.number().nullable().optional(),
    allow_display: z.boolean().nullable().optional(),
});

const localeRows = z.array(localeRow);
const currencyRows = z.array(currencyRow);

export type LocaleRow = z.infer<typeof localeRow>;

export type CurrencyRow = z.infer<typeof currencyRow>;

export const vocabulary = {

    locales: (): Promise<readonly LocaleRow[]> => call({ path: "locales?limit=100", schema: localeRows }),

    currencies: (): Promise<readonly CurrencyRow[]> => call({ path: "currencies?limit=100", schema: currencyRows }),

};
