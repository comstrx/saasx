import { z } from "../../lib/providers/schema.ts";
import { get, many } from "../core/dsl.ts";
import { count, decimal, id, list, money, text } from "../core/fields.ts";

export const offer = z.object({
    id,
    name: text,
    description: text,
    image: text,
    type: text,
    value_type: text,
    value: money,
    rate: decimal,
    cap: money,
    priority: count,
    targets: z.array(z.record(z.string(), z.unknown())).nullish(),
    rewards: z.array(z.record(z.string(), z.unknown())).nullish(),
    starts_at: text,
    expires_at: text,
});

const effective = z.object({
    offer_id: z.number().nullish(),
    type: text,
    base: decimal,
    discount: decimal,
    priority: count,
});

export default {
    list: get("/offers", list, many(offer), { cache: 60 }),
    view: get("/offers/{offerId}", { offerId: id }, offer),
    effective: get("/offers/effective/{productId}", { productId: id }, z.object({ offer: effective.nullish() })),
};
