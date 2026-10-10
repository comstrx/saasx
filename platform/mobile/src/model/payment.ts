import type { IntentRow } from "@/api/contracts";

export type PaymentIntent = {
    url: string | null;
    reference: string | null;
    order: number | null;
};

export const intentOf = ( data: IntentRow, order: number | null = null ): PaymentIntent => {

    const gate = data?.pay_data ?? data;
    const reference = data?.reference ?? data?.ref_id ?? null;
    const banked = !reference && !gate?.pay_url && !data?.manual;

    return {
        url: gate?.pay_url ?? null,
        reference,
        order: data?.order_id ?? order ?? ( banked ? data?.id ?? null : null ),
    };

};

export type PaymentKind = "settled" | "redirect";

export type PaymentTarget =
    | { kind: "order"; id: number }
    | { kind: "orders" }
    | { kind: "wallet"; reference: string };

export type PendingPayment = {
    target: PaymentTarget;
    at: number;
};

export const settleTick = 3000;

const settleWindow = 300000;

export const paymentKind = ( intent: PaymentIntent ): PaymentKind => intent.url ? "redirect" : "settled";

export const settling = ( pending: PendingPayment | null, now: number ): boolean =>
    Boolean(pending) && now - ( pending?.at ?? 0 ) < settleWindow;

export const targets = ( pending: PendingPayment | null, target: PaymentTarget ): boolean => {

    const held = pending?.target;

    if ( !held || held.kind !== target.kind ) return false;

    return held.kind === "order" && target.kind === "order"
        ? held.id === target.id
        : true;

};
