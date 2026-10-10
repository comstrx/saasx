import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { Group } from "@/components/group";
import { Alert } from "@/elements/alert";
import { AppBar } from "@/elements/app-bar";
import { Callout } from "@/elements/callout";
import { Field } from "@/elements/field";
import type { IconName } from "@/elements/icon";
import { Stagger } from "@/elements/motion";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Preferences } from "@/features/account/components/preferences";
import { useConfirmCopy } from "@/features/shell/copy";
import { useConfirm } from "@/features/shell/hooks/use-confirm";
import { useReplayIntros } from "@/features/shell/hooks/use-intro";
import { retreat } from "@/features/shell/retreat";
import { allows, type Closure } from "@/model/account";
import { reasonCopy } from "@/model/failure";
import { useAccount, useCloseAccount } from "@/query/account";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";

const dangers: Record<Closure, IconName> = {
    deactivate: "lock",
    erase: "trash",
};

const owned: readonly string[] = [ "password" ];

export function SettingsScreen () {

    const { t } = useTranslation();
    const confirmCopy = useConfirmCopy();
    const account = useAccount();
    const token = useSession(( state ) => state.token );
    const close = useSession(( state ) => state.close );
    const me = account.data;
    const closing = useCloseAccount();
    const replayIntros = useReplayIntros();
    const [ danger, setDanger ] = useState<Closure | null>(null);
    const [ password, setPassword ] = useState("");
    const [ blocked, setBlocked ] = useState<string | null>(null);

    const gate = useConfirm<unknown>(() => {

        const kind = danger;

        setDanger(null);
        setPassword("");

        if ( kind ) notify(t(`settings.${ kind }Done`), "success");

        void close();

    }, owned, ( failure ) => {

        const held = failure.reason === "invalid_state" && Object.keys(failure.fields ?? {}).length > 0;

        setBlocked(held ? reasonCopy(failure) ?? t("settings.eraseBlocked") : null);

        return held;

    });

    const confirmDanger = () => {

        if ( !danger || gate.busy ) return;

        const kind = danger;
        const proof = me?.hasPassword ? { password } : {};

        setBlocked(null);

        void gate.run(`account-${ kind }`, ( attempt, code ) =>
            closing.mutateAsync({ closure: kind, proof: code ? { ...proof, confirm_code: code } : proof, attempt }) );

    };

    const dismiss = () => {

        setDanger(null);
        setPassword("");
        setBlocked(null);

    };

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("settings.title")} onBack={() => retreat() } />

            <Scroll contentContainerStyle={styles.scroll}>
                <Stagger>
                    <Preferences plated={false} title={t("settings.groupPreferences")}>
                        {me && allows(me, "allow_notifications") ? (
                            <Row key="notifications" icon="bell" title={t("settings.notifications")} note={t("settings.notificationsBody")} onPress={() => router.push("/notify")} />
                        ) : null}
                        <Row key="guides" icon="help" title={t("settings.guides")} note={t("settings.guidesBody")} onPress={() => { replayIntros(); notify(t("settings.guidesDone"), "success"); }} />
                    </Preferences>
                    {token ? (
                        <Group title={t("settings.groupAccount")}>
                            <Row key="deactivate" icon={dangers.deactivate} title={t("settings.deactivate")} note={t("settings.deactivateBody")} onPress={() => setDanger("deactivate")} />
                            <Row key="erase" icon={dangers.erase} title={t("settings.erase")} note={t("settings.eraseBody")} tint="danger" onPress={() => setDanger("erase")} />
                        </Group>
                    ) : null}
                </Stagger>
            </Scroll>

            <Alert
                open={danger !== null && !gate.asking}
                title={danger ? t(`settings.${ danger }Confirm`) : ""}
                body={danger ? t(`settings.${ danger }Note`) : undefined}
                emblem={danger === "erase" ? "trash" : "lock"}
                confirm={t("common.confirm")} onConfirm={confirmDanger} tone="danger" busy={gate.busy}
                cancel={t("common.cancel")}
                onClose={dismiss}
            >
                <View style={styles.proof}>
                    {blocked ? <Callout tint="danger" body={blocked} /> : null}

                    {me?.hasPassword ? (
                        <Field
                            placeholder={t("personal.currentPassword")}
                            icon="lock"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoComplete="current-password"
                            returnKeyType="go"
                            onSubmitEditing={confirmDanger}
                            error={gate.fields.password}
                        />
                    ) : null}
                </View>
            </Alert>

            <ConfirmSheet
                copy={confirmCopy}
                open={gate.asking}
                busy={gate.busy}
                wrong={gate.wrong}
                challenge={gate.challenge}
                note={danger ? t(`settings.${ danger }Note`) : undefined}
                onSubmit={( code ) => { void gate.answer(code); }}
                onResend={() => { void gate.resend(); }}
                onClose={() => { gate.dismiss(); dismiss(); }}
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    proof: {
        gap: theme.space["3"],
    },
    scroll: {
        gap: theme.space["2"],
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
    },

}));
