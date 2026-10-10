import { router, useIsFocused } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { RewardProps } from "@/components/reward";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type Coupon, welcomeGift, worth } from "@/model/coupon";
import { useCoupons } from "@/query/coupons";
import { itemsOf } from "@/query/shelf";
import { dayKey } from "@/std/number";
import { usePrefs } from "@/store/prefs";

export function useRewards () {

    const { t } = useTranslation();
    const focused = useIsFocused();
    const seen = usePrefs(( state ) => state.seen );
    const see = usePrefs(( state ) => state.see );
    const gifts = useCoupons(false);
    const held = useCoupons(true);
    const today = `gift:${ dayKey() }`;
    const cash = useMoney();
    const [ gifted, setGifted ] = useState<Coupon | null>(null);
    const [ giftOpen, setGiftOpen ] = useState(false);

    const gift = useMemo(() => {

        if ( seen[today] || !held.data ) return null;

        return welcomeGift(itemsOf(gifts.data), itemsOf(held.data), Date.now());

    }, [ gifts.data, held.data, seen, today ]);

    useEffect(() => {

        if ( focused && gift && !gifted ) { setGifted(gift); setGiftOpen(true); }

    }, [ focused, gift, gifted ]);

    const closeGift = useCallback(() => { see(today); setGiftOpen(false); }, [ see, today ]);

    const reward: RewardProps | null = gifted ? {
        open: giftOpen && focused,
        onClose: closeGift,
        eyebrow: t("home.giftEyebrow"),
        title: gifted.name || t("home.giftTitle"),
        body: gifted.note || t("home.giftBody"),
        worth: worth(gifted, ( value, currency ) => cash.amount(value, currency) ),
        code: gifted.code,
        action: t("home.giftAction"),
        emblem: "gift",
        onAction: () => { closeGift(); router.push("/coupons"); },
    } : null;

    return { reward, active: giftOpen };

}
