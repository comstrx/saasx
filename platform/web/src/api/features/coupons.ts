import { z } from "../../lib/providers/schema.ts";
import { engage, feature, get, many, post } from "../core/dsl.ts";
import { count, decimal, flag, id, list, money, text } from "../core/fields.ts";

export const coupon = z.object({
    id: z.number(),
    code: text,
    name: text,
    description: text,
    conditions: text,
    value_type: text,
    value: money,
    rate: decimal,
    cap: money,
    min_price: money,
    points: decimal,
    min_orders: count,
    image: text,
    visibility: text,
    stackable: flag,
    rewardable: flag,
    max_price: money,
    max_uses: count,
    max_usages: count,
    usages: count,
    users: count,
    targets: z.array(z.record(z.string(), z.unknown())).nullish(),
    is_valid: flag,
    starts_at: text,
    expires_at: text,
});
export const history = {
    response: {
        data: "data.items",
        pagination: {
            page: "data.meta.page",
            limit: "data.meta.limit",
            total: "data.meta.total",
        },
    },
};

const event = z.object({
    coupon_id: z.number().nullish(),
    code: text,
    status: text,
    discount: money,
    order_id: z.number().nullish(),
    at: text,
});
export const check = z.object({
    coupon_id: z.number().nullish(),
    coupon_code: text,
    base_price: money,
    total_price: money,
    discount: money,
});

export default feature({ execution: "client", touches: ["cart"] }, {
    list: get("/coupons", list, many(coupon)),
    mine: get("/coupons/mine", list, many(coupon)),
    history: get("/coupons/history", list, many(event), history),
    view: get("/coupons/{couponId}", { couponId: id }, coupon),
    redeem: post("/coupons/{couponId}/redeem", { couponId: id }, coupon),
    ...engage("/coupons/{couponId}", { couponId: id }, ["report"]),
    validate: post("/coupons/{code}/validate", {
        code: z.string().min(1).max(150),
        productId: id,
        quantity: z.number().int().min(1).max(10000),
    }, check, { request: { fields: { productId: "catalog_id" } } }),
});
