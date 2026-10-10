"use client";

import { useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { decimal, percent } from "@/lib/std/format";
import { amountText, humanize } from "@/lib/std/loyalty";
import { orderDate } from "@/lib/std/orders";

const kinds = ["order", "review", "referral", "signup", "register", "birthday", "level", "booking", "deposit"] as const;

export function useRewardDetails ( rewardId: number | null ) {

    const t = useTranslations("loyalty");
    const locale = useLocale();
    const toast = useToast();
    const view = useRead("rewards", "view", { rewardId: rewardId ?? 0 }, { enabled: rewardId != null });
    const row = view.data;
    const kind = kinds.find(( entry ) => entry === row?.type);
    const worth = percent(row?.rate, locale) ?? amountText(row?.value, locale)
        ?? (row?.points ? t("pointsShort", { points: decimal(row.points, locale, 0) ?? "" }) : null);
    const repeat = row?.cadence_limit
        ? t("detail.repeats", { count: row.cadence_limit, days: row.cadence_days ?? 0 }) : row?.cadence ?? null;
    const facts = row ? [
        { key: "value", term: t("detail.value"), detail: worth },
        { key: "cap", term: t("detail.cap"), detail: amountText(row.cap, locale) },
        { key: "repeat", term: t("detail.repeat"), detail: repeat },
        { key: "starts", term: t("detail.starts"), detail: row.starts_at ? orderDate(row.starts_at, locale) ?? null : null },
        { key: "ends", term: t("detail.ends"), detail: row.expires_at ? orderDate(row.expires_at, locale) ?? null : t("detail.open") },
    ].flatMap(( fact ) => fact.detail ? [{ key: fact.key, term: fact.term, detail: fact.detail }] : []) : [];

    async function copy () {

        const code = row?.coupon?.code;

        if ( !code ) return;

        const done = !!navigator.clipboard && await navigator.clipboard.writeText(code).then(() => true, () => false);

        toast(done ? { title: t("detail.copied", { code }), tone: "success" } : { title: t("unavailable"), tone: "error" });

    }

    return {
        t, facts, copy,
        name: kind ? t(`kinds.${kind}`) : humanize(row?.key) || t("reward"),
        code: row?.coupon?.code ?? null,
        loading: view.loading && !row,
        failed: Boolean(view.error),
        reload: view.reload,
    };

}
