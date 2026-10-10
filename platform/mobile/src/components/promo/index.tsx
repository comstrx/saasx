import { View } from "react-native";
import { Badge } from "@/elements/badge";
import { Emblem, type EmblemName } from "@/elements/emblem";
import type { IconName } from "@/elements/icon";
import { chevronNext, Icon } from "@/elements/icon";
import { Media } from "@/elements/media";
import { Press } from "@/elements/press";
import { Shine } from "@/elements/shine";
import { Text } from "@/elements/text";
import type { Picture } from "@/std/picture";
import { above, type ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

export type PromoProps = {
    action?: string | undefined;
    title: string;
    note?: string | undefined;
    image?: Picture | string | null | undefined;
    icon?: IconName | undefined;
    emblem?: EmblemName | undefined;
    badge?: { label: string; tint?: ToneName } | undefined;
    width?: number | undefined;
    onPress?: (() => void) | undefined;
};

export function Promo ({ title, note, action, image, icon = "gift", emblem = "gift", badge, width, onPress }: PromoProps) {

    const theme = useTheme();
    const shot = typeof image === "string" ? image : image?.uri;

    const mark = badge
        ? <Badge label={badge.label} tint={badge.tint ?? "danger"} solid />
        : null;

    if ( !shot ) return (
        <Press
            accessibilityRole={onPress ? "button" : "none"}
            accessibilityLabel={title}
            onPress={onPress}
            disabled={!onPress}
            sink="card"
            style={{ width }}
        >
            <View
                style={{
                    overflow: "hidden",
                    minHeight: theme.composition.offer.height,
                    justifyContent: "space-between",
                    gap: theme.space["4"],
                    padding: theme.space["5"],
                    borderRadius: theme.radius.card,
                    backgroundColor: theme.plane.base,
                }}
            >
                <Shine delay={theme.beat.slow} />

                <View pointerEvents="none" style={{ position: "absolute", insetInlineEnd: theme.space["2"], bottom: theme.space["2"] }}>
                    <Emblem name={emblem} size={theme.composition.offer.art} />
                </View>

                <View style={{ width: "64%", gap: theme.space["2"] }}>
                    {mark ? <View style={{ alignSelf: "flex-start" }}>{mark}</View> : null}

                    <Text rank="display" numberOfLines={2}>{title}</Text>
                    {note ? <Text rank="caption" ink="soft" numberOfLines={2}>{note}</Text> : null}
                </View>

                {action ? (
                    <View
                        style={{
                            alignSelf: "flex-start",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: theme.space["1"],
                            minHeight: theme.mark.sm,
                            paddingHorizontal: theme.space["3"],
                            borderRadius: theme.radius.pill,
                            backgroundColor: theme.plane[above("base", theme.name === "dark")],
                        }}
                    >
                        <Text rank="label" color={theme.tone.accent.onSoft} numberOfLines={1}>{action}</Text>
                        <Icon name={chevronNext} size={theme.icon.xs} color={theme.tone.accent.onSoft} />
                    </View>
                ) : null}
            </View>
        </Press>
    );

    return (
        <Press
            accessibilityRole={onPress ? "button" : "none"}
            accessibilityLabel={title}
            onPress={onPress}
            disabled={!onPress}
            sink="tile"
            style={{ width }}
        >
            <Media source={image} icon={icon} ratio={theme.ratio.wide} curve="card" scrim>
                {mark ? (
                    <View style={{ position: "absolute", top: theme.space["3"], insetInlineStart: theme.space["3"] }}>
                        {mark}
                    </View>
                ) : null}

                <View
                    style={{
                        position: "absolute",
                        bottom: 0,
                        insetInlineStart: 0,
                        insetInlineEnd: 0,
                        gap: theme.space["1"],
                        padding: theme.space["4"],
                    }}
                >
                    <Text rank="title" color={theme.material.lit} numberOfLines={2}>{title}</Text>

                    {note ? <Text rank="caption" color={theme.material.lit} numberOfLines={2} style={{ opacity: theme.fade.mute }}>{note}</Text> : null}
                </View>
            </Media>
        </Press>
    );

}
