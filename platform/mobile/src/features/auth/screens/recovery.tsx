import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Phone } from "@/components/phone";
import { Rails } from "@/components/rails";
import { Button } from "@/elements/button";
import { Field } from "@/elements/field";
import { AuthPanel } from "@/features/auth/components/auth-panel";
import { leave } from "@/features/auth/flow";
import { useAuthCleanup, useAuthDraft } from "@/features/auth/hooks/use-auth-draft";
import { useDials } from "@/features/shell/hooks/use-dials";
import { validateIdentity } from "@/model/auth";
import { homeIso } from "@/model/country";
import { useRecovery } from "@/query/auth";
import { dialOf, e164, type Identified, type IdentityKind } from "@/std/identity";

const owned = [ "email", "phone" ] as const;
const initial = { kind: "phone" as IdentityKind, email: "", iso: homeIso, digits: "", sent: false };

export function RecoveryScreen () {

    const { t } = useTranslation();
    const dials = useDials();
    const { form, patch, edit, change, busy, fields, run } = useAuthDraft(initial, owned);
    const { kind, email, iso, digits, sent } = form;
    const { mutateAsync: recover, reset: clearMutation } = useRecovery();
    useAuthCleanup(clearMutation);

    const byMail = kind === "email";

    const identified: Identified = byMail
        ? { kind: "email", value: email.trim() }
        : { kind: "phone", value: e164(dialOf(dials, iso), digits) };

    const picker = {
        title: t("auth.pickCountry"),
        hint: t("auth.searchCountry"),
        empty: t("common.noMatches"),
        popular: t("common.popular"),
        all: t("common.allCountries"),
    };

    const pick = ( next: IdentityKind ) => { edit({ kind: next, sent: false, email: "", digits: "" }); };

    const submit = async () => {

        const outcome = await run("recovery", async ( attempt ) => {

            validateIdentity(identified);
            return recover({ identity: identified, attempt });

        });

        if ( !outcome.ok ) return;

        const answer = outcome.value;

        if ( !answer || answer.status === "link_sent" ) { patch({ sent: true }); return; }

        router.push({
            pathname: "/auth/reset",
            params: {
                challenge: answer.challenge_token,
                destination: answer.destination,
                length: String(answer.length ?? 5),
                retry: answer.retry_at ?? "",
            },
        });

    };

    const reached = byMail ? Boolean(email.trim()) : digits.length > 4;

    return (
        <AuthPanel
            onBack={leave}
            figure={sent ? "mail" : "key"}
            title={sent ? t("auth.recoverySentTitle") : t("auth.recoveryTitle")}
            body={sent ? t("auth.recoverySent") : t("auth.recoveryBody")}
            footLink={t("auth.backToLogin")}
            onFoot={() => router.replace("/login") }
        >
            <View style={styles.ways}>
                <Rails
                    rails={[
                        { key: "phone", label: t("auth.recoverPhone"), note: t("auth.recoverPhoneBody"), icon: "phone" },
                        { key: "email", label: t("auth.recoverEmail"), note: t("auth.recoverEmailBody"), icon: "mail" },
                    ]}
                    picked={byMail ? "email" : "phone"}
                    onPick={( key ) => pick(key === "email" ? "email" : "phone") }
                />
            </View>

            {byMail ? (
                <Field
                    placeholder={t("auth.email")}
                    icon="mail"
                    value={email}
                    onChangeText={( next ) => { edit({ email: next, sent: false }); }}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="go"
                    onSubmitEditing={submit}
                    error={fields.email}
                />
            ) : (
                <Phone
                    dials={dials}
                    iso={iso}
                    onIso={change("iso")}
                    value={digits}
                    onChangeText={( next ) => { edit({ digits: next, sent: false }); }}
                    placeholder={t("auth.phone")}
                    picker={picker}
                    error={fields.phone}
                />
            )}

            <Button
                label={sent ? t("auth.resend") : t("auth.sendCode")}
                icon={sent ? undefined : "send"}
                kind={sent ? "soft" : "solid"}
                tint={sent ? "neutral" : "brand"}
                loading={busy}
                disabled={!reached}
                onPress={submit}
            />
        </AuthPanel>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    ways: {
        gap: theme.space["3"],
    },

}));
