import { useEffect, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import type { Curve } from "@/elements/box";
import { useMotionActive } from "@/elements/motion/activity";
import { useSurface } from "@/elements/surface";
import { above } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";
import { linear } from "@/theme/wash";

type SkeletonProps = {
    width?: number | `${ number }%` | undefined;
    height?: number | undefined;
    curve?: Curve | undefined;
    round?: boolean | undefined;
};

export function Skeleton ({ width = "100%", height = 14, curve = "tag", round = false }: SkeletonProps) {

    const theme = useTheme();
    const surface = useSurface();
    const active = useMotionActive();
    const sweep = useSharedValue(0);
    const [ span, setSpan ] = useState(0);

    useEffect(() => {

        if ( !active ) return;

        sweep.value = withRepeat(withTiming(1, { duration: theme.beat.pulse, easing: Easing.inOut(Easing.quad) }), -1, false);

        return () => cancelAnimation(sweep);

    }, [ sweep, active, theme.beat.pulse ]);

    const band = useAnimatedStyle(() => ({ transform: [ { translateX: -span + sweep.value * span * 2 } ] }));

    const measure = ( event: LayoutChangeEvent ) => setSpan(Math.round(event.nativeEvent.layout.width) );

    const { glare, clear } = theme.shimmer;

    return (
        <View
            onLayout={measure}
            style={{
                width,
                height,
                borderRadius: round ? height / 2 : theme.radius[curve],
                backgroundColor: theme.plane[above(surface, theme.name === "dark")],
                overflow: "hidden",
            }}
        >
            {!active ? null : <Animated.View
                style={[ {
                    width: span,
                    height,
                    experimental_backgroundImage: linear(90, [ [ clear, 0 ], [ glare, 0.5 ], [ clear, 1 ] ]),
                }, band ]}
            />}
        </View>
    );

}
