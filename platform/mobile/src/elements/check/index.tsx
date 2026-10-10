import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { Icon } from "@/elements/icon";
import { useGlide, useTint } from "@/elements/motion";
import { useTheme } from "@/theme/use-theme";

type CheckProps = {
    on: boolean;
    onChange?: (( next: boolean ) => void) | undefined;
    round?: boolean | undefined;
    tick?: boolean | undefined;
    size?: number | undefined;
    disabled?: boolean | undefined;
    label?: string | undefined;
};

export function Check ({ on, onChange, round = false, tick = false, size, disabled = false, label }: CheckProps) {

    const theme = useTheme();
    const tint = useTint();
    const glide = useGlide("snap", [ "opacity", "transform" ]);
    const box = size ?? theme.toggle.check;

    const pop = { opacity: on ? 1 : 0, ...glide };

    const face = (
        <Animated.View
            key={theme.name}
            style={{
                width: box,
                height: box,
                borderRadius: round || tick ? box / 2 : theme.radius.tag,
                borderWidth: theme.stroke.base,
                alignItems: "center",
                justifyContent: "center",
                opacity: disabled ? theme.state.numb : 1,
                backgroundColor: on ? ( tick ? theme.tone.brand.bright : theme.tone.brand.base ) : tick ? "transparent" : theme.plane.well,
                borderColor: on ? ( tick ? theme.tone.brand.bright : theme.tone.brand.base ) : theme.line.strong,
                ...tint,
            }}
        >
            {round ? (
                <Animated.View style={{ width: box * 0.42, height: box * 0.42, borderRadius: box, backgroundColor: theme.tone.brand.on, transform: [ { scale: on ? 1 : 0 } ], ...pop }} />
            ) : (
                <Animated.View style={{ transform: [ { scale: on ? 1 : 0.6 } ], ...pop }}>
                    <Icon name="check" size={Math.round(box * 0.68)} color={theme.tone.brand.on} weight="bold" />
                </Animated.View>
            )}
        </Animated.View>
    );

    if ( !onChange ) return <View importantForAccessibility="no-hide-descendants">{face}</View>;

    return (
        <Pressable
            accessibilityRole={round ? "radio" : "checkbox"}
            accessibilityLabel={label}
            accessibilityState={{ checked: on, disabled }}
            onPress={disabled ? undefined : () => onChange(!on)}
            hitSlop={theme.hit.slop}
        >
            {face}
        </Pressable>
    );

}
