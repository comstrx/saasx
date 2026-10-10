import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Screen } from "@/elements/screen";
import { Skeleton } from "@/elements/skeleton";
import { usePendingPayment } from "@/store/payment";
import { useTheme } from "@/theme/use-theme";

export function PaymentReturnScreen () {

    const theme = useTheme();
    const pending = usePendingPayment(( state ) => state.pending );

    useEffect(() => {

        const target = pending?.target;

        if ( target?.kind === "order" ) { router.replace({ pathname: "/thanks", params: { order: String(target.id) } }); return; }

        router.replace(target?.kind === "orders" ? "/orders" : target ? "/wallet" : "/");

    }, [ pending ]);

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <Box style={styles.body}>
                <Skeleton curve="card" height={theme.art.xl + theme.art.md} />
                <Skeleton curve="card" height={theme.art.lg} />
            </Box>
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    body: {
        gap: theme.space["4"],
        paddingTop: theme.space["4"],
        paddingHorizontal: theme.layout.gutter,
    },

}));
