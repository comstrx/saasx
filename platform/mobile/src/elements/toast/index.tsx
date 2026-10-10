import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { css, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { useLaneFloor } from "@/elements/dock/floor";
import type { IconName } from "@/elements/icon";
import { Icon } from "@/elements/icon";
import { eases, glides, useEase, useGlide } from "@/elements/motion";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";
import { glazeTone } from "@/theme/wash";

type ToastProps = {
    open: boolean;
    body: string;
    title?: string | undefined;
    tint?: ToneName | undefined;
    icon?: IconName | undefined;
    linger?: number | undefined;
    lift?: number | undefined;
    onClose?: (() => void) | undefined;
};

const marks: Record<ToneName, IconName> = {
    brand: "info",
    accent: "points",
    success: "checkCircle",
    danger: "alert",
    warning: "warning",
    info: "info",
    neutral: "info",
};

const popping = css.keyframes({
    from: { transform: [ { scale: 0.6 }, { rotate: "-14deg" } ] },
    to: { transform: [ { scale: 1 }, { rotate: "0deg" } ] },
});

const burning = css.keyframes({
    from: { width: "100%" },
    to: { width: "0%" },
});

export function Toast ({ open, body, title, tint = "brand", icon, linger, lift = 0, onClose }: ToastProps) {

    const theme = useTheme();
    const still = useReducedMotion();
    const drag = useSharedValue(0);
    const floor = useLaneFloor();
    const hue = theme.tone[tint];
    const pebble = theme.control.sm.height;
    const stay = linger ?? 4000;
    const fused = Boolean(onClose) && linger !== 0;

    const [ round, setRound ] = useState({ open, count: 0 });

    if ( round.open !== open ) setRound({ open, count: open ? round.count + 1 : round.count });

    useEffect(() => {

        if ( open ) drag.value = 0;

    }, [ open, drag ]);

    useEffect(() => {

        if ( !open || !onClose || linger === 0 ) return;

        const away = setTimeout(onClose, stay);

        return () => clearTimeout(away);

    }, [ open, onClose, linger, stay ]);

    const rise = useGlide("enter", [ "opacity", "transform" ]);
    const sink = useEase([ "opacity", "transform" ]);

    const skin = {
        opacity: open ? 1 : 0,
        transform: [ { translateY: open ? 0 : theme.space["7"] }, { scale: open ? 1 : 1 - theme.swell.pulse } ],
        ...( open ? rise : { ...sink, transitionTimingFunction: eases.exit } ),
    };

    const following = useAnimatedStyle(() => ({ transform: [ { translateY: Math.max(0, drag.value) } ] }));

    const flick = Gesture.Pan()
        .onUpdate(( event ) => {

            drag.value = event.translationY;

        })
        .onEnd(( event ) => {

            if ( event.translationY > theme.space["4"] && onClose ) {

                runOnJS(onClose)();

                return;

            }

            drag.value = withSpring(0, theme.spring.glide);

        });

    return (
        <Animated.View
            pointerEvents={open && onClose ? "box-none" : "none"}
            style={[ {
                position: "absolute",
                bottom: floor + lift,
                insetInlineStart: theme.layout.gutter,
                insetInlineEnd: theme.layout.gutter,
                alignItems: "center",
                zIndex: theme.layer.toast,
            }, skin ]}
        >
            <GestureDetector gesture={flick}>
                <Animated.View style={following}>
                    <Pressable
                        accessibilityRole="alert"
                        onPress={onClose}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: theme.space["3"],
                            paddingVertical: theme.space["2"],
                            paddingStart: theme.space["2"],
                            paddingEnd: theme.space["4"],
                            borderRadius: theme.radius.pill,
                            backgroundColor: theme.plane.raised,
                            ...theme.depth.float,
                        }}
                    >
                        <Animated.View key={`mark-${ round.count }`} style={still ? undefined : { animationName: popping, animationDuration: glides.bounce.duration, animationTimingFunction: glides.bounce.easing, animationDelay: theme.beat.instant, animationFillMode: "backwards" }}>
                            <View style={{ width: pebble, height: pebble, borderRadius: pebble / 2, alignItems: "center", justifyContent: "center", ...glazeTone(hue) }}>
                                <Icon name={icon ?? marks[tint]} size={theme.icon.md} color={hue.on} />
                            </View>
                        </Animated.View>

                        <View style={{ flexShrink: 1, gap: theme.space["1"] }}>
                            {title ? <Text rank="label" ink="strong">{title}</Text> : null}
                            <Text rank={title ? "caption" : "label"} ink={title ? "soft" : "strong"} numberOfLines={2}>{body}</Text>
                        </View>

                        {fused ? <Icon name="close" size={theme.icon.sm} color={theme.ink.soft} /> : null}

                        {fused ? (
                            <View pointerEvents="none" style={{ position: "absolute", bottom: 0, insetInlineStart: theme.radius.panel, insetInlineEnd: theme.radius.panel, height: theme.stroke.rail }}>
                                <Animated.View key={`fuse-${ round.count }`} style={{ width: "0%", height: theme.stroke.rail, borderRadius: theme.radius.pill, backgroundColor: hue.bright, ...( open ? { animationName: burning, animationDuration: stay, animationTimingFunction: "linear", animationFillMode: "backwards" } : {} ) }} />
                            </View>
                        ) : null}
                    </Pressable>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );

}
