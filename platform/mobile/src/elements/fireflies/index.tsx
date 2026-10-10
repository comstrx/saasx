import { View } from "react-native";
import Animated, { css, useReducedMotion } from "react-native-reanimated";
import { ambient, firefly } from "@/theme/motion";
import { useTheme } from "@/theme/use-theme";
import { halo } from "@/theme/wash";

type FirefliesProps = { size: number; active: boolean };

const flutter = css.keyframes({
    from: { transform: [ { translateX: 0 }, { translateY: 0 }, { scale: firefly.scale } ], opacity: firefly.dim },
    "35%": { transform: [ { translateX: firefly.x }, { translateY: -firefly.y }, { scale: 1 } ], opacity: 1 },
    "70%": { transform: [ { translateX: -firefly.x }, { translateY: -firefly.y / 2 }, { scale: firefly.scale } ], opacity: ambient.dim },
    to: { transform: [ { translateX: 0 }, { translateY: 0 }, { scale: firefly.scale } ], opacity: firefly.dim },
});

export function Fireflies ({ size: side, active }: FirefliesProps) {

    const theme = useTheme();
    const still = useReducedMotion();
    const alive = active && !still;
    const scene = theme.composition.fireflies;
    const night = theme.name === "dark";

    return (
        <View pointerEvents="none" accessible={false} style={{ position: "absolute", width: side, height: side }}>
            {scene.motes.map(( mote, index ) => (
                <Animated.View key={mote.delay} style={[ {
                    position: "absolute",
                    left: side / 2 + side * mote.x - mote.size / 2,
                    top: side / 2 + side * mote.y - mote.size / 2,
                    width: mote.size, height: mote.size,
                    borderRadius: theme.radius.pill,
                    experimental_backgroundImage: halo(theme.tone[mote.tone].base, night ? scene.light.night : scene.light.day),
                }, alive ? {
                    animationName: flutter,
                    animationDuration: firefly.cycle + index * firefly.stagger,
                    animationDelay: mote.delay,
                    animationIterationCount: "infinite",
                    animationTimingFunction: "ease-in-out",
                    animationDirection: index % 2 ? "reverse" : "normal",
                } : null ]}>
                    <View style={{
                        position: "absolute", left: "40%", top: "40%", width: "20%", height: "20%",
                        borderRadius: theme.radius.pill,
                        backgroundColor: theme.tone[mote.tone].glow,
                    }} />
                </Animated.View>
            ))}
        </View>
    );

}
