import { useTranslation } from "react-i18next";
import type { ArtName } from "@/brand";
import { Phone } from "@/components/phone";
import { Button } from "@/elements/button";
import { Field } from "@/elements/field";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { PasswordRules } from "@/features/auth/components/password-rules";
import { SocialStack } from "@/features/auth/components/social-stack";
import { useRegisterFlow } from "@/features/auth/hooks/use-register";
import { strong } from "@/std/password";

const figures: readonly ArtName[] = [ "member", "mail", "phone", "lock" ];

export function RegisterScreen () {

    const { t } = useTranslation();
    const { form, change, patch, busy, fields, dials, policy, back, go, claim, about, submit } = useRegisterFlow();
    const { step, ahead, iso, digits, hidden } = form;

    const copy = [
        { title: t("auth.registerTitle"), body: t("auth.registerBody") },
        { title: t("auth.stepEmailTitle"), body: t("auth.stepEmailBody") },
        { title: t("auth.stepAboutTitle"), body: t("auth.stepAboutBody") },
        { title: t("auth.stepSecureTitle"), body: t("auth.stepSecureBody") },
    ][step] ?? { title: "", body: "" };

    return (
        <AuthShell mode="register" figures={figures} step={step} ahead={ahead} onBack={back} title={copy.title} body={copy.body}>
            {step === 0 ? (
                <>
                    <Button label={t("auth.withEmail")} icon="mail" onPress={() => go(1) } />
                    <SocialStack />
                </>
            ) : null}

            {step === 1 ? (
                <>
                    <Field
                        placeholder={t("auth.email")}
                        icon="mail"
                        value={form.email}
                        onChangeText={change("email")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        onSubmitEditing={claim}
                        autoFocus
                        error={fields.email}
                    />
                    <Button label={t("common.continue")} loading={busy} disabled={!form.email.trim()} onPress={claim} />
                </>
            ) : null}

            {step === 2 ? (
                <>
                    <Field
                        placeholder={t("auth.name")}
                        icon="user"
                        value={form.name}
                        onChangeText={change("name")}
                        autoComplete="name"
                        textContentType="name"
                        autoFocus
                        error={fields.name}
                    />
                    <Phone
                        dials={dials}
                        iso={iso}
                        onIso={change("iso")}
                        value={digits}
                        onChangeText={change("digits")}
                        placeholder={t("auth.phone")}
                        picker={{
                            title: t("auth.pickCountry"),
                            hint: t("auth.searchCountry"),
                            empty: t("common.noMatches"),
                            popular: t("common.popular"),
                            all: t("common.allCountries"),
                        }}
                        error={fields.phone}
                    />
                    <Field
                        placeholder={t("auth.referral")}
                        icon="gift"
                        value={form.promotion_code}
                        onChangeText={change("promotion_code")}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        hint={t("auth.referralHint")}
                        error={fields.promotion_code}
                    />
                    <Button label={t("common.continue")} loading={busy} disabled={!form.name.trim() || digits.length < 5} onPress={about} />
                </>
            ) : null}

            {step === 3 ? (
                <>
                    <Field
                        placeholder={t("auth.password")}
                        icon="lock"
                        value={form.password}
                        onChangeText={change("password")}
                        secureTextEntry={hidden}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        action={hidden ? "eye" : "eyeOff"}
                        actionLabel={t(hidden ? "auth.show" : "auth.hide")}
                        onAction={() => patch({ hidden: !hidden }) }
                        autoFocus
                        error={fields.password}
                    />
                    <Field
                        placeholder={t("auth.confirmPassword")}
                        icon="shield"
                        value={form.password_confirmation}
                        onChangeText={change("password_confirmation")}
                        secureTextEntry={hidden}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        error={fields.password_confirmation}
                    />

                    <PasswordRules value={form.password} policy={policy} />

                    <Button label={t("auth.register")} loading={busy} disabled={!strong(form.password, policy) ||!form.password_confirmation} onPress={submit} />
                </>
            ) : null}
        </AuthShell>
    );

}
