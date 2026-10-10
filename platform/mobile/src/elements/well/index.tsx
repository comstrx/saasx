import type { ReactNode, Ref } from "react";
import { I18nManager, type StyleProp, TextInput, type TextInputProps, View, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Icon } from "@/elements/icon";
import { useTint } from "@/elements/motion";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { above, type PlaneName } from "@/theme/roles";
import type { RankName } from "@/theme/text";
import { useScript } from "@/theme/use-script";
import { useTheme } from "@/theme/use-theme";

type WellState = "idle" | "focus" | "error" | "success" | "disabled";

type ShellProps = {
    children: ReactNode;
    state?: WellState | undefined;
    on?: PlaneName | undefined;
    pad?: boolean | undefined;
    tall?: boolean | undefined;
    style?: StyleProp<ViewStyle> | undefined;
};

type WellProps = {
    children: ReactNode;
    label?: string | undefined;
    hint?: string | undefined;
    error?: string | undefined;
    required?: boolean | undefined;
    count?: string | undefined;
};

export const stateOf = ( lit: boolean, error?: string | undefined, editable = true, done = false ): WellState =>
    !editable ? "disabled" : error ? "error" : lit ? "focus" : done ? "success" : "idle";

export function Shell ({ children, state = "idle", on, pad = true, tall = false, style }: ShellProps) {

    const theme = useTheme();
    const surface = useSurface();
    const night = theme.name === "dark";
    const seat = tall && !night ? theme.plane.base : theme.plane[above(on ?? surface, night)];

    const fade = useTint();

    const edges: Record<WellState, string> = {
        idle: theme.line.soft,
        focus: theme.line.focus,
        error: theme.tone.danger.edge,
        success: theme.tone.success.edge,
        disabled: theme.line.hair,
    };

    const fills: Record<WellState, string> = {
        idle: seat,
        focus: seat,
        error: seat,
        success: seat,
        disabled: theme.plane.sunken,
    };

    return (
        <Animated.View
            key={theme.name}
            style={[ {
                flexDirection: "row",
                alignItems: "center",
                gap: theme.control.md.gap,
                borderRadius: theme.radius.pill,
                borderWidth: theme.stroke.thin,
                minHeight: tall ? theme.control.lg.height - theme.space["1"] / 2 : theme.control.md.height,
                boxShadow: theme.depth.lift.boxShadow,
                ...( pad ? { paddingHorizontal: theme.control.md.pad } : {} ),
                opacity: state === "disabled" ? 0.7 : 1,
                borderColor: edges[state],
                backgroundColor: fills[state],
                ...fade,
            }, style ]}
        >
            {children}
        </Animated.View>
    );

}

export function Well ({ children, label, hint, error, required = false, count }: WellProps) {

    const theme = useTheme();

    return (
        <View style={{ gap: theme.space["1"] }}>
            {label ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["1"], paddingHorizontal: theme.space["1"] }}>
                    <Text rank="label">{label}</Text>
                    {required ? <Text rank="label" tint="danger">*</Text> : null}
                </View>
            ) : null}

            {children}

            {error || hint || count ? (
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.space["2"], marginTop: theme.composition.field.helperOffset, paddingHorizontal: theme.space["1"] }}>
                    <View style={{ flex: 1 }}>
                        {error ? (
                            <Animated.View
                                entering={FadeIn.duration(theme.beat.quick)}
                                exiting={FadeOut.duration(theme.beat.instant)}
                                style={{ flexDirection: "row", alignItems: "center", gap: theme.space["1"] }}
                            >
                                <Icon name="alert" size={theme.icon.xs} tint="danger" />
                                <View style={{ flex: 1 }}>
                                    <Text rank="note" tint="danger" numberOfLines={2}>{error}</Text>
                                </View>
                            </Animated.View>
                        ) : hint ? <Text rank="note" ink="faint" numberOfLines={2}>{hint}</Text> : null}
                    </View>

                    {count ? <Text rank="note" ink="faint" ltr figures>{count}</Text> : null}
                </View>
            ) : null}
        </View>
    );

}

export function useInputFont ( rank: RankName = "body", ltr = false ) {

    const theme = useTheme();
    const script = useScript();
    const metric = theme.text[rank][script];

    return {
        color: theme.ink.base,
        fontFamily: theme.fonts[ltr ? "latin" : script][metric.weight],
        fontSize: metric.size,
        alignSelf: "stretch" as const,
        padding: 0,
        paddingVertical: 0,
        textAlign: ltr || !I18nManager.isRTL ? ( "left" as const ) : ( "right" as const ),
        textAlignVertical: "center" as const,
        includeFontPadding: true,
        ...( ltr ? { writingDirection: "ltr" as const } : {} ),
    };

}

export function Input ({ style, ref, ...rest }: TextInputProps & { ref?: Ref<TextInput> | undefined }) {

    const theme = useTheme();
    const font = useInputFont();

    return (
        <TextInput
            {...rest}
            ref={ref}
            placeholderTextColor={theme.ink.faint}
            selectionColor={theme.tone.brand.base}
            style={[ { flex: 1, ...font }, style ]}
        />
    );

}
