import { asciiNumber } from "./number.ts";

type Values = Readonly<Record<string, string>>;
type RecordState = {
    can_cancel?: boolean | null; can_refund?: boolean | null; can_receive?: boolean | null;
    can_revise?: boolean | null; can_return?: boolean | null; completed_at?: string | null;
};
type MoneyFact = { amount?: string | number | null; currency?: string | null; usd?: string | number | null };

export const orderActions = ["receive", "revise", "return", "refund", "cancel"] as const;
export type OrderAction = typeof orderActions[number];
export const actionPermissions: Record<OrderAction, string> = {
    cancel: "allow_cancellations", refund: "allow_refunds", receive: "allow_acceptance",
    revise: "allow_acceptance", return: "allow_returns",
};

export function allowedAction ( order: RecordState, action: OrderAction, permissions: readonly string[] ): boolean {

    return !!order[`can_${action}`] && permissions.includes(actionPermissions[action]) && (action !== "refund" || !!order.completed_at);

}
export function refundLimit ( value: MoneyFact | string | number | null | undefined, currency: string ): string | undefined {

    if ( value == null ) return undefined;
    if ( typeof value !== "object" ) return currency === "USD" ? String(value) : undefined;

    return value.usd != null ? String(value.usd) : value.currency === "USD" && value.amount != null ? String(value.amount) : undefined;

}
function units ( value: string ): bigint | null {

    if ( value.length > 30 || !/^\d+(?:\.\d{1,8})?$/.test(value) ) return null;

    const [whole = "0", fraction = ""] = value.split(".");

    return BigInt(whole) * 100000000n + BigInt(fraction.padEnd(8, "0"));

}
export function actionErrors ( action: OrderAction, values: Values, quantity: number, limit?: string ): Record<string, string> {

    const errors: Record<string, string> = {};

    if ( (values.notes ?? "").trim().length > 3000 ) errors.notes = "notesLong";

    if ( action === "return" ) {

        const count = Number(asciiNumber(values.quantity ?? ""));

        if ( !Number.isSafeInteger(count) || count < 1 || count > quantity ) errors.quantity = "quantityError";

    }
    if ( action === "refund" && values.refund === "partial" ) {

        const amount = units(asciiNumber(values.amount ?? "").trim());
        const ceiling = limit ? units(limit) : null;

        if ( amount === null || amount <= 0n || ceiling === null || amount > ceiling ) errors.amount = "amountError";

    }

    return errors;

}
export function actionInput ( action: OrderAction, orderId: number, values: Values ) {

    const notes = values.notes?.trim();

    return {
        orderId,
        ...(notes && (action === "cancel" || action === "return") ? { reason: notes } : {}),
        ...(notes && action === "revise" ? { notes } : {}),
        ...(action === "return" ? { quantity: Number(asciiNumber(values.quantity ?? "")) } : {}),
        ...(action === "refund" && values.refund === "partial" ? { amount: asciiNumber(values.amount ?? "").trim() } : {}),
    };

}
