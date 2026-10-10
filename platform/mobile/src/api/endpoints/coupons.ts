import { z } from "zod";
import { call, page } from "@/api/client";
import { decimal, money } from "@/api/contracts";

const row = z.object({
    id: z.number(),
    code: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    conditions: z.string().nullable().optional(),
    value_type: z.string().nullable().optional(),
    value: money,
    rate: decimal,
    cap: money,
    min_price: money,
    points: decimal,
    min_orders: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    is_valid: z.boolean().nullable().optional(),
    starts_at: z.string().nullable().optional(),
    expires_at: z.string().nullable().optional(),
});

const rows = z.array(row);

const checked = z.object({
    coupon_id: z.number().nullable().optional(),
    coupon_code: z.string().nullable().optional(),
    base_price: money,
    total_price: money,
    discount: money,
});

const event = z.object({
    coupon_id: z.number().nullable().optional(),
    code: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    discount: money,
    order_id: z.number().nullable().optional(),
    at: z.string().nullable().optional(),
});

const events = z.object({ items: z.array(event) });

export type CouponRow = z.infer<typeof row>;

export type CouponCheckRow = z.infer<typeof checked>;

export type CouponEventRow = z.infer<typeof event>;

export const coupons = {

    available: ( at = 1 ) => page({ path: "coupons?limit=20", schema: rows }, at),

    mine: ( at = 1 ) => page({ path: "coupons/mine?limit=20", schema: rows }, at),

    history: async (): Promise<readonly CouponEventRow[]> => ( await call({ path: "coupons/history?limit=50", schema: events }) ).items,

    redeem: ( id: number, attempt: string ) =>
        call({ path: `coupons/${ id }/redeem`, method: "POST", idempotencyKey: attempt }),

    validate: ( code: string, catalog: number, quantity: number, attempt: string ): Promise<CouponCheckRow> =>
        call({
            path: `coupons/${ encodeURIComponent(code) }/validate`,
            method: "POST",
            body: { catalog_id: catalog, quantity },
            schema: checked,
            idempotencyKey: attempt,
        }),

};
