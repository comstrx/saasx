"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { decimal, percent } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { amountText, conditionName, humanize, perkKey, perkValue } from "@/lib/std/loyalty";
import { orderDate } from "@/lib/std/orders";
import { useUi } from "@/stores/provider";

const kindKeys = ["order", "review", "referral", "signup", "register", "birthday", "level", "booking", "deposit"] as const;
const stateKeys = ["granted", "pending", "clawed", "reversed"] as const;

function known<K extends string> ( keys: readonly K[], key: string | null | undefined ): K | undefined {

    return keys.find(( item ) => item === key);

}
export function useRewards ( login: string ) {

    const t = useTranslations("loyalty");
    const locale = useLocale();
    const path = usePathname();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const signed = ready && Boolean(token);
    const [levelId, setLevel] = useState<number | null>(null);
    const [rewardId, setReward] = useState<number | null>(null);
    const account = useRead("account", "read", {}, { enabled: signed });
    const levels = useRead("levels", "list", { limit: 20, sort: "oldest" }, { enabled: signed });
    const rewards = useRead("rewards", "list", { limit: 20 }, { enabled: signed });
    const history = useRead("rewards", "history", { limit: 20 }, { enabled: signed });
    const rank = account.data?.user.level ?? 0;
    const ladder = [...(levels.data ?? [])].sort(( a, b ) => (a.rank ?? 0) - (b.rank ?? 0));
    const current = ladder.find(( level ) => (level.rank ?? 0) === rank)
        ?? ladder.filter(( level ) => (level.rank ?? 0) <= rank).at(-1) ?? null;
    const next = ladder.find(( level ) => (level.rank ?? 0) > (current?.rank ?? rank)) ?? null;
    const points = decimal(account.data?.user.wallet?.points, locale, 0) ?? "0";
    const kindLabel = ( key: string | null | undefined ) => {

        const found = known(kindKeys, key);

        return found ? t(`kinds.${found}`) : null;

    };

    return {
        t, ready, token, levelId, setLevel, rewardId, setReward,
        login: `${localePath(locale, login, routing)}?${new URLSearchParams({ next: path })}`,
        loading: account.loading && !account.data,
        failed: Boolean(account.error),
        reload: () => { account.reload(); levels.reload(); rewards.reload(); history.reload(); },
        points,
        level: !current ? { name: t("starter"), description: t("starterBody"), image: null, perks: [], benefits: [] } : {
            name: current.name || t("levelRank", { rank: current.rank ?? rank }),
            description: current.description ?? null,
            image: current.image ?? null,
            perks: (current.perks ?? []).map(( perk ) => ({
                key: perk.key,
                label: perkKey(perk.key) ? t(`perks.${perkKey(perk.key) ?? "discount"}`) : humanize(perk.key),
                value: perkValue(perk, locale),
            })),
            benefits: (current.benefits ?? []).map(( benefit ) => ({
                key: String(benefit.id ?? benefit.key), label: benefit.label ?? benefit.key ?? "",
            })),
        },
        next: next ? {
            name: next.name || t("levelRank", { rank: next.rank ?? rank + 1 }),
            conditions: (next.conditions ?? []).map(( condition ) => ({
                key: condition.key,
                label: t("condition", {
                    key: conditionName(condition.key, ( known ) => t(`conditions.${known}`)),
                    threshold: decimal(condition.threshold, locale, 0) ?? "",
                    days: condition.window_days ?? 0,
                }),
            })),
        } : null,
        ladder: ladder.map(( level ) => ({
            key: String(level.id), name: level.name || t("levelRank", { rank: level.rank ?? 0 }),
            reached: (level.rank ?? 0) <= (current?.rank ?? rank),
            current: level.id === current?.id,
        })),
        rewards: (rewards.data ?? []).map(( reward ) => ({
            key: String(reward.id),
            id: reward.id,
            value: percent(reward.rate, locale) ?? amountText(reward.value, locale)
                ?? (reward.points ? t("pointsShort", { points: decimal(reward.points, locale, 0) ?? "" }) : "★"),
            caption: t(reward.points && !reward.rate && !reward.value ? "stub.points" : "stub.reward"),
            name: kindLabel(reward.type) ?? (humanize(reward.key) || t("reward")),
            description: reward.cadence ? t("cadence", { cadence: reward.cadence }) : null,
            terms: [
                reward.cap ? t("cap", { amount: amountText(reward.cap, locale) ?? "" }) : null,
                reward.coupon?.code ? t("withCode", { code: reward.coupon.code }) : null,
            ].filter(( value ): value is string => Boolean(value)),
            expires: reward.expires_at ? t("until", { date: orderDate(reward.expires_at, locale) ?? "" }) : null,
        })),
        history: (history.data ?? []).map(( event ) => ({
            key: String(event.id),
            title: kindLabel(event.occurrence?.split(":")[0]) ?? (humanize(event.occurrence?.split(":")[0]) || t("reward")),
            detail: event.at ? orderDate(event.at, locale) ?? "" : null,
            icon: event.snapshot?.coupon ? "tag" : event.snapshot?.points ? "medal" : "gift",
            value: event.snapshot?.points
                ? t("pointsShort", { points: decimal(event.snapshot.points, locale, 0) ?? "" })
                : amountText(event.snapshot?.amount, locale),
            credit: event.status !== "clawed" && event.status !== "reversed",
            status: event.status ? {
                label: known(stateKeys, event.status) ? t(`states.${known(stateKeys, event.status) ?? "pending"}`) : humanize(event.status),
                tone: event.status === "granted" ? "positive" as const
                    : event.status === "pending" ? "attention" as const : "neutral" as const,
            } : null,
        })),
        listLoading: (rewards.loading && !rewards.data) || (history.loading && !history.data),
    };

}
