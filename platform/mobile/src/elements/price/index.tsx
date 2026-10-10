import { View } from "react-native";
import { Text } from "@/elements/text";
import type { RankName } from "@/theme/text";
import { useTheme } from "@/theme/use-theme";

type PriceProps = {
    amount: string;
    was?: string | undefined;
    unit?: string | undefined;
    rank?: RankName | undefined;
    tint?: "base" | "brand" | "success" | "danger" | undefined;
};

export function Price ({ amount, was, unit, rank = "price", tint = "base" }: PriceProps) {

    const theme = useTheme();
    const paint = tint === "base" ? theme.ink.base : theme.tone[tint].base;

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", flexShrink: 1, columnGap: theme.space["1"] }}>
            <Text rank={rank} color={paint} ltr figures numberOfLines={1}>{amount}</Text>

            {was ? <Text rank="caption" ink="faint" ltr figures numberOfLines={1} style={{ textDecorationLine: "line-through" }}>{was}</Text> : null}

            {unit ? <Text rank="caption" ink="soft" numberOfLines={1}>{unit}</Text> : null}
        </View>
    );

}
