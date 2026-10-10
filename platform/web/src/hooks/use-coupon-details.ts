"use client";

import { useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { money, percent } from "@/lib/std/format";
import { orderDate } from "@/lib/std/orders";

export function useCouponDetails ( couponId: number | null ) {

    const t = useTranslations("coupons");
    const locale = useLocale();
    const toast = useToast();
    const view = useRead("coupons", "view", { couponId: couponId ?? 0 }, { enabled: couponId != null });
    const row = view.data;
    const amount = ( value: Parameters<typeof money>[0] ) => {

        const found = money(value, locale, "USD");

        return found ? found.before ? `${found.currency} ${found.number}` : `${found.number} ${found.currency}` : null;

    };
    const rate = row?.value_type === "percent" || Number(row?.rate) > 0 ? percent(row?.rate, locale) : undefined;
    const left = row?.max_usages ? Math.max(0, row.max_usages - (row.usages ?? 0)) : null;
    const worth = rate ?? amount(row?.value) ?? (row?.points ? t("detail.points", { points: row.points }) : null);
    const facts = row ? [
        { key: "value", term: t("detail.value"), detail: worth },
        { key: "minimum", term: t("detail.minimum"), detail: amount(row.min_price) },
        { key: "cap", term: t("detail.cap"), detail: amount(row.cap) },
        { key: "uses", term: t("detail.perPerson"), detail: row.max_uses ? t("detail.times", { count: row.max_uses }) : null },
        { key: "left", term: t("detail.left"), detail: left == null ? null : t("detail.times", { count: left }) },
        { key: "starts", term: t("detail.starts"), detail: row.starts_at ? orderDate(row.starts_at, locale) ?? null : null },
        { key: "ends", term: t("detail.ends"), detail: row.expires_at ? orderDate(row.expires_at, locale) ?? null : t("detail.open") },
        { key: "stackable", term: t("detail.stacking"), detail: t(row.stackable ? "detail.stacks" : "detail.alone") },
    ].flatMap(( fact ) => fact.detail ? [{ key: fact.key, term: fact.term, detail: fact.detail }] : []) : [];

    async function copy () {

        if ( !row?.code ) return;

        const done = !!navigator.clipboard && await navigator.clipboard.writeText(row.code).then(() => true, () => false);

        toast(done ? { title: t("detail.copied", { code: row.code }), tone: "success" } : { title: t("failed"), tone: "error" });

    }

    return {
        t, facts, copy,
        name: row?.name || row?.code || t("coupon"),
        code: row?.code ?? null,
        about: [row?.description, row?.conditions].filter(( value ): value is string => Boolean(value)),
        valid: row?.is_valid !== false,
        loading: view.loading && !row,
        failed: Boolean(view.error),
        reload: view.reload,
    };

}
