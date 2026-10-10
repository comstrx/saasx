import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { Icon } from "@/elements/icon";
import { useMotionActive } from "@/elements/motion/activity";
import { Text } from "@/elements/text";
import type { Stage } from "@/model/order";
import { useTheme } from "@/theme/use-theme";

type JourneyProps = {
    stages: readonly Stage[];
};

function Pulse () {

    const theme = useTheme();
    const beat = useSharedValue(0);
    const active = useMotionActive();

    useEffect(() => {

        if ( !active ) { cancelAnimation(beat); return; }

        beat.value = withRepeat(withTiming(1, { duration: theme.beat.slow * 3 }), -1, false);

        return () => cancelAnimation(beat);

    }, [ active, beat, theme.beat.slow ]);

    const halo = useAnimatedStyle(() => ({
        opacity: 0.5 - beat.value * 0.5,
        transform: [ { scale: 1 + beat.value * 0.9 } ],
    }));

    return <Animated.View style={[ styles.halo, halo ]} pointerEvents="none" />;

}

export function Journey ({ stages }: JourneyProps) {

    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <View style={styles.rail}>
            {stages.map(( stage, slot ) => {

                const reached = stage.done || stage.live;

                return (
                    <View key={stage.key} style={styles.step}>
                        <View style={styles.spine}>
                            <View style={[ styles.knob, reached && styles.lit, stage.live && styles.live ]}>
                                {stage.live ? <Pulse /> : null}
                                {stage.done ? <Icon name="check" size={theme.icon.xs} tint="lit" /> : null}
                                {stage.live ? <View style={styles.core} /> : null}
                            </View>

                            {slot < stages.length - 1 ? <View style={[ styles.thread, stage.done && styles.threaded ]} /> : null}
                        </View>

                        <View style={styles.copy}>
                            <Text rank="label" ink={reached ? undefined : "faint"} numberOfLines={1}>
                                {t(`orders.stage.${ stage.key }`, { defaultValue: stage.key })}
                            </Text>
                        </View>
                    </View>
                );

            })}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    rail: {
        gap: 0,
    },
    step: {
        flexDirection: "row",
        gap: theme.space["4"],
    },
    spine: {
        alignItems: "center",
        width: theme.icon.lg,
    },
    knob: {
        width: theme.icon.lg,
        height: theme.icon.lg,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        borderWidth: theme.stroke.base,
        borderColor: theme.line.strong,
        backgroundColor: theme.plane.base,
    },
    lit: {
        borderColor: theme.tone.brand.base,
        backgroundColor: theme.tone.brand.base,
    },
    halo: {
        position: "absolute",
        width: theme.icon.lg,
        height: theme.icon.lg,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.base,
    },
    core: {
        width: theme.space["2"],
        height: theme.space["2"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.base,
    },
    live: {
        borderColor: theme.tone.brand.base,
        backgroundColor: theme.tone.brand.soft,
    },
    threaded: {
        backgroundColor: theme.tone.brand.base,
    },
    thread: {
        flex: 1,
        width: theme.stroke.base,
        minHeight: theme.space["6"],
        backgroundColor: theme.line.soft,
    },
    copy: {
        flex: 1,
        paddingBottom: theme.space["6"],
    },

}));
