import { View } from "react-native";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Text } from "@/elements/text";
import { Shell } from "@/elements/well";
import { useTheme } from "@/theme/use-theme";

export type SeekProps = {
    hint: string;
    onPress?: (() => void) | undefined;
    onFilter?: (() => void) | undefined;
    filterLabel?: string | undefined;
};

export function Seek ({ hint, onPress, onFilter, filterLabel }: SeekProps) {

    const theme = useTheme();

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["2"] }}>
            <Press onPress={onPress} sink="tile" accessibilityRole="search" accessibilityLabel={hint} style={{ flex: 1 }}>
                <Shell tall style={{ borderWidth: 0 }}>
                    <Icon name="search" size={theme.icon.md} tint="faint" />
                    <Text rank="body" ink="faint" style={{ flex: 1 }} numberOfLines={1}>{hint}</Text>
                </Shell>
            </Press>

            {onFilter ? <Round icon="filter" onPress={onFilter} label={filterLabel} /> : null}
        </View>
    );

}
