import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Group } from "@/components/group";
import { Loading } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import { Empty } from "@/elements/empty";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Tabs } from "@/elements/tabs";
import { CouponCard } from "@/features/coupons/components/coupon-card";
import { Feed, Guest } from "@/features/shell";
import { useNudge } from "@/features/shell/hooks/use-nudge";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { type Coupon, usable } from "@/model/coupon";
import { useCouponHistory, useCoupons, useRedeem } from "@/query/coupons";
import { itemsOf } from "@/query/shelf";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";

export function CouponsScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const when = useWhen();
    const [ tab, setTab ] = useState<"mine" | "available" | "history">("mine");

    const mine = tab === "mine";
    const past = tab === "history";
    const list = useCoupons(mine);
    const held = useCoupons(true);
    const history = useCouponHistory(past);

    const owned = new Set(itemsOf(held.data).map(( coupon ) => coupon.code ));
    const ready = itemsOf(held.data).filter(( coupon ) => usable(coupon, Date.now()) ).length;

    useNudge("coupons", token && ready > 0 ? t("nudge.coupons", { count: ready }) : null);
    const offered = mine ? itemsOf(list.data) : itemsOf(list.data).filter(( coupon ) => !owned.has(coupon.code) );
    const redeem = useRedeem();

    const stamp = ( coupon: Coupon ) => coupon.expiresAt
        ? t("coupons.expires", { at: when.date(coupon.expiresAt) })
        : t("coupons.noExpiry");

    const engage = ( coupon: Coupon ) => {

        if ( mine ) {

            void Clipboard.setStringAsync(coupon.code).then(() => notify(t("coupons.copied"), "success") );

            return;

        }

        redeem.mutate(coupon.id, { onSuccess: () => notify(t("coupons.redeemed"), "success") });

    };

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("coupons.title")} onBack={() => retreat() }>
                <Tabs
                    active={tab}
                    onPick={( next ) => setTab(next as "mine" | "available" | "history") }
                    options={[
                        { key: "mine", label: t("coupons.mine"), icon: "coupon" },
                        { key: "available", label: t("coupons.available"), icon: "gift" },
                        { key: "history", label: t("coupons.history"), icon: "clock" },
                    ]}
                />
            </AppBar>

            {!token ? <Guest note={t("coupons.guestBody")} onLogin={() => router.push("/login") } /> : past ? (
                <Feed
                    key="history"
                    list={history}
                    items={history.data ?? []}
                    keyOf={( event ) => `${ event.id }-${ event.at ?? "" }-${ event.status }` }
                    render={( event ) => (
                        <Group>
                            <Row
                                plated
                                tone="warning"
                                icon="coupon"
                                title={event.code || t("coupons.title")}
                                value={event.at ? when.date(event.at) : ""}
                                valueRank="caption"
                                note={t(`coupons.state.${ event.status }`, event.status)}
                            />
                        </Group>
                    )}
                    loading={<Loading shape="rows" rows={5} />}
                    empty={<Empty emblem="gift" title={t("coupons.historyEmptyTitle")} note={t("coupons.historyEmptyBody")} />}
                />
            ) : (
                <Feed
                    key={tab}
                    list={list}
                    items={offered}
                    keyOf={( coupon ) => String(coupon.id) }
                    render={( coupon ) => (
                        <CouponCard
                            coupon={coupon}
                            at={stamp(coupon)}
                            action={mine ? t("coupons.copy") : t("coupons.redeem")}
                            onPress={() => engage(coupon) }
                        />
                    )}
                    loading={<Loading shape="rows" rows={5} />}
                    empty={mine
                        ? <Empty emblem="gift" title={t("coupons.mineEmptyTitle")} note={t("coupons.mineEmptyBody")} action={t("coupons.browseAvailable")} onAction={() => setTab("available") } />
                        : <Empty emblem="gift" title={t("coupons.emptyTitle")} note={t("coupons.emptyBody")} />}
                />
            )}

        </Screen>
    );

}
