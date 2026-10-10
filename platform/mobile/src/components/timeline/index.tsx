import { View } from "react-native";
import { Icon, type IconName } from "@/elements/icon";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

export type Beat = {
    key: string;
    title: string;
    note?: string | undefined;
    at?: string | undefined;
    icon?: IconName | undefined;
    tint?: ToneName | undefined;
    done?: boolean | undefined;
};

type TimelineProps = {
    beats: readonly Beat[];
};

export function Timeline ({ beats }: TimelineProps) {

    const theme = useTheme();
    const disc = theme.space["7"];

    return (
        <View style={{ gap: theme.space["1"] }}>
            {beats.map(( beat, index ) => {

                const hue = theme.tone[beat.tint ?? ( beat.done ? "success" : "neutral" )];
                const last = index === beats.length - 1;

                return (
                    <View key={beat.key} style={{ flexDirection: "row", gap: theme.space["3"] }}>
                        <View style={{ alignItems: "center", width: disc }}>
                            <View
                                style={{
                                    width: disc,
                                    height: disc,
                                    borderRadius: disc / 2,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: beat.done ? hue.base : hue.soft,
                                }}
                            >
                                <Icon
                                    name={beat.icon ?? ( beat.done ? "check" : "circle" )}
                                    size={theme.icon.sm}
                                    color={beat.done ? hue.on : hue.base}
                                />
                            </View>

                            {last ? null : <View style={{ flex: 1, width: theme.stroke.base, backgroundColor: theme.line.hair }} />}
                        </View>

                        <View style={{ flex: 1, gap: theme.space["1"], paddingBottom: last ? 0 : theme.space["5"] }}>
                            <Text rank="label" numberOfLines={3}>{beat.title}</Text>
                            {beat.note ? <Text rank="caption" ink="soft">{beat.note}</Text> : null}
                            {beat.at ? <Text rank="note" ink="faint" figures>{beat.at}</Text> : null}
                        </View>
                    </View>
                );

            })}
        </View>
    );

}
