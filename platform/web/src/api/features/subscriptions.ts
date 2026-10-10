import { z } from "../../lib/providers/schema.ts";
import { engage, feature, get, many, post, put } from "../core/dsl.ts";
import { ack, flag, id, list, money, text } from "../core/fields.ts";
import { intent, payment } from "./orders.ts";
import { plan } from "./plans.ts";
import { review } from "./reviews.ts";

const workspace = z.object({
    id: z.number(),
    name: text,
    type: text,
    host: text,
    image: text,
});

export const subscription = z.object({
    id: z.number(),
    type: text,
    price: money,
    base_price: money,
    credit: money,
    discount: money,
    duration: text,
    auto_renew: flag,
    plan_id: z.number().nullish(),
    coupon_code: text,
    renewal_policy: text,
    started_at: text,
    expires_at: text,
    is_expired: flag,
    plan: plan.partial().nullish(),
    workspace: workspace.nullish(),
});

const quote = z.object({
    plan_id: z.number().nullish(),
    price: money,
    due_price: money,
    credit: money,
    upgrade: flag,
    wallet_surplus: money,
}).loose();
const subscriptionId = { subscriptionId: id };
const duration = z.enum(["monthly", "yearly", "lifetime"]);

export default feature({ execution: "client", permissions: ["user"], touches: ["account", "wallet", "transactions"] }, {
    list: get("/subscriptions", list, many(subscription)),
    view: get("/subscriptions/{subscriptionId}", subscriptionId, subscription),
    preview: post("/subscriptions/preview", {
        plan_id: id,
        tenant_id: id.optional(),
        duration: duration.optional(),
        coupon_code: z.string().max(100).optional(),
    }, quote),
    pay: post("/subscriptions/{subscriptionId}/pay", { ...subscriptionId, ...payment }, intent),
    cancel: post("/subscriptions/{subscriptionId}/cancel", subscriptionId, z.object({ refund: text }), { response: { empty: true } }),
    autoRenew: put("/subscriptions/{subscriptionId}/auto-renew", { ...subscriptionId, auto_renew: z.boolean() }, subscription),
    reviews: get("/subscriptions/{subscriptionId}/reviews", { ...subscriptionId, ...list }, many(review)),
    review: post("/subscriptions/{subscriptionId}/review", {
        ...subscriptionId,
        title: z.string().max(200).optional(),
        content: z.string().min(1).max(10000),
        rating: z.number().int().min(1).max(5),
    }, ack),
    ...engage("/subscriptions/{subscriptionId}", subscriptionId, ["report"]),
});
