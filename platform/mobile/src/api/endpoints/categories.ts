import { z } from "zod";
import { call } from "@/api/client";
import { decimal, variants } from "@/api/contracts";
import { type ListingRow, listingRows } from "@/api/endpoints/catalogs";

const parent = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
}).nullable().optional();

const row = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    image_variants: variants,
    icon: z.string().nullable().optional(),
    parent,
    childrens: z.number().nullable().optional(),
    catalogs: z.number().nullable().optional(),
    rating: decimal,
    orders: z.number().nullable().optional(),
    reviews: z.number().nullable().optional(),
});

const rows = z.array(row);

export type CategoryRow = z.infer<typeof row>;

export const categories = {

    list: ( limit = 80 ): Promise<readonly CategoryRow[]> =>
        call({ path: `categories?limit=${ limit }&sort=oldest`, schema: rows }),

    recent: ( limit = 8 ): Promise<readonly CategoryRow[]> =>
        call({ path: `home/recently-categories?limit=${ limit }`, schema: rows }),

    show: ( id: number ): Promise<CategoryRow> =>
        call({ path: `categories/${ id }`, schema: row }),

    catalogs: ( id: number, limit = 40 ): Promise<readonly ListingRow[]> =>
        call({ path: `categories/${ id }/catalogs?limit=${ limit }`, schema: listingRows }),

};
