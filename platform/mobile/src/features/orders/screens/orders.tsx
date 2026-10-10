import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loading } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import { Empty } from "@/elements/empty";
import { Screen } from "@/elements/screen";
import { Tabs } from "@/elements/tabs";
import { OrderCard } from "@/features/orders/components/order-card";
import { Feed, Filtered, Guest } from "@/features/shell";
import { Intro } from "@/features/shell/components/intro";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { dead, type Order, settled } from "@/model/order";
import { useOrders } from "@/query/orders";
import { itemsOf } from "@/query/shelf";
import { useSession } from "@/store/session";

type Bucket = "all" | "active" | "done" | "off";

const fits = ( order: Order, bucket: Bucket ): boolean => {

    if ( bucket === "active" ) return !dead(order.state) && order.state !== "completed";
    if ( bucket === "done" ) return settled(order.state) && order.state === "completed";
    if ( bucket === "off" ) return dead(order.state);

    return true;

};

export function OrdersScreen () {

    const { t } = useTranslation();
    const when = useWhen();
    const token = useSession(( state ) => state.token );
    const orders = useOrders();

    const [ bucket, setBucket ] = useState<Bucket>("all");

    const shown = useMemo(
        () => itemsOf(orders.data).filter(( order ) => fits(order, bucket) ),
        [ orders.data, bucket ],
    );

    if ( !token ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar title={t("orders.title")} onBack={() => retreat() } />

                <Guest note={t("orders.guestBody")} onLogin={() => router.push("/login")} />
            </Screen>
        );

    }

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("orders.title")} onBack={() => retreat() }>
                <Tabs
                    active={bucket}
                    onPick={setBucket}
                    options={[
                        { key: "all", label: t("orders.all"), icon: "orders" },
                        { key: "active", label: t("orders.active"), icon: "clock" },
                        { key: "done", label: t("orders.done"), icon: "checkCircle" },
                        { key: "off", label: t("orders.off"), icon: "xCircle" },
                    ]}
                />
            </AppBar>

            <Feed
                key={bucket}
                list={orders}
                items={shown}
                keyOf={( order ) => String(order.id) }
                render={( order ) => (
                    <OrderCard
                        order={order}
                        at={when.date(order.at)}
                        onPress={() => router.push(`/order/${ order.id }`) }
                        onPay={() => router.push(`/order/${ order.id }`) }
                    />
                )}
                loading={<Loading shape="card" rows={4} />}
                empty={bucket === "all" ? <Empty emblem="suitcase" title={t("orders.emptyTitle")} note={t("orders.emptyBody")} /> : <Filtered emblem="suitcase" filter={t(`orders.${ bucket }`)} all={t("orders.all")} />}
                docked
            />

            <Intro
                page="orders"
                emblem="suitcase"
                title={t("intro.orders.title")}
                line={t("intro.orders.line")}
                dismiss={t("intro.dismiss")}
            />
        </Screen>
    );

}
