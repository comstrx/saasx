import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { Heading } from "@/elements/heading";
import { Stagger } from "@/elements/motion";
import { Screen } from "@/elements/screen";
import { AuthStage } from "@/features/auth/components/auth-stage";
import { usePrefs } from "@/store/prefs";
import { useTheme } from "@/theme/use-theme";

export function BackScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const welcomed = usePrefs(( state ) => state.welcomed );

    return (
        <Screen centered>
            <View style={styles.block}>
                <AuthStage figure="enter" />

                <Stagger delay={theme.beat.stagger}>
                    <View style={styles.copy}>
<Heading look="brief" title={t("back.title")} body={t("back.body")} />
                    </View>

                    <View style={styles.action}>
                        <Button label={t("back.action")} onPress={() => router.replace(welcomed ? "/" : "/story") } />
                    </View>
                </Stagger>
            </View>
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    block: {
        gap: theme.space["8"],
    },
    copy: {
        gap: theme.space["3"],
    },
    action: {
        paddingHorizontal: theme.space["2"],
    },

}));
