import { Component, type ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { i18n } from "@/brand/i18n";
import { Button } from "@/elements/button";
import { Emblem } from "@/elements/emblem";
import { Logo } from "@/elements/logo";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type GuardProps = {
    children: ReactNode;
};

type GuardState = {
    crashed: boolean;
    detail: string;
};

function Crashed ({ detail, onReset }: { detail: string; onReset: () => void }) {

    const theme = useTheme();

    return (
        <View style={styles.stage}>
            <Logo size={theme.mark.sm} word />

            <Emblem name="tool" size={theme.art.lg} />

            <View style={styles.copy}>
                <Text rank="heading" align="center" numberOfLines={2}>{i18n.t("error.crashTitle")}</Text>
                <Text rank="body" ink="soft" align="center">{i18n.t("error.crashBody")}</Text>

                {detail ? <Text rank="note" ink="faint" align="center" numberOfLines={3}>{detail}</Text> : null}
            </View>

            <Button label={i18n.t("error.crashAction")} icon="refresh" block={false} onPress={onReset} />
        </View>
    );

}

export class Guard extends Component<GuardProps, GuardState> {

    override state: GuardState = { crashed: false, detail: "" };

    static getDerivedStateFromError ( error: unknown ): GuardState {

        return { crashed: true, detail: error instanceof Error ? error.message : "" };

    }
    override render () {

        if ( !this.state.crashed ) return this.props.children;

        return <Crashed detail={this.state.detail} onReset={() => this.setState({ crashed: false, detail: "" }) } />;

    }

}

const styles = StyleSheet.create(( theme ) => ({

    stage: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.space["6"],
        paddingHorizontal: theme.layout.gutter,
        backgroundColor: theme.plane.canvas,
    },
    copy: {
        gap: theme.space["3"],
        maxWidth: theme.layout.dialog,
    },

}));
