import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import type { SinkName } from "@/theme/motion";
import { useTheme } from "@/theme/use-theme";

const Surge = Animated.createAnimatedComponent(Pressable);

type Feel = "sink" | "nudge" | "dim" | "ripple" | "none";

type PressProps = Omit<PressableProps, "style" | "children"> & {
    children: ReactNode;
    style?: StyleProp<ViewStyle> | undefined;
    feel?: Feel | undefined;
    sink?: SinkName | undefined;
    muted?: number | undefined;
};

type Wash = "dip" | "hush" | "none";

const dips: Record<Feel, { scale: number; drop: number; fade: Wash }> = {
    sink: { scale: 1, drop: 0, fade: "dip" },
    nudge: { scale: 0, drop: 1, fade: "none" },
    dim: { scale: 0, drop: 0, fade: "hush" },
    ripple: { scale: 0, drop: 0, fade: "none" },
    none: { scale: 0, drop: 0, fade: "none" },
};

export function Press ({ children, style, feel = "sink", sink = "card", muted = 1, disabled, onPressIn, onPressOut, ...rest }: PressProps) {

    const theme = useTheme();
    const held = useSharedValue(0);
    const dip = dips[feel];
    const floor = theme.sink[sink];
    const wash = dip.fade === "none" ? 0 : theme.fade[dip.fade];

    const skin = useAnimatedStyle(() => ({
        transform: [ { translateY: held.value * dip.drop }, { scale: 1 - held.value * dip.scale * ( 1 - floor ) } ],
        opacity: muted * ( 1 - held.value * wash ),
    }), [ dip.scale, dip.drop, floor, muted, wash ]);

    return (
        <Surge
            {...rest}
            {...( feel === "ripple" && !disabled ? { android_ripple: { color: theme.state.press, foreground: true } } : {} )}
            disabled={disabled}
            onPressIn={( event ) => {

                held.value = withSpring(1, theme.spring.press);
                onPressIn?.(event);

            }}
            onPressOut={( event ) => {

                held.value = withSpring(0, theme.spring.release);
                onPressOut?.(event);

            }}
            style={[ style, skin ]}
        >
            {children}
        </Surge>
    );

}
