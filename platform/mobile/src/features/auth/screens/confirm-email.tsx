import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Spinner } from "@/elements/spinner";
import { AuthPanel } from "@/features/auth/components/auth-panel";
import { leave } from "@/features/auth/flow";
import { failureShape } from "@/model/failure";
import { useConfirmEmail } from "@/query/account";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

export function ConfirmEmailScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const params = useLocalSearchParams<{ token?: string }>();
    const token = params.token ?? "";
    const signed = useSession(( state ) => Boolean(state.token) );
    const confirm = useConfirmEmail();
    const sent = useRef(false);

    useEffect(() => {

        if ( sent.current || !token ) return;

        sent.current = true;
        confirm.mutate(token);

    }, [ token, confirm ]);

    const failure = confirm.isError ? failureShape(confirm.error) : null;
    const stalled = failure?.retryable ? failure : null;
    const phase = !token || failure ? "broken" : confirm.isSuccess ? "done" : "checking";

    return (
        <AuthPanel
            onBack={leave}
            figure="mail"
            title={t(`auth.confirm.${ stalled ? "retry" : phase }Title`)}
            body={t(`auth.confirm.${ stalled ? "retry" : phase }Body`)}
            notice={stalled?.body}
        >
            {stalled ? (
                <Button label={t("common.retry")} onPress={() => confirm.mutate(token)} />
            ) : phase === "checking" ? (
                <Box align="center" style={styles.waiting}>
                    <Spinner size={theme.icon.xl} tint="brand" />
                </Box>
            ) : (
                <Button
                    label={signed ? t("auth.confirm.toAccount") : t("auth.backToLogin")}
                    onPress={() => router.replace(signed ? "/personal" : "/login") }
                />
            )}
        </AuthPanel>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    waiting: {
        paddingVertical: theme.space["6"],
    },

}));
