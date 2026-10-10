import { z } from "zod";
import { call, paged } from "@/api/client";
import { decimal, homing, intent, money } from "@/api/contracts";
import { listingRow } from "@/api/endpoints/catalogs";

const held = listingRow.extend({
    min_quantity: decimal,
    max_quantity: decimal,
    allow_pay_later: z.boolean().nullable().optional(),
    delivery: z.string().nullable().optional(),
});

const person = z.object({
    name: z.string().nullable().optional(),
    birth_date: z.string().nullable().optional(),
});

const line = z.object({
    id: z.number(),
    quantity: decimal,
    starts_at: z.string().nullable().optional(),
    ends_at: z.string().nullable().optional(),
    adults: z.number().nullable().optional(),
    children: z.number().nullable().optional(),
    infants: z.number().nullable().optional(),
    pets: z.boolean().nullable().optional(),
    applicants: z.array(person).nullable().optional(),
    unit: money,
    total: money,
    live_total: money,
    catalog: held,
});

const lines = z.array(line);

const summary = z.object({
    summary: z.object({
        lines: z.number().nullable().optional(),
        quantity: z.number().nullable().optional(),
        subtotal: money,
        live_subtotal: money,
    }).nullable().optional(),
});

const settled = z.object({
    items: z.array(z.object({
        id: z.number().nullable().optional(),
        transaction: intent.optional(),
    })).nullable().optional(),
    failed: z.array(z.object({ id: z.number().nullable().optional() })).nullable().optional(),
});

export type CartLineRow = z.infer<typeof line>;

export type CartHeldRow = z.infer<typeof held>;

type CartSummaryRow = NonNullable<z.infer<typeof summary>["summary"]>;

export type CartPage = {
    rows: readonly CartLineRow[];
    summary: CartSummaryRow | null;
};

export type CartSettledRow = z.infer<typeof settled>;

export type CartFactsBody = {
    starts_at?: string;
    ends_at?: string;
    adults?: number;
    children?: number;
    infants?: number;
    pets?: boolean;
    applicants?: readonly { name: string; birth_date: string }[];
};

type CartOrder = {
    id: number;
    pay_type: "wallet" | "later";
};

export const cart = {

    list: async (): Promise<CartPage> => {

        const answer = await paged({ path: "cart?limit=50", schema: lines });
        const read = summary.safeParse(answer.meta);

        return { rows: answer.data, summary: read.success ? read.data.summary ?? null : null };

    },

    add: ( catalog: number, body: CartFactsBody, attempt: string ) =>
        call({ path: `catalogs/${ catalog }/cart`, method: "POST", body, idempotencyKey: attempt }),

    remove: ( catalog: number, attempt: string ) =>
        call({ path: `catalogs/${ catalog }/discart`, method: "POST", idempotencyKey: attempt }),

    amend: ( id: number, body: CartFactsBody, attempt: string ): Promise<CartLineRow> =>
        call({ path: `cart/${ id }`, method: "PUT", body, schema: line, idempotencyKey: attempt }),

    raise: ( id: number, quantity: number, attempt: string ): Promise<CartLineRow> =>
        call({ path: `cart/${ id }/increment`, method: "POST", body: { quantity }, schema: line, idempotencyKey: attempt }),

    lower: ( id: number, quantity: number, attempt: string ): Promise<CartLineRow> =>
        call({ path: `cart/${ id }/decrement`, method: "POST", body: { quantity }, schema: line, idempotencyKey: attempt }),

    drop: ( id: number, attempt: string ) =>
        call({ path: `cart/${ id }`, method: "DELETE", idempotencyKey: attempt }),

    clear: ( ids: readonly number[], attempt: string ) =>
        call({ path: "cart", method: "DELETE", body: { all: true, ...( ids.length > 0 ? { ids } : {} ) }, idempotencyKey: attempt }),

    settle: ( items: readonly CartOrder[], attempt: string, code: string | null = null ): Promise<CartSettledRow> =>
        call({
            path: "cart/checkout",
            method: "POST",
            body: { items: items.map(( item ) => ({ ...item, ...homing }) ), idempotency_key: attempt, ...( code ? { confirm_code: code } : {} ) },
            schema: settled,
            idempotencyKey: attempt,
        }),

};
