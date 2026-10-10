import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { useCountdown } from "@/elements/hooks/use-countdown";
import { chevronNext, Icon } from "@/elements/icon";
import { Otp } from "@/elements/otp";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { AuthPanel } from "@/features/auth/components/auth-panel";
import { leave, originOf, settle } from "@/features/auth/flow";
import { useAuthCleanup, useAuthDraft } from "@/features/auth/hooks/use-auth-draft";
import { retreat } from "@/features/shell/retreat";
import { codeLength } from "@/model/auth";
import { useResendOtp, useVerifyOtp } from "@/query/auth";
import { secondsUntil, timer } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

const owned = [ "otp", "code", "challenge_token" ] as const;

export function VerifyScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const params = useLocalSearchParams<{ challenge?: string; destination?: string; origin?: string; length?: string; retry?: string }>();
    const initial = useMemo(() => ({
        challenge: params.challenge ?? "", code: "", expired: false,
        destination: params.destination ?? "", length: codeLength(params.length),
    }), [ params.challenge, params.destination, params.length ]);
    const { form, patch, change, clear, busy, fields, run } = useAuthDraft(initial, owned);
    const { challenge, code, expired, destination, length } = form;
    const { left, reset } = useCountdown(secondsUntil(params.retry));
    const { mutateAsync: verify, reset: clearVerify } = useVerifyOtp();
    const { mutateAsync: reissue, reset: clearResend } = useResendOtp();

    useAuthCleanup(() => { clearVerify(); clearResend(); });

    const tried = useRef("");

    const origin = originOf(params.origin);

    useEffect(() => { clear(); tried.current = ""; }, [ clear ]);

    const submit = useCallback(async () => {

        if ( !challenge || expired || code.length !== length ) return;
        const outcome = await run("verify", ( attempt ) => verify({ challenge, otp: code, attempt }) );

        if ( !outcome.ok ) {

            if ( outcome.fields.challenge_token ) patch({ code: "", expired: true });
            return;

        }

        await settle(outcome.value, origin);

    }, [ challenge, code, expired, length, origin, run, verify, patch ]);

    useEffect(() => {

        if ( code.length !== length ) { tried.current = ""; return; }
        if ( busy || tried.current === code || !challenge || expired ) return;

        tried.current = code;
        submit();

    }, [ code, length, busy, challenge, expired, submit ]);

    const resend = async () => {

        if ( !challenge || expired || left > 0 ) return;
        const outcome = await run("resend", ( attempt ) => reissue({ challenge, attempt }) );

        if ( !outcome.ok ) {

            if ( outcome.fields.challenge_token ) patch({ code: "", expired: true });
            return;

        }

        patch({
            challenge: outcome.value.challenge_token, code: "",
            destination: outcome.value.destination, length: codeLength(String(outcome.value.length ?? length)),
        });
        tried.current = "";
        reset(secondsUntil(outcome.value.retry_at));

    };

    const wrong = fields.otp ?? fields.code;
    const waiting = busy || left > 0 || !challenge || expired;

    return (
        <AuthPanel
            onBack={leave}
            figure="key"
            title={t("auth.verifyTitle")}
            body={t("auth.verifyBody", { length })}
            destination={destination}
            footLink={!challenge || expired ? undefined : t("auth.backToLogin")}
            onFoot={() => router.replace("/login") }
        >
            {!challenge || expired ? (
                <>
                    <Text rank="caption" tint="danger" align="center">{t("auth.resetNoToken")}</Text>
                    <Button label={t("auth.backToLogin")} onPress={() => router.replace("/login") } />
                </>
            ) : (
                <>
                    <View style={styles.entry}>
                        <Otp length={length} value={code} onChange={change("code")} error={Boolean(wrong)} label={t("auth.codeLabel")} autoFocus />

                        {wrong ? <Text rank="caption" tint="danger" align="center">{wrong}</Text> : null}
                    </View>

                    <View style={styles.again}>
                        <Press style={styles.row} onPress={resend} disabled={waiting} sink="tile" accessibilityRole="button">
                            <Icon name="refresh" size={theme.icon.sm} tint={waiting ? "faint" : "brand"} />

                            {waiting
                                ? (
                                    <>
                                        <Text rank="caption" ink="soft">{t("auth.resendIn")}</Text>
                                        <Text rank="label" tint="brand" ltr>{timer(left)}</Text>
                                    </>
                                )
                                : <Text rank="label" tint="brand">{t("auth.resend")}</Text>}
                        </Press>

                        <Press style={styles.row} onPress={() => retreat() } sink="tile" accessibilityRole="button">
                            <Text rank="label" ink="soft">{t("auth.changeContact")}</Text>
                        </Press>
                    </View>

                    <Button
                        label={t("auth.verifyAction")}
                        trailing={chevronNext}
                        loading={busy}
                        disabled={code.length !== length || !challenge || expired}
                        onPress={submit}
                    />
                </>
            )}
        </AuthPanel>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    entry: {
        gap: theme.space["3"],
        paddingHorizontal: theme.space["2"],
    },
    again: {
        alignItems: "center",
        gap: theme.space["3"],
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["2"],
    },

}));
