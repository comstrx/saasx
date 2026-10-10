import { useMemo } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { useEase } from "@/elements/motion";
import { useTheme } from "@/theme/use-theme";

type StepRailProps = {
    total: number;
    step: number;
};

function Segment ({ done }: { done: boolean }) {

    const theme = useTheme();

    const grow = useEase("width", theme.beat.base);

    return (
        <View style={styles.track}>
            <Animated.View style={[ styles.fill, { width: done ? "100%" : "0%", ...grow } ]} />
        </View>
    );

}

export function StepRail ({ total, step }: StepRailProps) {

    const slots = useMemo(() => Array.from({ length: total }, ( _, slot ) => slot ), [ total ]);

    return (
        <View style={styles.rail}>
            {slots.map(( slot ) => (
                <Segment key={slot} done={slot < step} />
            ))}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    rail: {
        marginTop: theme.space["2"],
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        width: "65%",
        gap: theme.space["2"],
    },
    track: {
        flex: 1,
        height: theme.stroke.rail,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.line.soft,
        overflow: "hidden",
    },
    fill: {
        height: "100%",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.base,
    },

}));
