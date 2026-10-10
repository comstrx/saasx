import { useEffect } from "react";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useMotionActive } from "@/elements/motion/activity";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type SpinnerProps = {
    size?: number | undefined;
    tint?: ToneName | "ink" | undefined;
    color?: string | undefined;
};

export function Spinner ({ size = 20, tint = "brand", color }: SpinnerProps) {

    const theme = useTheme();
    const turn = useSharedValue(0);
    const active = useMotionActive();

    const paint = color ?? ( tint === "ink" ? theme.ink.base : theme.tone[tint].base );

    useEffect(() => {

        if ( !active ) { cancelAnimation(turn); return; }

        turn.value = withRepeat(withTiming(1, { duration: theme.beat.spin, easing: Easing.linear }), -1, false);

        return () => cancelAnimation(turn);

    }, [ active, turn, theme.beat.spin ]);

    const spin = useAnimatedStyle(() => ({ transform: [ { rotate: `${ turn.value * 360 }deg` } ] }));

    return (
        <Animated.View
            style={[ {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: Math.max(2.4, Math.round(size / 7)),
                borderColor: paint,
                borderTopColor: "transparent",
                borderStartColor: "transparent",
            }, spin ]}
        />
    );

}
