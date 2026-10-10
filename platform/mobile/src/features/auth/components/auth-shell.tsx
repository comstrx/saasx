import { router } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ArtName } from "@/brand";
import { Heading } from "@/elements/heading";
import { Appear } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Screen } from "@/elements/screen";
import { Tabs } from "@/elements/tabs";
import { Text } from "@/elements/text";
import { AuthStage } from "@/features/auth/components/auth-stage";
import { AuthTop } from "@/features/auth/components/auth-top";
import { StepRail } from "@/features/auth/components/step-rail";
import { TermsNote } from "@/features/auth/components/terms-note";

type AuthMode = "login" | "register";

type AuthShellProps = {
    mode: AuthMode;
    figures: readonly ArtName[];
    step: number;
    ahead: boolean;
    onBack: () => void;
    title: string;
    body: string;
    children: ReactNode;
};

const swaps = {
    login: { lead: "auth.noAccount", link: "auth.register", to: "/register" },
    register: { lead: "auth.haveAccount", link: "auth.login", to: "/login" },
} as const;

export function AuthShell ({ mode, figures, step, ahead, onBack, title, body, children }: AuthShellProps) {

    const { t } = useTranslation();
    const swap = swaps[mode];
    const last = step === figures.length - 1;

    const segments = [
        { key: "login", label: t("auth.login") },
        { key: "register", label: t("auth.newAccount") },
    ] as const;

    const switchMode = ( value: string ) => {

        if ( value !== mode ) router.replace(value === "login" ? "/login" : "/register");

    };

    return (
        <Screen scroll head={<AuthTop onBack={onBack} />}>
            <View style={styles.rail}>
                {step === 0
                    ? <Tabs look="segment" options={segments} active={mode} onPick={switchMode} />
                    : <StepRail total={figures.length - 1} step={step} />}
            </View>

            <AuthStage figure={figures[Math.min(step, figures.length - 1)] ?? "enter"} />

            <View style={styles.stage}>
                <Appear key={step} from={ahead ? "end" : "start"}>
                    <View style={styles.slice}>
                        <Heading look="brief" title={title} body={body} />

                        <View style={styles.form}>{children}</View>

                        {step === 0 ? (
                            <Press style={styles.swap} onPress={() => router.replace(swap.to) } sink="tile" accessibilityRole="button">
                                <Text rank="action">{t(swap.lead)}</Text>
                                <Text rank="action" tint="brand" underline>{t(swap.link)}</Text>
                            </Press>
                        ) : null}

                    </View>
                </Appear>
            </View>

            {last ? (
                <View style={styles.legal}>
                    <TermsNote />
                </View>
            ) : null}
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    rail: {
        marginTop: theme.space["4"],
        width: "85%",
        alignSelf: "center",
    },
    stage: {
        overflow: "hidden",
    },
    slice: {
        gap: theme.space["4"],
        marginBottom: theme.space["4"],
    },
    form: {
        gap: theme.space["4"],
        paddingTop: theme.space["3"],
    },
    legal: {
        alignSelf: "center",
        width: "90%",
        marginTop: "auto",
        paddingTop: theme.space["8"],
        paddingBottom: theme.space["7"],
    },
    swap: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "stretch",
        gap: theme.space["2"],
        paddingTop: theme.space["2"],
    },
}));
