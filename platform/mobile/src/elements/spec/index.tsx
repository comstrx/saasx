import type { ReactNode } from "react";
import { View } from "react-native";
import { Icon, type IconName } from "@/elements/icon";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type SpecProps = {
    label: string;
    value?: string | undefined;
    icon?: IconName | undefined;
    note?: string | undefined;
    tint?: ToneName | undefined;
    mark?: ToneName | undefined;
    strong?: boolean | undefined;
    trailing?: ReactNode | undefined;
};

export function Spec ({ label, value, icon, note, tint, mark, strong = false, trailing }: SpecProps) {

    const theme = useTheme();
    const paint = tint ? theme.tone[tint].base : undefined;

    return (
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.space["3"], paddingVertical: theme.space["2"] }}>
            {icon ? (
                <View style={{ paddingTop: theme.space["1"] }}>
                    <Icon name={icon} size={theme.icon.md} tint={mark ?? tint ?? "faint"} />
                </View>
            ) : null}

            <View style={{ flex: 1, gap: theme.space["1"] }}>
                <Text rank={strong ? "label" : "caption"} ink="soft">{label}</Text>
                {note ? <Text rank="note" ink="faint">{note}</Text> : null}
            </View>

            {value ? <Text rank={strong ? "title" : "label"} color={paint} align="end" numberOfLines={2} style={{ flexShrink: 1 }}>{value}</Text> : null}

            {trailing}
        </View>
    );

}
