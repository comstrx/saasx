import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Reward } from "@/components/reward";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Screen } from "@/elements/screen";
import { Skeleton } from "@/elements/skeleton";
import { CheckoutReceiptView } from "@/features/checkout/components/receipt";
import { useReturn, useSettling } from "@/features/checkout/hooks/use-payment";
import { Trouble } from "@/features/shell";
import { useBack } from "@/features/shell/hooks/use-back";
import { dealOf } from "@/model/catalog";
import { notFound } from "@/model/failure";
import type { PaymentTarget } from "@/model/payment";
import { receiptFromOrder, receiptPhase } from "@/model/receipt";
import { useCapabilities } from "@/query/contract";
import { useOrder } from "@/query/orders";
import { clearPayment } from "@/store/payment";
import { usePrefs } from "@/store/prefs";
import { useTheme } from "@/theme/use-theme";

export function ThanksScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const params = useLocalSearchParams<{ order?: string; more?: string }>();

    const id = Number(params.order ?? 0) || 0;
    const target = useMemo<PaymentTarget | null>(() => id > 0 ? { kind: "order", id } : null, [ id ]);

    const awaiting = useSettling(target);
    const order = useOrder(id, awaiting);
    const data = order.data;
    const capabilities = useCapabilities(data?.type ?? "");
    const deal = dealOf(capabilities);

    useReturn(() => { void order.refetch(); }, awaiting);

    const phase = data ? receiptPhase(data, awaiting) : null;

    useEffect(() => {

        if ( phase && phase !== "settling" ) clearPayment();

    }, [ phase ]);

    const [ cheered, setCheered ] = useState(false);
    const seen = usePrefs(( state ) => state.seen );
    const see = usePrefs(( state ) => state.see );

    useEffect(() => {

        if ( phase === "paid" && id > 0 && !seen[`cheer:${ id }`] ) setCheered(true);

    }, [ phase, id, seen ]);

    const hush = useCallback(() => {

        if ( id > 0 ) see(`cheer:${ id }`);

        setCheered(false);

    }, [ id, see ]);

    const leave = useCallback(() => router.replace("/"), []);

    useBack(leave);

    const frame = ( children: ReactNode ) => (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("thanks.header")} onBack={leave} />
            {children}
        </Screen>
    );

    if ( id > 0 && order.isPending ) {

        return frame(
            <Box gap="4" style={styles.loading}>
                <Skeleton curve="card" height={theme.art.xl + theme.art.md} />
                <Skeleton curve="card" height={theme.art.lg} />
                <Skeleton curve="card" height={theme.art.xl + theme.space["8"]} />
            </Box>,
        );

    }

    if ( !data || !phase ) {

        return frame(
            <Trouble
                reason={order.error ?? notFound}
                action={t("thanks.orders")}
                onAction={() => router.replace("/orders") }
            />,
        );

    }

    return (
        <>
            <CheckoutReceiptView
                receipt={receiptFromOrder(data)}
                phase={phase}
                deal={deal}
                more={Number(params.more ?? 0) || 0}
                onOrder={() => router.replace(`/order/${ data.id }`) }
                onOrders={() => router.replace("/orders") }
                onHome={() => router.replace("/") }
            />

            <Reward
                open={cheered}
                onClose={hush}
                eyebrow={t("thanks.cheerEyebrow", { context: deal })}
                title={t("thanks.cheerTitle")}
                body={t("thanks.cheerBody", { name: data.title })}
                worth={`#${ data.id }`}
                tone="brand"
                mark="orders"
                action={t("thanks.order", { context: deal })}
                emblem="medal"
                onAction={() => { hush(); router.replace(`/order/${ data.id }`); }}
                celebrate
            />
        </>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    loading: {
        paddingHorizontal: theme.layout.gutter,
    },

}));
