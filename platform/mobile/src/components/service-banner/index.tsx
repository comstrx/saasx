import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { Emblem, type EmblemName } from "@/elements/emblem";
import { Surface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type ServiceBannerProps = {
    title: string;
    body: string;
    emblem: EmblemName;
    action?: string | undefined;
    onAction?: (() => void) | undefined;
};

export function ServiceBanner ({ title, body, emblem, action, onAction }: ServiceBannerProps) {

    const theme = useTheme();

    return (
        <View style={styles.card}>
            <Surface value="base">
                <View style={styles.copy}>
                    <Text rank="title" accessibilityRole="header">{title}</Text>
                    <Text rank="caption" ink="soft">{body}</Text>
                    {action ? <View style={styles.action}><Button label={action} kind="soft" compact block={false} onPress={onAction} /></View> : null}
                </View>
            </Surface>
            <Emblem name={emblem} size={theme.composition.service.bannerArt} />
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({
    card: { ...theme.card, flexDirection: "row", alignItems: "center", gap: theme.space["4"], padding: theme.space["5"] },
    copy: { flex: 1, minWidth: 0, gap: theme.space["2"] },
    action: { alignSelf: "flex-start", paddingTop: theme.space["1"] },
}));
