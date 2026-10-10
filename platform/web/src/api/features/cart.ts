import { z } from "../../lib/providers/schema.ts";
import { del, feature, get, post, put } from "../core/dsl.ts";
import { ack, bulk, confirmCode, count, decimal, flag, id, money, page as pagination, selection, text } from "../core/fields.ts";
import { check } from "./coupons.ts";
import { booking, checkout, coupon, order, placed, settlement } from "./orders.ts";
import { product } from "./products.ts";

export const line = z.object({
    id: z.number(),
    quantity: decimal,
    starts_at: text,
    ends_at: text,
    adults: count,
    children: count,
    infants: count,
    pets: flag,
    applicants: z.array(z.object({ name: text, birth_date: text, nationality: text, residency: text })).nullish(),
    tier: text,
    unit: money,
    offer_discount: money,
    total: money,
    live_total: money,
    catalog: product.extend({ min_quantity: decimal, max_quantity: decimal, allow_pay_later: flag }).nullish(),
});
const page = z.object({
    items: z.array(line),
    summary: z.object({
        lines: count,
        quantity: count,
        subtotal: money,
        live_subtotal: money,
    }).nullish(),
});
const cartId = { cartId: id };
const quantity = { ...cartId, quantity: z.number().int().min(1).max(1000) };
export const held = booking.pick({
    quantity: true, starts_at: true, ends_at: true, adults: true, children: true,
    infants: true, pets: true, applicants: true, tier: true,
});
const patch = z.strictObject({
    quantity: z.number().int().min(1).max(1000).optional(),
    starts_at: held.shape.starts_at.nullable(),
    ends_at: held.shape.ends_at.nullable(),
    adults: held.shape.adults.nullable(),
    children: held.shape.children.nullable(),
    infants: held.shape.infants.nullable(),
    pets: held.shape.pets.nullable(),
    applicants: held.shape.applicants.nullable(),
    tier: held.shape.tier.nullable(),
});
const settled = booking.partial().extend({
    id, ...coupon, ...settlement,
    quantity: held.shape.quantity.removeDefault().optional(),
    pay_type: z.enum(["wallet", "later"]).optional(),
});
const purchased = z.object({
    items: z.array(order), currency: text, total_amount: decimal, total_paid: decimal, total_quantity: count,
    failed: z.array(z.object({ id })).optional(),
});
const touches = ["products", "orders", "wallet", "transactions", "notifications"];

export default feature({ execution: "client", permissions: ["user"], touches }, {
    list: get("/cart", { ...pagination, ids: z.array(id).min(1).max(100).optional() }, page, {
        response: { data: "$", fields: { items: "data", summary: "meta.summary" } },
    }),
    view: get("/cart/{cartId}", cartId, line),
    checkout: post("/cart/{cartId}/checkout", booking.extend({ ...cartId, ...coupon, ...settlement }), placed, checkout),
    add: post("/catalogs/{productId}/cart", held.extend({ productId: id }), ack),
    update: put("/cart/{cartId}", patch.extend(cartId), line),
    delete: del("/cart/{cartId}", cartId, ack),
    increment: post("/cart/{cartId}/increment", quantity, line),
    decrement: post("/cart/{cartId}/decrement", quantity, line),
    coupon: get("/cart/{cartId}/coupon/{code}", { ...cartId, code: z.string().min(1).max(150) }, check),
    clear: del("/cart", selection, bulk),
    checkoutAll: post("/cart/checkout", {
        confirm_code: confirmCode.optional(),
        items: z.array(settled).max(100).refine(( rows ) => new Set(rows.map(( row ) => row.id)).size === rows.length).optional(),
    }, purchased),
});
