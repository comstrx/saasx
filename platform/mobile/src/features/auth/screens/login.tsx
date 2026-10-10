import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import type { ArtName } from "@/brand";
import { Phone } from "@/components/phone";
import { Button } from "@/elements/button";
import { Field } from "@/elements/field";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SocialStack } from "@/features/auth/components/social-stack";
import { useLoginFlow } from "@/features/auth/hooks/use-login";

export function LoginScreen () {

    const { t } = useTranslation();
    const { form, change, patch, busy, fields, dials, byMail, back, pick, forward, submit, reached } = useLoginFlow();
    const { step, ahead, email, iso, digits, password, hidden } = form;
    const figures: readonly ArtName[] = [ "enter", byMail ? "mail" : "phone", "lock" ];

    const picker = {
        title: t("auth.pickCountry"),
        hint: t("auth.searchCountry"),
        empty: t("common.noMatches"),
        popular: t("common.popular"),
        all: t("common.allCountries"),
    };

    const copy = [
        { title: t("auth.loginTitle"), body: t("auth.loginBody") },
        byMail
            ? { title: t("auth.stepEmailTitle"), body: t("auth.stepEmailBody") }
            : { title: t("auth.stepPhoneTitle"), body: t("auth.stepPhoneBody") },
        { title: t("auth.stepPasswordTitle"), body: t("auth.stepPasswordBody") },
    ][step] ?? { title: "", body: "" };

    return (
        <AuthShell mode="login" figures={figures} step={step} ahead={ahead} onBack={back} title={copy.title} body={copy.body}>
            {step === 0 ? (
                <>
                    <Button label={t("auth.withEmail")} icon="mail" onPress={() => pick("email") } />
                    <Button label={t("auth.withPhone")} icon="phone" kind="soft" onPress={() => pick("phone") } />
                    <SocialStack />
                </>
            ) : null}

            {step === 1 ? (
                <>
                    {byMail ? (
                        <Field
                            placeholder={t("auth.email")}
                            icon="mail"
                            value={email}
                            onChangeText={change("email")}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            returnKeyType="next"
                            onSubmitEditing={forward}
                            autoFocus
                            error={fields.email}
                        />
                    ) : (
                        <Phone
                            dials={dials}
                            iso={iso}
                            onIso={change("iso")}
                            value={digits}
                            onChangeText={change("digits")}
                            placeholder={t("auth.phone")}
                            picker={picker}
                            returnKeyType="next"
                            onSubmitEditing={forward}
                            autoFocus
                            error={fields.phone}
                        />
                    )}

                    <Button label={t("common.continue")} loading={busy} disabled={!reached} onPress={forward} />

                    <Press style={styles.aside} onPress={() => pick(byMail ? "phone" : "email") } accessibilityRole="button">
                        <Text rank="label" tint="brand">{byMail ? t("auth.usePhone") : t("auth.useEmail")}</Text>
                    </Press>
                </>
            ) : null}

            {step === 2 ? (
                <>
                    <Field
                        placeholder={t("auth.password")}
                        icon="lock"
                        value={password}
                        onChangeText={change("password")}
                        secureTextEntry={hidden}
                        autoCapitalize="none"
                        autoComplete="current-password"
                        textContentType="password"
                        returnKeyType="go"
                        onSubmitEditing={submit}
                        action={hidden ? "eye" : "eyeOff"}
                        actionLabel={t(hidden ? "auth.show" : "auth.hide")}
                        onAction={() => patch({ hidden: !hidden }) }
                        autoFocus
                        error={fields.password}
                    />

                    <Button label={t("auth.login")} loading={busy} disabled={!password} onPress={submit} />

                    <Press style={styles.aside} onPress={() => router.push("/recovery") } accessibilityRole="button">
                        <Text rank="label" tint="brand">{t("auth.forgot")}</Text>
                    </Press>
                </>
            ) : null}
        </AuthShell>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    aside: {
        alignSelf: "center",
        paddingVertical: theme.space["2"],
    },

}));
