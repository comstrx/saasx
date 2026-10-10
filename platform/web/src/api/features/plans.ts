import { z } from "../../lib/providers/schema.ts";
import { browse, engage, get } from "../core/dsl.ts";
import { count, flag, id, money, text } from "../core/fields.ts";
import { check } from "./coupons.ts";

export const plan = z.object({
    id: z.number(),
    name: text,
    description: text,
    features: z.unknown().optional(),
    image: text,
    free: flag,
    recommended: flag,
    basic: flag,
    popular: flag,
    premium: flag,
    currency: text,
    max_subscriptions: count,
    rank: count,
    monthly_new_price: money,
    monthly_old_price: money,
    monthly_price_id: z.number().nullish(),
    yearly_new_price: money,
    yearly_old_price: money,
    yearly_price_id: z.number().nullish(),
    lifetime_new_price: money,
    lifetime_old_price: money,
    lifetime_price_id: z.number().nullish(),
    subscriptions: count,
    tenants: count,
});
const planId = { planId: id };

export default {
    ...browse("/plans", planId, plan),
    ...engage("/plans/{planId}", planId, ["like", "dislike", "visit", "report"]),
    coupon: get("/plans/{planId}/coupon/{code}", { ...planId, code: z.string().min(1).max(150) }, check),
};
