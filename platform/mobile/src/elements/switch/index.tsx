import { I18nManager, Pressable, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useGlide, useTint } from "@/elements/motion";
import { useSurface } from "@/elements/surface";
import { useTheme } from "@/theme/use-theme";

const moving: ( keyof ViewStyle )[] = [ "transform", "borderColor" ];

type SwitchProps = {
    on: boolean;
    onChange?: (( next: boolean ) => void) | undefined;
    disabled?: boolean | undefined;
    label?: string | undefined;
};

export function Switch ({ on, onChange, disabled = false, label }: SwitchProps) {

    const theme = useTheme();
    const surface = useSurface();
    const tint = useTint();
    const slide = useGlide("snap", "transform");
    const ride = {
        transitionProperty: moving,
        transitionDuration: [ slide.transitionDuration, tint.transitionDuration ],
        transitionTimingFunction: [ slide.transitionTimingFunction, tint.transitionTimingFunction ],
    };
    const track = theme.toggle.track;
    const reach = ( track.width - track.knob ) * ( I18nManager.isRTL ? -1 : 1 );
    const bed = on ? theme.tone.brand.bright : theme.line.strong;

    return (
        <Pressable
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityState={{ checked: on, disabled }}
            onPress={disabled ? undefined : () => onChange?.(!on)}
            hitSlop={theme.hit.slop}
            style={{ width: track.width, height: track.knob, justifyContent: "center", opacity: disabled ? theme.state.numb : 1 }}
        >
            <Animated.View
                key={theme.name}
                style={{ height: track.height, borderRadius: theme.radius.pill, backgroundColor: bed, ...tint }}
            />

            <Animated.View
                key={`${ theme.name }-knob`}
                style={{
                    position: "absolute",
                    top: 0,
                    start: 0,
                    width: track.knob,
                    height: track.knob,
                    borderRadius: track.knob / 2,
                    borderWidth: track.ring,
                    borderColor: bed,
                    backgroundColor: theme.plane[surface],
                    transform: [ { translateX: on ? reach : 0 } ],
                    ...ride,
                }}
            />
        </Pressable>
    );

}
