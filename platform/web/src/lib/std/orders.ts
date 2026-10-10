import { day } from "./format.ts";
import { queryNumber, queryText } from "./listing.ts";
import { asciiNumber } from "./number.ts";
import { calendarDate } from "./search.ts";

type Query = Readonly<Record<string, string | string[] | undefined>>;

export const orderStates = ["all", "active", "completed", "cancelled"] as const;
export const orderSorts = ["newest", "oldest"] as const;
export const orderStages = [
    "submitted", "docs_required", "scheduled", "attended", "no_show", "processing", "approved", "rejected", "issued",
    "active", "packed", "shipped", "delivered", "checked_in", "expired", "in_progress", "received", "revision_requested",
    "return_requested", "return_authorized", "return_rejected", "returned", "inspected",
] as const;
export const paymentStates = ["unpaid", "partial", "paid", "overpaid", "refunded", "partially_refunded"] as const;

export function orderListInput ( query: Query, limit = 12 ) {

    const status = orderStates.find(( value ) => value === queryText(query, "status")) ?? "all";
    const sort = orderSorts.find(( value ) => value === queryText(query, "sort")) ?? "newest";
    const search = asciiNumber(queryText(query, "query") ?? "").replace(/^#/, "");
    const id = /^\d+$/.test(search) && Number.isSafeInteger(Number(search)) && Number(search) > 0 ? Number(search) : null;

    return {
        page: queryNumber(query, "page", 1, 10000) ?? 1,
        limit: Math.max(1, Math.min(100, limit)), sort,
        fields: [
            "name", "image", "catalog", "status", "payment_state", "currency", "amount", "total_amount",
            "starts_at", "ends_at", "scheduled_at", "created_at", "can_pay",
        ],
        ...(id ? { ids: [id] } : search ? { query: search } : {}),
        ...(status !== "all" ? { filters: { status: status === "active" ? ["pending", "confirmed"] : status } } : {}),
    };

}
export function orderDate ( value: string | null | undefined, locale: string ): string | undefined {

    const date = calendarDate(value?.slice(0, 10) ?? "");

    return date ? day(date, locale, { day: "numeric", month: "short", year: "numeric" }) : undefined;

}
export function orderTone ( status: string | null | undefined ): "neutral" | "positive" | "attention" | "negative" {

    if ( status === "confirmed" || status === "completed" ) return "positive";
    if ( status === "pending" ) return "attention";
    if ( status === "cancelled" ) return "negative";

    return "neutral";

}
