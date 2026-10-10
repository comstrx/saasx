import { View } from "react-native";
import { Icon, type IconName } from "@/elements/icon";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type PerkProps = {
    label: string;
    icon?: IconName | undefined;
    note?: string | undefined;
    tint?: ToneName | undefined;
    off?: boolean | undefined;
};

export function Perk ({ label, icon = "check", note, tint = "success", off = false }: PerkProps) {

    const theme = useTheme();

    return (
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.space["3"], paddingVertical: theme.space["2"], opacity: off ? theme.fade.mute : 1 }}>
            <View style={{ paddingTop: theme.space["1"] }}>
                <Icon name={off ? "close" : icon} size={theme.icon.md} tint={off ? "faint" : tint} />
            </View>

            <View style={{ flex: 1, gap: theme.space["1"] }}>
                <Text
                    rank="caption"
                    ink={off ? "faint" : "base"}
                    numberOfLines={2}
                    style={off ? { textDecorationLine: "line-through" } : undefined}
                >
                    {label}
                </Text>

                {note ? <Text rank="note" ink="faint">{note}</Text> : null}
            </View>
        </View>
    );

}
