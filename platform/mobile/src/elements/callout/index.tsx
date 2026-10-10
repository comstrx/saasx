import { View } from "react-native";
import { Icon, type IconName } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type CalloutProps = {
    body: string;
    title?: string | undefined;
    tint?: ToneName | undefined;
    icon?: IconName | undefined;
};

const marks: Record<ToneName, IconName> = {
    brand: "info",
    accent: "bolt",
    success: "checkCircle",
    danger: "alert",
    warning: "warning",
    info: "info",
    neutral: "info",
};

export function Callout ({ body, title, tint = "info", icon }: CalloutProps) {

    const theme = useTheme();
    const hue = theme.tone[tint];
    const glyph = icon ?? marks[tint];

    return (
        <View
            style={{
                overflow: "hidden",
                flexDirection: "row",
                alignItems: "center",
                gap: theme.space["3"],
                padding: theme.space["4"],
                borderRadius: theme.radius.card,
                backgroundColor: theme.plane.base,
                ...theme.depth.lift,
            }}
        >
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    insetInlineEnd: -theme.space["3"],
                    bottom: -theme.space["4"],
                    opacity: theme.fade.dip,
                    transform: [ { rotate: "-12deg" } ],
                }}
            >
                <Icon name={glyph} size={theme.art.sm + theme.space["4"]} color={hue.base} />
            </View>

            <Plate icon={glyph} tone={tint} look="soft" size={theme.control.sm.height} />

            <View style={{ flex: 1, gap: theme.space["1"] / 2 }}>
                {title ? <Text rank="label" ink="strong">{title}</Text> : null}

                <Text rank="caption" ink="soft" numberOfLines={4}>{body}</Text>
            </View>
        </View>
    );

}
