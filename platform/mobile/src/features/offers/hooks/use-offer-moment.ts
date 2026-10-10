import { useIsFocused } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { RewardProps } from "@/components/reward";
import { sceneOf } from "@/features/catalog/marks";
import { useWhen } from "@/features/shell/hooks/use-when";
import { daysAway } from "@/model/detail";
import type { Offer } from "@/model/offer";
import { formatNumber } from "@/std/number";
import type { ToneName } from "@/theme/roles";

type Urgency = { label: string; tint: ToneName };

const pressing = 7;

export function useOfferEnd () {

    const { t, i18n } = useTranslation();
    const when = useWhen();

    return useCallback(( endsAt: string | null ): Urgency | undefined => {

        const away = endsAt ? daysAway(endsAt) : -1;

        if ( !endsAt || away < 0 ) return undefined;
        if ( away === 0 ) return { label: t("home.offerLastDay"), tint: "danger" };
        if ( away <= pressing ) return { label: t("home.offerEndsIn", { count: away, value: formatNumber(i18n.language, away) }), tint: "warning" };

        return { label: t("home.offerUntil", { date: when.date(endsAt) }), tint: "neutral" };

    }, [ t, i18n.language, when ]);

}

export function useOfferMoment ( onExplore: () => void ) {

    const { t } = useTranslation();
    const focused = useIsFocused();
    const end = useOfferEnd();
    const [ promo, setPromo ] = useState<Offer | null>(null);
    const [ open, setOpen ] = useState(false);

    const show = useCallback(( offer: Offer ) => { setPromo(offer); setOpen(true); }, []);

    const moment: RewardProps | null = promo ? {
        open: open && focused,
        onClose: () => setOpen(false),
        eyebrow: t(`home.offerKind.${ promo.type }`, { defaultValue: t("home.offersTitle") }),
        title: promo.title,
        body: promo.body || t("home.offersBody"),
        worth: promo.badge ?? undefined,
        action: t("home.offerAction"),
        emblem: sceneOf(promo.type),
        tone: "accent",
        urgency: end(promo.endsAt),
        onAction: () => { setOpen(false); onExplore(); },
    } : null;

    return { moment, show };

}
