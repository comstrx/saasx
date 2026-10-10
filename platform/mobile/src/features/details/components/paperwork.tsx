import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Callout } from "@/elements/callout";
import { Divider } from "@/elements/divider";
import { Icon } from "@/elements/icon";
import { Text } from "@/elements/text";
import { markOf } from "@/features/catalog/marks";
import type { Trait } from "@/model/detail";
import { useTheme } from "@/theme/use-theme";

export function Documents ({ items }: { items: readonly Trait[] }) {

    const theme = useTheme();

    return (
        <View style={styles.card}>
            {items.map(( item, index ) => (
                <View key={item.key}>
                    {index > 0 ? <Divider /> : null}

                    <Box row align="start" gap="4" style={styles.row}>
                        <View style={styles.chip}>
                            <Icon name={markOf(item.icon, item.key, "docCheck")} size={theme.icon.md} tint="brand" />
                        </View>

                        <Box gap="1" style={styles.copy}>
                            <Text rank="label">{item.label}</Text>
                            {item.value ? <Text rank="caption" ink="soft" numberOfLines={4}>{item.value}</Text> : null}
                        </Box>
                    </Box>
                </View>
            ))}
        </View>
    );

}

export function Included ({ items }: { items: readonly Trait[] }) {

    const theme = useTheme();

    return (
        <View style={styles.card}>
            {items.map(( item, index ) => (
                <View key={item.key}>
                    {index > 0 ? <Divider /> : null}

                    <Box row align="start" gap="4" style={styles.row}>
                        <View style={styles.tick}>
                            <Icon name={markOf(item.icon, item.key, "check")} size={theme.icon.sm} tint="success" />
                        </View>

                        <Box gap="1" style={styles.copy}>
                            <Text rank="label">{item.label}</Text>
                            {item.value ? <Text rank="caption" ink="soft" numberOfLines={4}>{item.value}</Text> : null}
                        </Box>
                    </Box>
                </View>
            ))}
        </View>
    );

}

export function Notices ({ items }: { items: readonly Trait[] }) {

    return (
        <Box gap="3">
            {items.map(( item ) => (
                <Callout
                    key={item.key}
                    tint="warning"
                    icon={markOf(item.icon, item.key, "warning")}
                    title={item.label}
                    body={item.value}
                />
            ))}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        ...theme.card,
        overflow: "hidden",
        paddingHorizontal: theme.space["4"],
    },
    row: {
        paddingVertical: theme.space["4"],
    },
    tick: {
        width: theme.control.sm.height,
        height: theme.control.sm.height,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.success.soft,
    },
    chip: {
        width: theme.control.sm.height,
        height: theme.control.sm.height,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.soft,
    },
    copy: {
        flex: 1,
    },

}));
