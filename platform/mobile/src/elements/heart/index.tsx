import { View } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { useTheme } from "@/theme/use-theme";

type HeartProps = {
    on: boolean;
    label?: string | undefined;
    onChange?: (( next: boolean ) => void) | undefined;
    size?: number | undefined;
    glass?: boolean | undefined;
};

export function Heart ({ on, onChange, label, size, glass = false }: HeartProps) {

    const theme = useTheme();
    const box = size ?? theme.control.sm.height;
    const glyph = box >= theme.control.sm.height ? theme.icon.md : theme.icon.sm;

    const beat = useDerivedValue(() => on
        ? withSequence(withSpring(1.24, theme.spring.press), withSpring(1, theme.spring.press))
        : withTiming(1, { duration: theme.beat.quick }) );

    const pop = useAnimatedStyle(() => ({ transform: [ { scale: beat.value } ] }));

    const seat = glass ? theme.plane.veil : theme.plane.base;
    const paint = on ? theme.tone.danger.base : glass ? theme.material.ink : theme.ink.strong;

    return (
        <Press
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: on }}
            hitSlop={theme.hit.slop}
            onPress={() => onChange?.(!on)}
            sink="disc"
        >
            <View
                key={theme.name}
                style={{
                    width: box,
                    height: box,
                    borderRadius: box / 2,
                    backgroundColor: seat,
                    boxShadow: theme.depth.lift.boxShadow,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Animated.View style={pop}>
                    <Icon name="heart" size={glyph} color={paint} fill={on} />
                </Animated.View>
            </View>
        </Press>
    );

}
