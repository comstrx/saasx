import { View } from "react-native";
import Animated, { css, useReducedMotion } from "react-native-reanimated";
import { Logo } from "@/elements/logo";
import { eases } from "@/elements/motion";
import { useMotionActive } from "@/elements/motion/activity";
import { launchMotion } from "@/theme/motion";
import { useTheme } from "@/theme/use-theme";

const arrival = css.keyframes({
    from: { transform: [ { perspective: launchMotion.depth }, { scale: 0 }, { rotateY: "0deg" } ] },
    to: { transform: [ { perspective: launchMotion.depth }, { scale: 1 }, { rotateY: `${ 360 * launchMotion.turns }deg` } ] },
});

export function LaunchMark () {

    const theme = useTheme();
    const active = useMotionActive();
    const still = useReducedMotion();
    const scene = theme.composition.launch;

    return (
        <View style={{ width: scene.figure, height: scene.figure, alignItems: "center", justifyContent: "center" }}>
            <Animated.View
                style={active && !still ? {
                    animationName: arrival,
                    animationDuration: launchMotion.arrive,
                    animationTimingFunction: eases.enter,
                    animationFillMode: "backwards",
                } : undefined}
            >
                <Logo size={scene.figure} />
            </Animated.View>
        </View>
    );

}
