import { View } from "react-native";
import Animated, { css } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { LaunchMark } from "@/elements/launch-mark";
import { Logo } from "@/elements/logo";
import { Text } from "@/elements/text";
import { launchMotion } from "@/theme/motion";
import { useTheme } from "@/theme/use-theme";

type LaunchScreenProps = {
    copyright: string;
    version: string;
};

const departure = css.keyframes({
    from: { opacity: 1 },
    [`${ ( 1 - launchMotion.exit / launchMotion.duration ) * 100 }%`]: { opacity: 1 },
    to: { opacity: 0 },
});

export function LaunchScreen ({ copyright, version }: LaunchScreenProps) {

    const theme = useTheme();
    const scene = theme.composition.launch;

    return (
        <Animated.View
            pointerEvents="auto"
            accessibilityViewIsModal
            style={[ styles.stage, {
                opacity: 0,
                animationName: departure,
                animationDuration: launchMotion.duration,
                animationTimingFunction: "ease-in-out",
                animationFillMode: "backwards",
            } ]}
        >
            <View style={styles.body}>
                <View style={styles.identity}>
                    <LaunchMark />
                    <Logo size={scene.wordmark} word />
                </View>
            </View>

            <View style={styles.foot}>
                <Text rank="caption" ink="soft" align="center" ltr>{copyright}</Text>
                <Text rank="caption" ink="faint" align="center" ltr figures>{version}</Text>
            </View>
        </Animated.View>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    stage: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.plane.canvas,
        paddingTop: runtime.insets.top,
        paddingBottom: runtime.insets.bottom + theme.composition.launch.footerInset,
        paddingHorizontal: theme.layout.gutter,
        zIndex: theme.layer.launch,
    },
    body: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    identity: {
        alignItems: "center",
        gap: theme.composition.launch.gap,
    },
    foot: {
        alignItems: "center",
        gap: theme.space["1.5"],
    },

}));
