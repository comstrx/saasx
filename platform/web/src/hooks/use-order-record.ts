"use client";

import type { Data } from "@/api/features";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { money } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { orderDate, orderTone, paymentStates } from "@/lib/std/orders";

type Order = Data<"orders", "view">;

export function useOrderRecord ( path: string ) {

    const t = useTranslations("orders");
    const locale = useLocale();

    return ( order: Order ) => {

        const href = localePath(locale, path.replace(":orderId", String(order.id)), routing);
        const amount = money(order.total_amount ?? order.amount, locale, order.currency ?? "USD", true);
        const currency = amount?.currency ?? order.currency ?? "USD";
        const start = orderDate(order.starts_at ?? order.scheduled_at, locale);
        const end = orderDate(order.ends_at, locale);
        const created = orderDate(order.created_at, locale);
        const payment = paymentStates.find(( value ) => value === order.payment_state);
        const status = (["pending", "confirmed", "completed", "cancelled"] as const).find(( value ) => value === order.status) ?? "unknown";

        return {
            name: order.catalog?.name || order.name || t("unnamed"), href,
            image: order.catalog?.image || order.image,
            reference: t("reference", { id: String(order.id) }),
            status: { label: t(`statuses.${status}`), tone: orderTone(order.status) },
            description: start ? end && end !== start ? t("dateRange", { from: start, to: end }) : start
                : created ? t("placed", { date: created }) : undefined,
            detail: payment ? t(`payments.${payment}`) : undefined,
            total: amount ? {
                amount, label: t("total"), currencyLabel: new Intl.DisplayNames([locale], { type: "currency" }).of(currency) ?? currency,
            } : undefined,
            action: t(order.can_pay ? "continuePayment" : "view"),
        };

    };

}
