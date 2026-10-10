import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Badge } from "@/elements/badge";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type CaseCardProps = {
    title: string; preview: string; reference: string; at: string;
    status: string; tone: ToneName; onPress: () => void;
};

export function CaseCard ({ title, preview, reference, at, status, tone, onPress }: CaseCardProps) {

    const theme = useTheme();

    return (
        <Press style={styles.card} onPress={onPress} sink="tile" accessibilityRole="button" accessibilityLabel={title}>
            <View style={styles.line}>
                <Text rank="caption" ink="soft" ltr style={styles.copy}>{reference}</Text>
                <Badge label={status} tint={tone} />
            </View>
            <Text rank="action" numberOfLines={2}>{title}</Text>
            {preview ? <Text rank="caption" ink="soft" numberOfLines={2}>{preview}</Text> : null}
            <View style={styles.line}>
                <Icon name="clock" size={theme.icon.xs} tint="faint" />
                <Text rank="note" ink="faint">{at}</Text>
            </View>
        </Press>
    );

}

const styles = StyleSheet.create((theme) => ({
    card: { ...theme.card, padding: theme.space["4"], gap: theme.space["3"] },
    line: { flexDirection: "row", alignItems: "center", gap: theme.space["2"] },
    copy: { flex: 1, minWidth: 0 },
}));
