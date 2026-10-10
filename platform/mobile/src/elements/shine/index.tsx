import { useEffect, useState } from "react";
import { I18nManager, type LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useTheme } from "@/theme/use-theme";
import { linear } from "@/theme/wash";

type ShineProps = {
    delay?: number | undefined;
};

export function Shine ({ delay = 0 }: ShineProps) {

    const theme = useTheme();
    const [ span, setSpan ] = useState(0);
    const sweep = useSharedValue(0);
    const { sheen, clear } = theme.shimmer;

    useEffect(() => {

        if ( span <= 0 ) return;

        sweep.value = withDelay(delay, withTiming(1, { duration: theme.beat.sweep * 1.4, easing: Easing.inOut(Easing.cubic), reduceMotion: ReduceMotion.System }));

    }, [ span, delay, sweep, theme.beat.sweep ]);

    const band = useAnimatedStyle(() => ({
        transform: [ { translateX: ( I18nManager.isRTL ? -1 : 1 ) * ( -span * 0.5 + sweep.value * span * 1.6 ) } ],
    }));

    const measure = ( event: LayoutChangeEvent ) => setSpan(Math.round(event.nativeEvent.layout.width) );

    return (
        <View pointerEvents="none" onLayout={measure} style={[ StyleSheet.absoluteFill, { overflow: "hidden" } ]}>
            <Animated.View
                style={[ {
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    insetInlineStart: 0,
                    width: span * 0.45,
                    experimental_backgroundImage: linear(105, [ [ clear, 0 ], [ sheen, 0.5 ], [ clear, 1 ] ]),
                }, band ]}
            />
        </View>
    );

}
