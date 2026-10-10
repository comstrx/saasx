import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { Heading } from "@/elements/heading";
import { Logo } from "@/elements/logo";
import { Appear, Stagger } from "@/elements/motion";
import { Screen } from "@/elements/screen";
import { AuthStage } from "@/features/auth/components/auth-stage";
import { usePrefs } from "@/store/prefs";
import { useTheme } from "@/theme/use-theme";

export function GateScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const welcomed = usePrefs(( state ) => state.welcomed );

    return (
        <Screen centered>
            <View style={styles.block}>
                <Appear from="still" grow style={styles.brand}>
                    <Logo size={theme.mark.md} word />
                </Appear>

                <Stagger delay={theme.beat.stagger}>
                    <AuthStage figure="auth-welcome" />

                    <View style={styles.copy}>
                        <Heading look="brief" title={t("auth.gateTitle")} body={t("auth.gateBody")} />
                    </View>

                    <View style={styles.actions}>
                        <Button label={t("auth.login")} onPress={() => router.push("/login") } />
                        <Button label={t("auth.register")} kind="soft" onPress={() => router.push("/register") } />
                    </View>

                    <View style={styles.guest}>
                        <Button label={t("common.guest")} kind="ghost" tint="neutral" roomy onPress={() => router.replace(welcomed ? "/" : "/story") } />
                    </View>
                </Stagger>
            </View>
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    block: {
        gap: theme.space["6"],
    },
    brand: {
        alignItems: "center",
    },
    copy: {
        paddingHorizontal: theme.space["2"],
    },
    actions: {
        gap: theme.space["3"],
    },
    guest: {
        flexDirection: "row",
        justifyContent: "center",
        paddingTop: theme.space["2"],
    },

}));
