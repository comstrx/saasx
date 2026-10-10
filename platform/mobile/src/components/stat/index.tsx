import { View } from "react-native";
import { Divider } from "@/elements/divider";
import type { IconName } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type Cell = {
    key: string;
    label: string;
    value: string;
    icon?: IconName | undefined;
    tint?: ToneName | undefined;
    onPress?: (() => void) | undefined;
};

type StatProps = {
    cells: readonly Cell[];
    plated?: boolean | undefined;
};

export function Stat ({ cells, plated = false }: StatProps) {

    const theme = useTheme();

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "stretch",
                ...theme.depth.lift,
                borderRadius: theme.radius.card,
                backgroundColor: theme.plane.base,
                paddingVertical: theme.space["4"],
            }}
        >
            {cells.map(( cell, index ) => (
                <View key={cell.key} style={{ flex: 1, flexDirection: "row" }}>
                    {index > 0 ? <Divider vertical inset="2" /> : null}

                    <Press
                        onPress={cell.onPress}
                        disabled={!cell.onPress}
                        sink="tile"
                        style={{ flex: 1, alignItems: "center", gap: theme.space["2"], paddingHorizontal: theme.space["2"] }}
                    >
                        {plated && cell.icon ? <Plate icon={cell.icon} tone={cell.tint ?? "brand"} look="soft" size={theme.control.md.height} /> : null}

                        <Text rank="action" figures>{cell.value}</Text>
                        <Text rank="note" ink="faint" align="center">{cell.label}</Text>
                    </Press>
                </View>
            ))}
        </View>
    );

}
