"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ApiError } from "@/api/core/error";
import type { Data } from "@/api/features";
import cart from "@/api/features/cart";
import orders from "@/api/features/orders";
import { useCheckpoint } from "@/hooks/use-checkpoint";
import { useAction } from "@/hooks/use-operation";
import { z } from "@/lib/providers/schema";
import { identity } from "@/lib/spec/config";
import { paymentStates } from "@/lib/std/orders";
import { uuid } from "@/lib/std/security";
import { useUi } from "@/stores/provider";

export type CartReview = z.output<typeof reviewed>;
export type CartReviewInput = z.input<typeof reviewed>;
export type CartDraft = Pick<CartReview, "values" | "method">;
export type CartPurchaseReceipt = z.output<typeof receipt>;

const reviewed = z.strictObject({
    input: cart.checkoutAll.input.shape.items.unwrap().element,
    quote: orders.preview.output,
    productId: z.number().int().positive(),
    name: z.string(), image: z.string().nullable(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    values: z.record(z.string(), z.string()),
    method: z.enum(["wallet", "later"]),
    approved: z.boolean(),
});
const receipt = z.strictObject({
    orders: z.array(z.strictObject({
        id: z.number().int().positive(), name: z.string().nullable(), paid: z.boolean().nullable(),
        paymentState: z.enum(paymentStates).nullable().optional(),
    })),
    failed: z.array(z.number().int().positive()),
    currency: z.string().nullable(), total: z.union([z.string(), z.number()]).nullable(),
    paid: z.union([z.string(), z.number()]).nullable(),
});
const draft = {
    reviews: z.array(reviewed).max(100),
    excluded: z.array(z.number().int().positive()).max(100),
};
const checkpoint = z.discriminatedUnion("stage", [
    z.strictObject({ stage: z.literal("review"), ...draft }),
    z.strictObject({
        stage: z.literal("pending"), ...draft, input: cart.checkoutAll.input,
        key: z.string().min(1).max(100), uncertain: z.boolean(), blocked: z.boolean(),
    }),
    z.strictObject({ stage: z.literal("complete"), receipt }),
]);

function rejected ( error: ApiError, uncertain: boolean ) {

    if ( error.confirmation || error.status === 422 && error.errors.confirm_code ) return true;
    if ( uncertain ) return false;

    return error.kind === "input" || [400, 401, 403, 404, 410, 422, 429].includes(error.status)
        || error.status === 409 && error.reason === "invalid_state";

}
function completed ( data: Data<"cart", "checkoutAll"> ): CartPurchaseReceipt {

    return {
        orders: data.items.map(( order ) => ({
            id: order.id, name: order.name ?? order.catalog?.name ?? null, paid: order.paid ?? null,
            paymentState: paymentStates.find(( state ) => state === order.payment_state) ?? null,
        })),
        failed: data.failed?.map(( item ) => item.id) ?? [],
        currency: data.currency ?? null, total: data.total_amount ?? null, paid: data.total_paid ?? null,
    };

}
export function useCartPurchase ( ids: readonly number[] ) {

    const user = useUi(( state ) => state.user);
    const operation = useAction("cart", "checkoutAll");
    const selection = ids.join(",");
    const parser = useCallback(( value: unknown ) => {

        const parsed = checkpoint.safeParse(value);

        if ( !parsed.success ) return null;

        const data = parsed.data;

        if ( data.stage === "complete" ) return data;

        const members = selection.split(",").map(Number);
        const known = [...data.excluded, ...data.reviews.map(( review ) => review.input.id)];

        if ( known.some(( id ) => !members.includes(id))
            || new Set(data.reviews.map(( review ) => review.input.id)).size !== data.reviews.length ) return null;
        if ( data.stage === "pending" ) {

            const active = members.filter(( id ) => !data.excluded.includes(id));
            const input = data.input.items;

            if ( !input?.length || input.length !== active.length
                || input.some(( item ) => !active.includes(item.id) || !item.quote_token || !item.idempotency_key) ) return null;

        }

        return data;

    }, [selection]);
    const saved = useCheckpoint([identity, "cart", "purchase", user?.id ?? "guest", selection].join("."), parser);
    const running = useRef(false);
    const handled = useRef<ApiError | null>(null);
    const state = saved.value;
    const attempt = state?.stage === "pending" ? state : null;
    const result = state?.stage === "complete" ? state.receipt : null;
    const reviews = state && state.stage !== "complete" ? state.reviews : [];
    const excluded = state && state.stage !== "complete" ? state.excluded : [];
    const active = ids.filter(( id ) => !excluded.includes(id));
    const uncertain = !!attempt && (attempt.uncertain || saved.restored);
    const blocked = saved.issue || !!attempt?.blocked;
    const locked = !saved.ready || !!attempt || !!result || blocked;
    const ready = active.length > 0 && active.every(( id ) => reviews.some(( review ) => review.input.id === id && review.approved));

    useEffect(() => {

        const error = operation.error;

        if ( !error || handled.current === error || !attempt ) return;

        handled.current = error;

        if ( rejected(error, uncertain) ) saved.save({
            stage: "review", reviews: attempt.reviews.map(( review ) => ({
                ...review, approved: error.reason === "invalid_state" || error.errors.quote_token ? false : review.approved,
            })), excluded: attempt.excluded,
        });
        else saved.save({
            ...attempt, uncertain: true,
            blocked: error.reason === "key_reused" || !!error.errors.idempotency_key,
        });

    }, [operation.error, attempt, uncertain, saved.save]);

    function remember ( value: CartReviewInput ) {

        if ( locked || !ids.includes(value.input.id) ) return false;

        const parsed = reviewed.safeParse(value);

        if ( !parsed.success ) return false;

        operation.clear();

        return saved.save({
            stage: "review", excluded,
            reviews: [...reviews.filter(( item ) => item.input.id !== value.input.id), { ...parsed.data, approved: true }],
        });

    }
    function edit ( id: number ) {

        if ( locked ) return false;

        operation.clear();

        return saved.save({
            stage: "review", excluded,
            reviews: reviews.map(( review ) => review.input.id === id ? { ...review, approved: false } : review),
        });

    }
    function exclude ( id: number, value: boolean ) {

        if ( locked || !ids.includes(id) ) return;

        operation.clear();
        saved.save({
            stage: "review", reviews,
            excluded: value ? [...new Set([...excluded, id])] : excluded.filter(( item ) => item !== id),
        });

    }
    async function run ( code?: string ) {

        if ( running.current || !saved.ready || blocked || result || !user || !attempt && !ready ) return;

        const candidate = attempt ?? {
            stage: "pending" as const, reviews, excluded,
            input: {
                items: active.flatMap(( id ) => {

                    const found = reviews.find(( review ) => review.input.id === id);

                    return found ? [{ ...found.input, idempotency_key: uuid() }] : [];

                }),
                ...(code ? { confirm_code: code } : {}),
            },
            key: uuid(), uncertain: false, blocked: false,
        };
        const chosen = parser(candidate);

        if ( chosen?.stage !== "pending" || !saved.save({ ...chosen, uncertain }) ) return;

        running.current = true;

        try {

            const reply = await operation.run(chosen.input, { idempotencyKey: chosen.key });

            if ( reply ) saved.save({ stage: "complete", receipt: completed(reply.resource) });

        }
        finally { running.current = false; }

    }

    return {
        ...operation, run, remember, edit, exclude, reviews, excluded, active, attempt, result, locked, blocked,
        ready: saved.ready, prepared: ready, storageIssue: saved.issue,
        signature: JSON.stringify(reviews.filter(( review ) => active.includes(review.input.id)).map(( review ) => review.input)),
    };

}
