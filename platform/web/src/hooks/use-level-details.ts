"use client";

import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { decimal } from "@/lib/std/format";
import { conditionName, humanize, perkKey, perkValue } from "@/lib/std/loyalty";

export function useLevelDetails ( levelId: number | null ) {

    const t = useTranslations("loyalty");
    const locale = useLocale();
    const enabled = levelId != null;
    const view = useRead("levels", "view", { levelId: levelId ?? 0 }, { enabled });
    const benefits = useRead("levels", "benefits", { levelId: levelId ?? 0, limit: 30 }, { enabled });
    const row = view.data;

    return {
        t,
        name: row ? row.name || t("levelRank", { rank: row.rank ?? 0 }) : "",
        description: row?.description ?? null,
        image: row?.image ?? null,
        perks: (row?.perks ?? []).map(( perk ) => ({
            key: perk.key,
            term: perkKey(perk.key) ? t(`perks.${perkKey(perk.key) ?? "discount"}`) : humanize(perk.key),
            detail: perkValue(perk, locale),
        })),
        benefits: [...(benefits.data ?? []), ...(row?.benefits ?? [])]
            .filter(( entry, index, list ) => list.findIndex(( other ) => (other.id ?? other.key) === (entry.id ?? entry.key)) === index)
            .map(( entry ) => ({ key: String(entry.id ?? entry.key), label: entry.label ?? humanize(entry.key) })),
        conditions: (row?.conditions ?? []).map(( condition ) => ({
            key: condition.key,
            label: t("condition", {
                key: conditionName(condition.key, ( known ) => t(`conditions.${known}`)),
                threshold: decimal(condition.threshold, locale, 0) ?? "", days: condition.window_days ?? 0,
            }),
        })),
        loading: view.loading && !row,
        failed: Boolean(view.error),
        reload: () => { view.reload(); benefits.reload(); },
    };

}
