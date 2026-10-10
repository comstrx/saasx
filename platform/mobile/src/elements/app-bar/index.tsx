import { useIsFocused } from "expo-router";
import type { ReactNode } from "react";
import { I18nManager, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import Animated from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { arrowBack } from "@/elements/icon";
import { useLabels } from "@/elements/labels";
import { Logo } from "@/elements/logo";
import { Appear, useEase } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Round, RoundGround, RoundSpan } from "@/elements/round";
import { Surface, useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type AppBarTone = "base" | "stage";

type AppBarProps = {
    title?: string | undefined;
    subtitle?: string | undefined;
    tint?: ToneName | undefined;
    figure?: ReactNode | undefined;
    brand?: boolean | undefined;
    onBack?: (() => void) | undefined;
    onClose?: (() => void) | undefined;
    onTitle?: (() => void) | undefined;
    actions?: ReactNode | undefined;
    children?: ReactNode | undefined;
    plain?: boolean | undefined;
    spacingAfter?: number | undefined;
    floating?: boolean | undefined;
    revealed?: boolean | undefined;
    media?: boolean | undefined;
    tone?: AppBarTone | undefined;
};

export function AppBar ({ title, subtitle, tint, figure, brand = false, onBack, onClose, onTitle, actions, children, spacingAfter, plain = false, floating = false, revealed = true, media = false, tone = "base" }: AppBarProps) {

    const theme = useTheme();
    const { rt: { insets } } = useUnistyles();
    const focused = useIsFocused();
    const stage = tone === "stage";
    const surface = useSurface();
    const labels = useLabels();
    const shown = revealed || !floating;
    const fade = useEase("opacity");
    const lift = useEase([ "opacity", "transform" ]);

    const veil = { opacity: shown ? 1 : 0, ...fade };
    const band = { opacity: shown ? 0 : 1, ...fade };
    const caption = { opacity: shown ? 1 : 0, transform: [ { translateY: shown ? 0 : theme.travel.near } ], ...lift };

    const crowned = brand || Boolean(onBack || onClose || title || subtitle || figure || actions);
    const breath = theme.space["3"];

    const copy = (
        <>
            {title ? <Text rank="heading" tint={stage ? "on" : undefined} numberOfLines={1}>{title}</Text> : null}
            {subtitle ? <Text rank="note" ink={tint ? undefined : "faint"} tint={tint} numberOfLines={1}>{subtitle}</Text> : null}
        </>
    );

    return (
        <RoundSpan value={theme.control.bar.height}>
            <RoundGround value={floating && media && !shown ? "glass" : null}>
                <View
                    pointerEvents="box-none"
                    style={{
                        position: floating ? "absolute" : "relative",
                        top: 0,
                        insetInlineStart: 0,
                        insetInlineEnd: 0,
                        zIndex: theme.layer.sticky,
                    }}
                >
                    {floating && media && !shown && focused ? <SystemBars style="light" /> : null}

                    {floating && media ? (
                        <Animated.View
                            pointerEvents="none"
                            style={[ {
                                position: "absolute",
                                top: 0,
                                insetInlineStart: 0,
                                insetInlineEnd: 0,
                                height: insets.top,
                                backgroundColor: theme.photo.band,
                            }, band ]}
                        />
                    ) : null}

                    <View pointerEvents="box-none" style={{ paddingTop: floating ? insets.top : 0 }}>
                        <Animated.View
                            pointerEvents="none"
                            style={[ {
                                position: "absolute",
                                top: floating ? 0 : -insets.top,
                                bottom: 0,
                                insetInlineStart: 0,
                                insetInlineEnd: 0,
                                backgroundColor: stage ? theme.plane.stage : floating && !plain ? theme.plane[surface] : "transparent",
                            }, veil ]}
                        />

                        {crowned ? (
                            <Surface value={stage ? "stage" : surface}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        direction: brand ? "ltr" : "inherit",
                                        alignItems: "center",
                                        gap: theme.space["3"],
                                        paddingHorizontal: theme.layout.gutter,
                                        paddingTop: theme.space["1.5"],
                                        paddingBottom: spacingAfter ?? breath,
                                    }}
                                >
                                    {onBack || onClose ? (
                                        <Appear from="still" grow>
                                            <Round icon={onClose ? "close" : arrowBack} look={stage ? "glass" : undefined} onPress={onClose ?? onBack} label={onClose ? labels.close : labels.back} />
                                        </Appear>
                                    ) : null}
                                    {brand ? <Logo size={theme.mark.bar} word /> : null}
                                    {figure}

                                    <Animated.View style={[ { flex: 1 }, floating ? caption : undefined ]}>
                                        {floating ? ( onTitle ? <Press onPress={onTitle} sink="tile" accessibilityRole="button">{copy}</Press> : copy ) : (
                                            <Appear from="end" travel={theme.travel.far} delay={theme.beat.stagger}>
                                                {onTitle ? <Press onPress={onTitle} sink="tile" accessibilityRole="button">{copy}</Press> : copy}
                                            </Appear>
                                        )}
                                    </Animated.View>

                                    {actions ? (
                                        <View
                                            style={{
                                                flexDirection: brand && I18nManager.isRTL ? "row-reverse" : "row",
                                                direction: I18nManager.isRTL ? "rtl" : "ltr",
                                                alignItems: "center",
                                                gap: theme.space["2"],
                                            }}
                                        >
                                            {actions}
                                        </View>
                                    ) : null}
                                </View>
                            </Surface>
                        ) : null}
                    </View>

                    {children ? (
                        <View
                            style={{
                                gap: theme.space["3"],
                                paddingHorizontal: theme.layout.gutter,
                                paddingTop: crowned ? 0 : theme.space["3"],
                                paddingBottom: crowned ? theme.layout.stack + theme.space["1.5"] : theme.layout.stack,
                            }}
                        >
                            {children}
                        </View>
                    ) : null}
                </View>
            </RoundGround>
        </RoundSpan>
    );

}
