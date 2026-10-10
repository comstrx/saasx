import type { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ArtName } from "@/brand";
import { Heading } from "@/elements/heading";
import { Stagger } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Screen } from "@/elements/screen";
import { Text } from "@/elements/text";
import { AuthStage } from "@/features/auth/components/auth-stage";
import { AuthTop } from "@/features/auth/components/auth-top";

type AuthPanelProps = {
    figure: ArtName;
    title: string;
    body: string;
    destination?: string | undefined;
    notice?: string | undefined;
    children: ReactNode;
    footLead?: string | undefined;
    footLink?: string | undefined;
    onFoot?: (() => void) | undefined;
    onBack?: (() => void) | undefined;
};

export function AuthPanel ({ figure, title, body, destination, notice, children, footLead, footLink, onFoot, onBack }: AuthPanelProps) {

    return (
        <Screen scroll head={<AuthTop onBack={onBack} />}>
            <Stagger style={styles.slice}>
                <AuthStage figure={figure} />

                <Heading look="brief" title={title} body={body} detail={destination} />

                <View style={styles.form}>
                    {notice ? <Text rank="caption" ink="soft">{notice}</Text> : null}
                    {children}
                </View>

                {footLink ? (
                    <Press style={styles.foot} onPress={onFoot} disabled={!onFoot} sink="tile" accessibilityRole="button">
                        {footLead ? <Text rank="action">{footLead}</Text> : null}
                        <Text rank="action" ink={onFoot ? undefined : "faint"} tint={onFoot ? "brand" : undefined} underline={Boolean(onFoot)}>{footLink}</Text>
                    </Press>
                ) : null}
            </Stagger>
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    slice: {
        marginBottom: theme.space["4"],
    },
    form: {
        gap: theme.space["4"],
        paddingTop: theme.space["2"],
    },
    foot: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "stretch",
        gap: theme.space["2"],
        paddingVertical: theme.space["2"],
    },

}));
