"use client";

import { usePathname } from "next/navigation";
import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { money } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { orderDate, orderStages, paymentStates } from "@/lib/std/orders";
import { entityId } from "@/lib/std/route";
import { useUi } from "@/stores/provider";
import type { CheckoutLinks } from "./use-checkout-route";

export function useOrderDetail ( id: string | undefined, links: CheckoutLinks ) {

    const orderId = entityId(id);
    const t = useTranslations("checkout");
    const common = useTranslations("common");
    const actions = useTranslations("orderActions");
    const help = useTranslations("orderHelp");
    const list = useTranslations("orders");
    const locale = useLocale();
    const path = usePathname();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const request = useRead("orders", "view", { orderId: orderId ?? 0 }, { enabled: ready && !!token && !!orderId });
    const order = request.data;

    const login = `${localePath(locale, links.login, routing)}?${new URLSearchParams({ next: path })}`;
    const base = {
        t, common, request, login,
        back: links.list ? { href: localePath(locale, links.list, routing), label: t("allOrders") } : null,
    };

    if ( !orderId ) return { ...base, state: "missing" as const };
    if ( !ready || request.loading && !order ) return { ...base, state: "loading" as const };
    if ( !token ) return { ...base, state: "guest" as const };
    if ( request.error || !order ) return { ...base, state: "failed" as const };

    const currency = order.currency ?? "USD";
    const currencies = new Intl.DisplayNames([locale], { type: "currency" });
    const total = money(order.total_amount ?? order.amount, locale, currency, true);
    const paid = money(order.paid_amount, locale, currency, true);
    const remaining = money(order.remaining_amount, locale, currency, true);
    const status = order.status && ["pending", "confirmed", "completed", "cancelled"].includes(order.status)
        ? t(`states.${order.status as "pending" | "confirmed" | "completed" | "cancelled"}`) : t("states.unknown");
    const refunded = money(order.refunded_amount, locale, currency, true);
    const stage = orderStages.find(( value ) => value === order.stage);
    const payment = paymentStates.find(( value ) => value === order.payment_state);
    const rows = [
        ...(paid ? [{ key: "paid", label: t("paidAmount"), amount: paid }] : []),
        ...(remaining ? [{ key: "remaining", label: t("remaining"), amount: remaining }] : []),
        ...(refunded ? [{ key: "refunded", label: actions("refunded"), amount: refunded }] : []),
    ];

    return {
        ...base, state: "ready" as const, order, total, rows,
        help: {
            links: { messages: links.messages ?? "/messages", ticket: links.ticket ?? "/support/:ticketId" },
            labels: {
                title: help("title"), body: help("body"), message: help("message"), ticket: help("ticket"),
                ticketTitle: help("ticketTitle"),
                ticketBody: help("ticketBody"), subject: help("subject"), details: help("details"), send: help("send"),
                cancel: help("cancel"), close: help("close"), failed: help("failed"), opened: help("opened"),
            },
        },
        description: order.status === "cancelled" ? actions("cancelledDescription")
            : t(order.paid ? "paymentConfirmed" : "paymentAwaiting"),
        currencyLabel: currencies.of(total?.currency ?? currency) ?? currency,
        facts: [
            ...(order.starts_at ? [{
                key: "starts", term: t("arrive"), detail: orderDate(order.starts_at, locale), icon: "calendar",
            }] : []),
            ...(order.ends_at ? [{
                key: "ends", term: t("depart"), detail: orderDate(order.ends_at, locale), icon: "calendar-check",
            }] : []),
            ...(order.quantity ? [{ key: "quantity", term: t("quantity"), detail: String(order.quantity), icon: "users" }] : []),
            ...(order.status ? [{ key: "status", term: t("status"), detail: status, icon: "seal" }] : []),
            ...(stage ? [{ key: "stage", term: actions("stage"), detail: actions(`stages.${stage}`), icon: "package" }] : []),
            ...(payment ? [{ key: "payment", term: actions("paymentStatus"), detail: list(`payments.${payment}`), icon: "card" }] : []),
        ],
        progress: order.status === "cancelled" ? undefined : {
            label: list("track.label"),
            items: (["placed", "confirmed", "completed"] as const).map(( key, index ) => {

                const reached = order.status === "completed" ? 3 : order.status === "confirmed" ? 2 : 1;

                const state = index < reached ? "done" : index === reached ? "current" : "next";

                return { key, label: list(`track.${key}`), state } as const;

            }),
        },
    };

}
