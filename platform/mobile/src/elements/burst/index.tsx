import { useEffect } from "react";
import { View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useMotionActive } from "@/elements/motion/activity";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type BurstProps = {
    on: boolean;
    size: number;
    tone?: ToneName | undefined;
    rings?: number | undefined;
};

const pulses = 3;

function Ring ({ on, size, paint, stroke, delay, beat }: { on: boolean; size: number; paint: string; stroke: number; delay: number; beat: number }) {

    const theme = useTheme();
    const swell = useSharedValue(0);

    useEffect(() => {

        swell.value = on
            ? withDelay(delay, withRepeat(withSequence(
                withTiming(1, { duration: beat, easing: Easing.out(Easing.quad) }),
                withTiming(0, { duration: 0 }),
            ), pulses, false))
            : withTiming(0, { duration: 0 });

        return () => cancelAnimation(swell);

    }, [ on, swell, delay, beat ]);

    const skin = useAnimatedStyle(() => ({
        opacity: swell.value === 0 ? 0 : ( 1 - swell.value ) * theme.fade.hush,
        transform: [ { scale: 0.72 + swell.value * 0.55 } ],
    }));

    return (
        <Animated.View
            pointerEvents="none"
            style={[ {
                position: "absolute",
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: stroke,
                borderColor: paint,
            }, skin ]}
        />
    );

}

export function Burst ({ on, size, tone = "accent", rings = 2 }: BurstProps) {

    const theme = useTheme();
    const paint = theme.tone[tone].base;
    const active = useMotionActive();
    const beat = theme.beat.pulse * 1.4;

    return (
        <View pointerEvents="none" style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
            {Array.from({ length: rings }, ( _, index ) => `ring-${ index }` ).map(( key, index ) => (
                <Ring key={key} on={on && active} size={size} paint={paint} stroke={theme.stroke.base} delay={index * ( beat / rings )} beat={beat} />
            ))}
        </View>
    );

}
