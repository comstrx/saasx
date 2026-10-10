import { View, type ViewStyle } from "react-native";
import { Icon, type IconName } from "@/elements/icon";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { isolateLtr } from "@/std/bidi";
import { tally } from "@/std/number";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";
import { glazeTone } from "@/theme/wash";

type BadgeSize = "sm" | "md";

type BadgeProps = {
    label?: string | undefined;
    count?: number | undefined;
    tint?: ToneName | undefined;
    solid?: boolean | undefined;
    icon?: IconName | undefined;
    dot?: boolean | undefined;
    size?: BadgeSize | undefined;
    glass?: boolean | undefined;
    look?: "tone" | "field" | undefined;
    shape?: "tag" | "pill" | undefined;
};

export function Badge ({ label, count, tint = "neutral", solid = false, icon, dot = false, size = "md", glass = false, look = "tone", shape = "pill" }: BadgeProps) {

    const theme = useTheme();
    const hue = theme.tone[tint];
    const surface = useSurface();
    const loud = solid || count !== undefined;

    if ( dot ) return <View style={{ width: theme.space["2"], height: theme.space["2"], borderRadius: theme.radius.pill, backgroundColor: hue.base }} />;

    if ( count !== undefined ) return (
        <View
            style={{
                minWidth: theme.tag.sm,
                height: theme.tag.sm,
                paddingHorizontal: theme.space["1"],
                borderRadius: theme.radius.pill,
                ...glazeTone(hue),
                borderWidth: theme.stroke.base,
                borderColor: theme.plane[surface],
                alignItems: "center",
                justifyContent: "center",
                direction: "ltr",
            }}
        >
            <Text rank="micro" color={hue.on} ltr figures>{isolateLtr(tally(count))}</Text>
        </View>
    );

    const field = look === "field";
    const paint = field ? theme.ink.base : glass ? theme.material.lit : loud ? hue.on : hue.onSoft;

    const face: ViewStyle = field ? { backgroundColor: theme.plane.well }
        : glass ? { backgroundColor: theme.photo.chip }
            : loud ? glazeTone(hue)
                : { backgroundColor: hue.soft };

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                height: theme.tag[size],
                gap: theme.space["1"],
                paddingHorizontal: theme.space["2"],
                borderRadius: theme.radius[shape],
                ...face,
            }}
        >
            {icon ? <Icon name={icon} size={theme.icon.xs} color={field ? theme.ink.soft : paint} /> : null}

            <Text rank="micro" color={paint}>{label}</Text>
        </View>
    );

}
