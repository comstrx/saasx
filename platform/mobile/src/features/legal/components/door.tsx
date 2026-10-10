import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Emblem, type EmblemName } from "@/elements/emblem";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type DoorProps = {
    emblem: EmblemName;
    title: string;
    note: string;
    wide?: boolean | undefined;
    onPress: () => void;
};

export function Door ({ emblem, title, note, wide = false, onPress }: DoorProps) {

    const theme = useTheme();

    return (
        <Press style={wide ? undefined : styles.slot} onPress={onPress} accessibilityRole="button" accessibilityLabel={title} accessibilityHint={note}>
            <View style={[ styles.door, wide ? styles.wide : null ]}>
                <Emblem name={emblem} size={theme.composition.service.art} />
                <View style={[ styles.copy, wide ? styles.fill : null ]}>
                    <Text rank="title" numberOfLines={2}>{title}</Text>
                    <Text rank="caption" ink="soft">{note}</Text>
                </View>
            </View>
        </Press>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    slot: {
        flex: 1,
    },
    door: {
        ...theme.card,
        flex: 1,
        gap: theme.space["3"],
        padding: theme.space["4"],
    },
    wide: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
    },
    copy: {
        gap: theme.space["1"],
    },
    fill: {
        flex: 1,
        minWidth: 0,
    },

}));
