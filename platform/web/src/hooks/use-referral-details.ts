"use client";

import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { orderDate } from "@/lib/std/orders";
import { initials } from "@/lib/std/text";

export function useReferralDetails ( referralId: number | null ) {

    const t = useTranslations("referrals");
    const locale = useLocale();
    const view = useRead("referrals", "view", { referralId: referralId ?? 0 }, { enabled: referralId != null });
    const row = view.data;
    const name = row?.referred?.name || t("friend");

    return {
        t, name,
        image: row?.referred?.image ?? null,
        initials: initials(name),
        loading: view.loading && !row,
        failed: Boolean(view.error),
        reload: view.reload,
        facts: row ? [
            { key: "joined", term: t("detail.joined"), detail: orderDate(row.created_at, locale) ?? undefined, icon: "calendar" },
            { key: "status", term: t("detail.status"), detail: t(row.active ? "active" : "inactive"), icon: "check-circle" },
            { key: "reward", term: t("detail.reward"), detail: t(row.active ? "detail.earned" : "detail.waiting"), icon: "gift" },
        ] : [],
    };

}
