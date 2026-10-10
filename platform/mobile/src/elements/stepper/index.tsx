import { View } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withSpring } from "react-native-reanimated";
import { Icon } from "@/elements/icon";
import { useLabels } from "@/elements/labels";
import { Press } from "@/elements/press";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { above } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type StepperProps = {
    value: number;
    onChange: ( next: number ) => void;
    min?: number | undefined;
    max?: number | undefined;
    disabled?: boolean | undefined;
    label?: string | undefined;
};

export function Stepper ({ value, onChange, min = 0, max = 99, disabled = false, label }: StepperProps) {

    const theme = useTheme();
    const labels = useLabels();
    const surface = useSurface();
    const size = theme.control.md.height;
    const beat = useDerivedValue(() => withSpring(value, theme.spring.press) );

    const pulse = useAnimatedStyle(() => ({ transform: [ { scale: 1 + Math.min(theme.swell.pop, Math.abs(beat.value - value) * 0.3 ) } ] }));

    const step = ( next: number ) => {

        if ( disabled || next < min || next > max ) return;

        onChange(next);

    };

    const knob = ( icon: "minus" | "plus", next: number, dead: boolean ) => (
        <Press
            accessibilityRole="button"
            accessibilityLabel={[ icon === "minus" ? labels.decrease : labels.increase, label ].filter(Boolean).join(" · ")}
            accessibilityState={{ disabled: dead }}
            hitSlop={theme.hit.slop}
            onPress={() => step(next)}
            disabled={dead}
            muted={dead ? theme.state.numb : 1}
            sink="disc"
        >
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: theme.radius.pill,
                    backgroundColor: theme.plane[above(surface, theme.name === "dark")],
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Icon name={icon} size={theme.icon.md} tint="base" />
            </View>
        </Press>
    );

    return (
        <View accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ now: value, min, max }} style={{ flexDirection: "row", alignItems: "center", gap: theme.space["3"], direction: "ltr" }}>
            {knob("minus", value - 1, value <= min)}

            <Animated.View style={[ { minWidth: theme.control.sm.height, alignItems: "center" }, pulse ]}>
                <Text rank="title" figures ltr>{value}</Text>
            </Animated.View>

            {knob("plus", value + 1, value >= max)}
        </View>
    );

}
