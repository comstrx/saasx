import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { Field } from "@/elements/field";
import { Otp } from "@/elements/otp";
import { Text } from "@/elements/text";
import { AuthPanel } from "@/features/auth/components/auth-panel";
import { PasswordRules } from "@/features/auth/components/password-rules";
import { leave } from "@/features/auth/flow";
import { useAuthCleanup, useAuthDraft } from "@/features/auth/hooks/use-auth-draft";
import { codeLength, validatePasswords } from "@/model/auth";
import { useResetPassword } from "@/query/auth";
import { usePasswordPolicy } from "@/query/contract";
import { strong } from "@/std/password";
import { notify } from "@/store/notice";

const owned = [ "password", "password_confirmation", "otp", "challenge_token", "token" ] as const;

const initial = { code: "", password: "", confirm: "", hidden: true, expired: false };

export function ResetScreen () {

    const { t } = useTranslation();
    const params = useLocalSearchParams<{ challenge?: string; token?: string; destination?: string; length?: string; retry?: string }>();
    const { form, patch, change, clear, busy, fields, run } = useAuthDraft(initial, owned);
    const { code, password, confirm, hidden, expired } = form;
    const { mutateAsync: reset, reset: clearMutation } = useResetPassword();
    useAuthCleanup(clearMutation);
    const policy = usePasswordPolicy();

    const challenge = params.challenge ?? "";
    const token = params.token ?? "";
    const length = codeLength(params.length);
    const coded = Boolean(challenge);
    const credited = !expired && ( coded || Boolean(token) );

    useEffect(() => {

        clear();
        if ( !challenge && !token ) patch({ expired: true });

    }, [ challenge, token, clear, patch ]);

    const submit = async () => {

        if ( !credited || ( coded && code.length !== length ) ) return;

        const credential = coded
            ? { challenge_token: challenge, otp: code }
            : { token };

        const outcome = await run("reset", ( attempt ) => {

            validatePasswords(password, confirm, policy);
            return reset({ body: { ...credential, password, password_confirmation: confirm }, attempt });

        });

        if ( !outcome.ok ) {

            if ( outcome.fields.token || outcome.fields.challenge_token ) patch({ ...initial, expired: true });
            return;

        }

        notify(t("auth.resetDone"), "success");
        router.replace("/login");

    };

    return (
        <AuthPanel
            onBack={leave}
            figure="lock"
            title={t("auth.resetTitle")}
            body={coded ? t("auth.resetSent", { length }) : t("auth.resetBody")}
            destination={coded ? params.destination : undefined}
            footLink={t("auth.backToLogin")}
            onFoot={() => router.replace("/login") }
        >
            {credited ? (
                <>
                    {coded ? (
                        <>
                            <Otp length={length} value={code} onChange={change("code")} error={Boolean(fields.otp)} label={t("auth.codeLabel")} autoFocus />

                            {fields.otp ? <Text rank="caption" tint="danger" align="center">{fields.otp}</Text> : null}
                        </>
                    ) : null}

                    <Field
                        placeholder={t("auth.newPassword")}
                        icon="lock"
                        value={password}
                        onChangeText={change("password")}
                        secureTextEntry={hidden}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        action={hidden ? "eye" : "eyeOff"}
                        actionLabel={t(hidden ? "auth.show" : "auth.hide")}
                        onAction={() => patch({ hidden: !hidden }) }
                        error={fields.password}
                    />

                    <Field
                        placeholder={t("auth.confirmPassword")}
                        icon="shield"
                        value={confirm}
                        onChangeText={change("confirm")}
                        secureTextEntry={hidden}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        returnKeyType="go"
                        onSubmitEditing={submit}
                        error={fields.password_confirmation}
                    />

                    <PasswordRules value={password} policy={policy} />

                    <Button
                        label={t("auth.resetAction")}
                        loading={busy}
                        disabled={!credited || ( coded && code.length !== length ) || !strong(password, policy) ||!confirm}
                        onPress={submit}
                    />
                </>
            ) : (
                <View style={styles.broken}>
                    <Text rank="caption" tint="danger" align="center">{t("auth.resetNoToken")}</Text>
                    <Button label={t("auth.recoveryTitle")} kind="soft" tint="neutral" onPress={() => router.replace("/recovery") } />
                </View>
            )}
        </AuthPanel>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    broken: {
        gap: theme.space["3"],
    },

}));
