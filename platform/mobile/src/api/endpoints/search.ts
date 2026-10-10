import { z } from "zod";
import { call, paged } from "@/api/client";
import { decimal, dict, maybeObject } from "@/api/contracts";
import { type ListingRow, listingRows, tiny } from "@/api/endpoints/catalogs";

const hint = z.object({
    id: z.number(),
    entity: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
});

const hints = z.array(hint);

const facetCounts = dict(z.number());

const span = z.object({
    min: decimal,
    max: decimal,
}).nullable().optional();

const meta = z.object({
    facets: z.object({
        type: maybeObject(facetCounts),
        subtype: maybeObject(facetCounts),
    }).nullable().optional(),
    stats: z.object({ min_price: span }).nullable().optional(),
    supports: z.object({
        filters: z.array(z.string()).nullable().optional(),
        sorts: z.array(z.string()).nullable().optional(),
        facets: z.array(z.string()).nullable().optional(),
    }).nullable().optional(),
    total: z.number().nullable().optional(),
    page: z.number().nullable().optional(),
    pages: z.number().nullable().optional(),
});

export type HintRow = z.infer<typeof hint>;

type SearchMeta = z.infer<typeof meta>;

export type SearchPage = {
    rows: readonly ListingRow[];
    meta: SearchMeta | null;
};

export const search = {

    suggest: ( term: string ): Promise<readonly HintRow[]> =>
        call({ path: `search/suggest?query=${ encodeURIComponent(term) }`, schema: hints }),

    results: async ( terms: string ): Promise<SearchPage> => {

        const answer = await paged({ path: `catalogs?${ terms }&view=${ tiny }`, schema: listingRows });
        const read = meta.safeParse(answer.meta);

        return { rows: answer.data, meta: read.success ? read.data : null };

    },

};
