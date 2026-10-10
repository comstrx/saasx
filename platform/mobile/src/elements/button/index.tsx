import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Spinner } from "@/elements/spinner";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import type { AppTheme } from "@/theme";
import { above, type PlaneName, type ToneName } from "@/theme/roles";
import type { RankName } from "@/theme/text";
import { useTheme } from "@/theme/use-theme";
import { glaze } from "@/theme/wash";

type ButtonKind = "solid" | "soft" | "ghost" | "glass" | "outline";

type ButtonProps = {
    label: string;
    labelRank?: RankName | undefined;
    size?: "slim" | "md" | "lg" | undefined;
    onPress?: (() => void) | undefined;
    kind?: ButtonKind | undefined;
    tint?: ToneName | undefined;
    icon?: IconName | undefined;
    figure?: ReactNode | undefined;
    trailing?: IconName | undefined;
    block?: boolean | undefined;
    compact?: boolean | undefined;
    roomy?: boolean | undefined;
    done?: boolean | undefined;
    on?: PlaneName | undefined;
    loading?: boolean | undefined;
    disabled?: boolean | undefined;
};

type Skin = {
    face: ViewStyle;
    ink: string;
};

const voiceOf = ( theme: AppTheme, tint: ToneName ): string => tint === "brand" || tint === "neutral" ? theme.ink.strong : theme.tone[tint].onSoft;

const dress = ( theme: AppTheme, kind: ButtonKind, tint: ToneName, seat: string ): Skin => {

    const voice = voiceOf(theme, tint);

    if ( kind === "solid" ) {

        const ceramic = tint === "danger" ? theme.ceramic.danger : tint === "brand" ? theme.ceramic.primary : null;

        return ceramic
            ? { face: glaze(ceramic), ink: ceramic.ink }
            : { face: { backgroundColor: theme.tone[tint].base }, ink: theme.tone[tint].on };

    }

    if ( kind === "glass" ) return { face: { backgroundColor: theme.plane.veil }, ink: theme.material.ink };
    if ( kind === "ghost" ) return { face: { backgroundColor: "transparent" }, ink: voice };
    if ( kind === "outline" ) return { face: { backgroundColor: theme.tone[tint].soft, borderWidth: theme.stroke.thin, borderColor: theme.tone[tint].line }, ink: voice };

    return { face: { backgroundColor: tint === "brand" || tint === "neutral" ? seat : theme.tone[tint].soft }, ink: voice };

};

export function Button ({ label, labelRank, size = "md", onPress, kind = "solid", tint = "brand", icon, figure, trailing, block = true, compact = false, roomy = false, done = false, on, loading = false, disabled = false }: ButtonProps) {

    const theme = useTheme();
    const surface = useSurface();
    const seat = theme.plane[above(on ?? surface, theme.name === "dark")];
    const skin = dress(theme, kind, tint, seat);
    const metric = compact ? { height: theme.mark.sm, gap: theme.space["1"], pad: theme.space["3"] } : theme.control[size];
    const idle = !disabled && !loading && !done;
    const hushed = loading || done;

    return (
        <Press
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: !idle, busy: loading }}
            onPress={idle ? onPress : undefined}
            disabled={!idle}
            hitSlop={compact ? ( theme.control.md.height - metric.height ) / 2 : Math.max(0, theme.hit.min - metric.height) / 2}
            muted={disabled ? theme.state.numb : 1}
            feel={kind === "ghost" ? "dim" : "nudge"}
            style={{
                ...skin.face,
                minHeight: metric.height,
                paddingVertical: theme.space["1"],
                minWidth: metric.height,
                paddingHorizontal: roomy ? ( size === "lg" ? theme.control.lg.widePad : theme.control.md.widePad ) : metric.pad,
                borderRadius: theme.radius.pill,
                alignItems: "center",
                justifyContent: "center",
                alignSelf: block ? "stretch" : "flex-start",
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: metric.gap, opacity: hushed ? 0 : 1 }}>
                {figure ?? ( icon ? <Icon name={icon} size={theme.icon.md} color={skin.ink} /> : null )}

                <Text rank={labelRank ?? ( compact ? "label" : "action" )} color={skin.ink}>{label}</Text>

                {trailing ? <Icon name={trailing} size={theme.icon.md} color={skin.ink} /> : null}
            </View>

            {loading ? (
                <Animated.View entering={FadeIn.duration(theme.beat.quick)} exiting={FadeOut.duration(theme.beat.instant)} style={{ position: "absolute" }}>
                    <Spinner size={theme.icon.md} color={skin.ink} />
                </Animated.View>
            ) : null}

            {done && !loading ? (
                <Animated.View entering={ZoomIn.springify().damping(theme.spring.bounce.damping)} exiting={FadeOut.duration(theme.beat.instant)} style={{ position: "absolute" }}>
                    <Icon name="check" size={theme.icon.md} color={skin.ink} weight="bold" />
                </Animated.View>
            ) : null}
        </Press>
    );

}
