"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Data } from "@/api/features";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { instant, money, percent } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { orderDate } from "@/lib/std/orders";
import { useUi } from "@/stores/provider";

type Coupon = Data<"coupons", "list">;

const views = ["available", "mine", "history"] as const;

export function useCoupons ( login: string ) {

    const t = useTranslations("coupons");
    const locale = useLocale();
    const path = usePathname();
    const search = useSearchParams();
    const toast = useToast();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const signed = ready && Boolean(token);
    const asked = search.get("view");
    const view = views.find(( value ) => value === asked) ?? "available";
    const available = useRead("coupons", "list", { limit: 50 }, { enabled: signed && view === "available" });
    const mine = useRead("coupons", "mine", { limit: 50 }, { enabled: signed && view === "mine" });
    const history = useRead("coupons", "history", { limit: 50 }, { enabled: signed && view === "history" });
    const redeem = useAction("coupons", "redeem");
    const [claimed, setClaimed] = useState<number[]>([]);
    const [opened, setOpened] = useState<number | null>(null);
    const active = view === "available" ? available : view === "mine" ? mine : history;
    const text = ( value: Parameters<typeof money>[0] ) => {

        const found = money(value, locale, "USD", true);

        return found ? found.before ? `${found.currency} ${found.number}` : `${found.number} ${found.currency}` : null;

    };
    const card = ( coupon: Coupon ) => {

        const rate = percent(coupon.rate, locale);
        const amount = text(coupon.value);
        const live = coupon.is_valid !== false && (!coupon.expires_at || instant(coupon.expires_at) > Date.now());

        return {
            key: String(coupon.id), id: coupon.id,
            value: rate ?? amount ?? (coupon.points ? String(coupon.points) : "%"),
            caption: t(rate || amount ? "stub.off" : "stub.points"),
            name: coupon.name || coupon.code || t("coupon"),
            code: coupon.code ?? null,
            description: coupon.description ?? coupon.conditions ?? null,
            terms: [
                text(coupon.min_price) ? t("minimum", { amount: text(coupon.min_price) ?? "" }) : null,
                text(coupon.cap) && rate ? t("cap", { amount: text(coupon.cap) ?? "" }) : null,
                coupon.stackable ? t("stackable") : null,
                coupon.max_uses ? t("uses", { used: coupon.usages ?? 0, max: coupon.max_uses }) : null,
            ].filter(( value ): value is string => Boolean(value)),
            expires: coupon.expires_at ? t("until", { date: orderDate(coupon.expires_at, locale) ?? "" }) : null,
            status: { label: t(live ? "valid" : "expired"), tone: live ? "teal" as const : "neutral" as const },
            inactive: !live,
        };

    };

    async function claim ( id: number ) {

        const answer = await redeem.run({ couponId: id });

        if ( !answer ) {

            toast({ title: t("failed"), tone: "error" });
            return;

        }

        setClaimed(( list ) => [...list, id]);
        toast({ title: t("claimed"), tone: "success" });
        mine.reload();

    }

    return {
        t, ready, token, view, claim, claimed, opened, setOpened,
        login: `${localePath(locale, login, routing)}?${new URLSearchParams({ next: path })}`,
        pending: redeem.pending,
        loading: active.loading && !active.data,
        failed: Boolean(active.error),
        reload: active.reload,
        tabs: views.map(( value ) => ({
            value, label: t(`tabs.${value}`), href: value === "available" ? path : `${path}?${new URLSearchParams({ view: value })}`,
        })),
        cards: (view === "available" ? available.data : view === "mine" ? mine.data : [])?.map(card) ?? [],
        events: (history.data ?? []).map(( event, index ) => ({
            key: `${event.coupon_id ?? "c"}-${event.order_id ?? index}-${event.at ?? index}`,
            title: event.code ? t("used", { code: event.code }) : t("coupon"),
            detail: event.at ? orderDate(event.at, locale) ?? "" : null,
            icon: "tag",
            value: text(event.discount) ? `−${text(event.discount)}` : null,
            credit: true,
            status: event.status ? {
                label: event.status, tone: event.status === "applied" || event.status === "used" ? "positive" as const : "neutral" as const,
            } : null,
        })),
    };

}
