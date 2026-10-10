import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Heading } from "@/elements/heading";
import { Logo } from "@/elements/logo";
import { Screen } from "@/elements/screen";
import { settle } from "@/features/auth/flow";
import { failureShape } from "@/model/failure";
import { useSocialExchange } from "@/query/auth";
import { notify } from "@/store/notice";
import { useTheme } from "@/theme/use-theme";

export function SocialScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const params = useLocalSearchParams<{ code?: string; error?: string }>();
    const redeemed = useRef(false);
    const { mutateAsync: exchange } = useSocialExchange();

    const code = params.code ?? "";
    const error = params.error ?? "";

    useEffect(() => {

        if ( redeemed.current ) return;

        redeemed.current = true;

        if ( !code ) {

            notify(t(error ? "auth.socialFailed" : "auth.socialCancelled"), error ? "danger" : "info");
            router.replace("/login");

            return;

        }

        void ( async () => {

            try {

                await settle(await exchange(code), "login");

            }
            catch ( reason ) {

                const failure = failureShape(reason);

                notify(failure.retryable ? failure.body : t("auth.socialFailed"));
                router.replace("/login");

            }

        } )();

    }, [ code, error, exchange, t ]);

    return (
        <Screen centered>
            <View style={styles.block}>
                <Logo size={theme.mark.md} word />

                <ActivityIndicator size="large" color={theme.tone.brand.base} />

                <Heading look="brief" title={t("auth.socialTitle")} body={t("auth.socialWorking")} />
            </View>
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    block: {
        alignItems: "center",
        gap: theme.space["6"],
    },

}));
