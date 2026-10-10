import { View } from "react-native";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type StatusProps = {
    label: string;
    tint?: ToneName | undefined;
    strong?: boolean | undefined;
    size?: "sm" | "md" | undefined;
};

export function Status ({ label, tint = "neutral", strong = false, size = "md" }: StatusProps) {

    const theme = useTheme();
    const hue = theme.tone[tint];

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                gap: theme.space["2"],
                height: theme.tag[size],
                paddingHorizontal: theme.space["2"],
                borderRadius: theme.radius.pill,
                backgroundColor: strong ? hue.base : hue.soft,
            }}
        >
            <View style={{ width: theme.space["2"], height: theme.space["2"], borderRadius: theme.radius.pill, backgroundColor: strong ? hue.on : hue.base }} />

            <Text rank="micro" color={strong ? hue.on : hue.onSoft}>{label}</Text>
        </View>
    );

}
