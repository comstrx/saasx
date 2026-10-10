import { z } from "zod";
import { call, paged } from "@/api/client";
import { decimal, maybeObject, supportsOf } from "@/api/contracts";
import { type ReviewPage, reviewRows } from "@/api/endpoints/catalogs";

const row = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    verified: z.boolean().nullable().optional(),
    member_since: z.string().nullable().optional(),
    catalogs: z.number().nullable().optional(),
    reviews: z.number().nullable().optional(),
    rating: decimal,
    response: maybeObject(z.object({ rate: decimal, minutes: z.number().nullable().optional() })),
});

export type VendorRow = z.infer<typeof row>;

export const vendors = {

    show: ( id: number ): Promise<VendorRow> => call({ path: `vendors/${ id }`, schema: row }),

    reviews: async ( id: number, limit = 9 ): Promise<ReviewPage> => {

        const answer = await paged({ path: `vendors/${ id }/reviews?sort=newest&limit=${ limit }&page=1`, schema: reviewRows });

        return { rows: answer.data, supports: supportsOf(answer.meta), pages: Number(answer.meta.pages ?? 1), spread: {} };

    },

};
