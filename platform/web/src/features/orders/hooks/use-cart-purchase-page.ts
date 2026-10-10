"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { type CartReviewInput, useCartPurchase } from "@/hooks/use-cart-purchase";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { cartCharges, cartSelection } from "@/lib/std/cart-purchase";
import { money } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";
import type { CheckoutLinks } from "./use-checkout-route";

export function useCartPurchasePage ( links: CheckoutLinks ) {

    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const user = useUi(( state ) => state.user);
    const locale = useLocale();
    const t = useTranslations("cartPurchase");
    const checkout = useTranslations("checkout");
    const orders = useTranslations("orders");
    const router = useRouter();
    const pathname = usePathname();
    const query = useSearchParams();
    const raw = query.get("items");
    const parsed = useMemo(() => cartSelection(raw), [raw]);
    const ids = parsed ?? [];
    const purchase = useCartPurchase(ids);
    const readable = !!user?.permissions?.includes("view_carts");
    const request = useRead("cart", "list", { limit: 100, ...(ids.length ? { ids } : {}) }, {
        enabled: ready && !!token && readable && parsed !== null,
    });
    const selected = ids.join(",");
    const path = localePath(locale, links.group ?? "/cart/checkout", routing);
    const back = `${path}?${new URLSearchParams({ items: selected })}`;
    const focused = Number(query.get("item"));
    const current = ids.includes(focused) && !purchase.excluded.includes(focused) ? focused : null;
    const items = request.data?.items ?? [];
    const total = request.data?.summary?.lines;
    const canExpand = raw === null && !!total && total <= 100 && items.length === total;
    const denied = !readable || request.error?.status === 403;
    const allowed = !denied && !!user?.permissions?.includes("add_orders");
    const confirmation = useConfirmation(purchase.error, purchase.signature, purchase.locked, purchase.clear);

    useEffect(() => {

        if ( !canExpand ) return;

        const members = items.map(( item ) => item.id).sort(( a, b ) => a - b).join(",");

        router.replace(`${path}?${new URLSearchParams({ items: members })}` as Route);

    }, [canExpand, items, path, router]);

    const rows = ids.map(( id, index ) => {

        const item = items.find(( item ) => item.id === id);
        const reviewed = purchase.reviews.find(( row ) => row.input.id === id);
        const excluded = purchase.excluded.includes(id);
        const available = !!item?.catalog;
        const changed = !!reviewed && Number(reviewed.input.quantity) !== Number(item?.quantity);
        const approved = reviewed?.approved === true && available && !changed;
        const amount = approved ? money(reviewed.method === "later" ? "0" : reviewed.input.amount, locale, reviewed.currency, true) : null;

        return {
            id, name: reviewed?.name ?? item?.catalog?.name ?? t("item", { index: index + 1 }),
            image: reviewed?.image ?? item?.catalog?.image,
            reference: t("item", { index: index + 1 }),
            status: {
                label: t(excluded ? "excluded" : !available ? "unavailable" : approved ? "reviewed" : "needsReview"),
                tone: excluded ? "neutral" as const : !available ? "negative" as const
                    : approved ? "positive" as const : "attention" as const,
            },
            description: approved ? t(reviewed.method === "later" ? "payLater" : "payWallet") : changed ? t("changed") : undefined,
            amount,
            available, approved, excluded,
        };

    });
    const active = rows.filter(( row ) => !row.excluded);
    const valid = active.length > 0 && active.every(( row ) => row.approved);
    const charges = cartCharges(purchase.reviews.filter(( row ) => row.approved && purchase.active.includes(row.input.id)).map(( row ) => ({
        currency: row.currency, amount: row.method === "later" ? "0" : String(row.input.amount ?? ""),
    })));
    const totals = (charges ?? []).flatMap(( row ) => {

        const amount = money(row.amount, locale, row.currency, true);

        return amount ? [{ label: t("dueNow"), amount }] : [];

    });
    const disabled = !allowed || !valid || !purchase.prepared || !!request.error || request.loading || charges === null;

    function edit ( id: number ) {

        if ( !allowed || !purchase.edit(id) ) return;

        router.replace(`${back}&${new URLSearchParams({ item: String(id) })}` as Route);

    }
    function save ( value: CartReviewInput ) {

        if ( !allowed || !purchase.remember(value) ) return false;

        router.replace(back as Route);

        return true;

    }
    async function submit ( resend = false ) {

        if ( !allowed ) return;

        if ( purchase.attempt ) {

            await purchase.run();
            return;

        }

        if ( disabled || resend && confirmation.retry > 0 ) return;

        if ( !resend && confirmation.challenge
            && (confirmation.expired || confirmation.code.length !== confirmation.challenge.length) ) return;

        await purchase.run(resend ? undefined : confirmation.code);

    }

    return {
        ready, token, user, parsed, ids, request, purchase, rows, totals, current, back, edit, save, submit, disabled, denied, allowed,
        confirmation, expanding: canExpand, total, readable,
        cart: localePath(locale, links.cart ?? "/cart", routing),
        login: `${localePath(locale, links.login, routing)}?${new URLSearchParams({
            next: `${pathname}${query.size ? `?${query}` : ""}`,
        })}`,
        remaining: active.filter(( row ) => !row.approved).length,
        message: purchase.error && !purchase.error.confirmation
            ? Object.values(purchase.error.errors).flat()[0] || t("failed") : null,
        recoveryMessage: !allowed ? t("denied") : purchase.storageIssue ? checkout("storageUnavailable")
            : purchase.blocked ? checkout("recoveryBlocked") : t("uncertain"),
        resultLinks: purchase.result?.orders.map(( order ) => ({
            id: order.id, name: order.name || orders("reference", { id: String(order.id) }),
            href: localePath(locale, links.order.replace(":orderId", String(order.id)), routing),
            reference: orders("reference", { id: String(order.id) }),
            status: {
                label: order.paymentState ? orders(`payments.${order.paymentState}`)
                    : order.paid ? orders("payments.paid") : order.paid === false ? t("paymentPending") : checkout("states.unknown"),
                tone: order.paid == null ? "neutral" as const : order.paid ? "positive" as const : "attention" as const,
            },
            action: checkout("viewOrder"),
        })) ?? [],
        again: purchase.result?.failed.length
            ? `${path}?${new URLSearchParams({ items: purchase.result.failed.join(",") })}` : null,
    };

}
