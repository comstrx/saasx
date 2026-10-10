import { z } from "zod";
import { call, page, paged } from "@/api/client";
import { decimal, homing, type IntentRow, intent, maybeObject, money } from "@/api/contracts";
import { type ReviewRow, reviewRows } from "@/api/endpoints/catalogs";

const priced = z.object({
    currency: z.string().nullable().optional(),
    total_price: decimal,
    min_first_payment: decimal,
    breakdown: z.array(z.object({
        key: z.string(),
        amount: decimal,
        tone: z.string().nullable().optional(),
    })).nullable().optional(),
    payment_options: z.array(z.object({
        kind: z.string(),
        allowed: z.boolean().nullable().optional(),
        currency: z.string().nullable().optional(),
        due_now: decimal,
        due_later: decimal,
        due_at: z.string().nullable().optional(),
    })).nullable().optional(),
    applicants: z.array(z.object({ premium: decimal })).nullable().optional(),
    lines: z.array(z.object({
        catalog_id: z.number().nullable().optional(),
        name: z.string().nullable().optional(),
        quantity: z.number().nullable().optional(),
        total_price: decimal,
    })).nullable().optional(),
    family_total: decimal,
});

const quoted = priced.extend({
    quote_token: z.string(),
    deposit_percent: decimal,
    display: priced.nullable().optional(),
});

const moment = z.object({
    event: z.string().nullable().optional(),
    from: z.string().nullable().optional(),
    to: z.string().nullable().optional(),
    at: z.string().nullable().optional(),
});

const leg = z.object({
    id: z.number().nullable().optional(),
    reference: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    payment: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    amount: money,
    currency: z.string().nullable().optional(),
    can_refund: z.boolean().nullable().optional(),
    created_at: z.string().nullable().optional(),
});

const row = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    ref_id: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    stage: z.string().nullable().optional(),
    next_stages: z.array(z.string()).nullable().optional(),
    paid: z.boolean().nullable().optional(),
    quantity: z.number().nullable().optional(),
    adults: z.number().nullable().optional(),
    children: z.number().nullable().optional(),
    infants: z.number().nullable().optional(),
    pets: z.union([ z.boolean(), z.number() ]).nullable().optional(),
    nights: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    amount: money,
    unit_price: money,
    tax_amount: money,
    total_amount: money,
    paid_amount: money,
    remaining_amount: money,
    refundable_amount: money,
    coupon_code: z.string().nullable().optional(),
    allow_cancel: z.boolean().nullable().optional(),
    allow_refund: z.boolean().nullable().optional(),
    allow_pay_later: z.boolean().nullable().optional(),
    can_cancel: z.boolean().nullable().optional(),
    can_refund: z.boolean().nullable().optional(),
    can_pay: z.boolean().nullable().optional(),
    can_review: z.boolean().nullable().optional(),
    starts_at: z.string().nullable().optional(),
    ends_at: z.string().nullable().optional(),
    scheduled_at: z.string().nullable().optional(),
    delivery: z.string().nullable().optional(),
    applicants: z.array(z.object({ name: z.string().nullable().optional() })).nullable().optional(),
    cancel_before: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    paid_at: z.string().nullable().optional(),
    timeline: z.array(moment).nullable().optional(),
    catalog: z.object({
        id: z.number().nullable().optional(),
        name: z.string().nullable().optional(),
        type: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        image_variants: maybeObject(z.record(z.string(), z.string().nullable())),
    }).nullable().optional(),
    transaction: leg.nullable().optional(),
    transactions: z.array(leg).nullable().optional(),
    vendor: z.object({ id: z.number().nullable().optional() }).nullable().optional(),
});

const rows = z.array(row);

const handoff = z.object({ payment: intent.optional() });

export type PricedRow = z.infer<typeof priced>;

export type QuoteRow = z.infer<typeof quoted>;

export type MomentRow = z.infer<typeof moment>;

export type LegRow = z.infer<typeof leg>;

export type OrderRow = z.infer<typeof row>;

export type PlacedRow = {
    order: OrderRow;
    payment: IntentRow;
};

export type OrderPay = "wallet" | "directly" | "later";

export type OrderBody = {
    catalog_id: number;
    quantity: number;
    starts_at?: string;
    ends_at?: string;
    adults?: number;
    children?: number;
    infants?: number;
    pets?: boolean;
    coupon_code?: string;
    pay_type?: OrderPay;
    gateway_id?: number;
    applicants?: readonly { name: string; birth_date: string }[];
    addons?: readonly { catalog_id: number; quantity: number }[];
};

export type OrderReview = {
    rating: number;
    title: string;
    content: string;
};

const settles = ( gateway: number | null, confirmCode: string | null ) => ({
    ...( gateway ? { gateway_id: gateway } : {} ),
    ...( confirmCode ? { confirm_code: confirmCode } : {} ),
});

export const orders = {

    reviews: ( id: number ): Promise<readonly ReviewRow[]> => call({ path: `orders/${ id }/reviews?limit=5`, schema: reviewRows }),

    preview: ( body: OrderBody, attempt: string ): Promise<QuoteRow> =>
        call({ path: "orders/preview", method: "POST", body, schema: quoted, idempotencyKey: attempt }),

    checkout: async ( body: OrderBody, pay: OrderPay, token: string, gateway: number | null, amount: string, attempt: string, confirmCode: string | null = null ): Promise<PlacedRow> => {

        const answer = await paged({
            path: `catalogs/${ body.catalog_id }/checkout`,
            method: "POST",
            body: { ...body, ...homing, pay_type: pay, quote_token: token, amount, idempotency_key: attempt, ...settles(gateway, confirmCode) },
            schema: row,
            idempotencyKey: attempt,
        });
        const read = handoff.safeParse(answer.meta);

        return { order: answer.data, payment: read.success ? read.data.payment ?? null : null };

    },

    page: ( at: number, limit = 20 ) => page({ path: `orders?limit=${ limit }`, schema: rows }, at),

    show: ( id: number ): Promise<OrderRow> => call({ path: `orders/${ id }`, schema: row }),

    quote: async ( id: number, attempt: string ): Promise<string> => {

        const data = await call({ path: `orders/${ id }/quote`, method: "POST", schema: z.object({ quote_token: z.string() }), idempotencyKey: attempt });

        return data.quote_token;

    },

    pay: ( id: number, token: string, gateway: number | null, attempt: string, confirmCode: string | null = null ): Promise<IntentRow> =>
        call({
            path: `orders/${ id }/pay`,
            method: "POST",
            body: { ...homing, quote_token: token, idempotency_key: attempt, ...settles(gateway, confirmCode) },
            schema: intent,
            idempotencyKey: attempt,
        }),

    cancel: ( id: number, attempt: string ) =>
        call({ path: `orders/${ id }/cancel`, method: "POST", idempotencyKey: attempt }),

    review: ( id: number, body: OrderReview, attempt: string ) =>
        call({ path: `orders/${ id }/review`, method: "POST", body, idempotencyKey: attempt }),

};
