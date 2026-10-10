import { z } from "zod";
import { call } from "@/api/client";
import { decimal, money, variants } from "@/api/contracts";

const row = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    image_variants: variants,
    expires_at: z.string().nullable().optional(),
    value_type: z.string().nullable().optional(),
    value: money,
    rate: decimal,
});

const rows = z.array(row);

export type OfferRow = z.infer<typeof row>;

export const offers = {

    feed: ( limit = 6 ): Promise<readonly OfferRow[]> => call({ path: `offers?limit=${ limit }`, schema: rows }),

};
