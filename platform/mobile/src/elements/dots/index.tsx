import { useMemo } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { useGlide } from "@/elements/motion";
import { useTheme } from "@/theme/use-theme";

type DotsProps = {
    count: number;
    index: number;
    lit?: boolean | undefined;
};

const sizes = {
    base: { idle: 8, live: 11 },
    lit: { idle: 6, live: 8 },
} as const;

function Dot ({ on, lit }: { on: boolean; lit: boolean }) {

    const theme = useTheme();
    const { idle, live } = sizes[lit ? "lit" : "base"];
    const lead = lit ? theme.material.lit : theme.tone.brand.base;
    const rest = lit ? theme.photo.dot : theme.line.strong;

    const grow = useGlide("press", [ "width", "height" ]);

    return <Animated.View style={[ styles.dot, { width: on ? live : idle, height: on ? live : idle, borderRadius: live, backgroundColor: on ? lead : rest, ...grow } ]} />;

}

export function Dots ({ count, index, lit = false }: DotsProps) {

    const theme = useTheme();
    const slots = useMemo(() => Array.from({ length: count }, ( _, position ) => `dot-${ position }` ), [ count ]);

    return (
        <View style={[ styles.row, { gap: theme.space[lit ? "1" : "2"] } ]}>
            {slots.map(( id, position ) => (
                <Dot key={id} on={position === index} lit={lit} />
            ))}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        borderRadius: theme.radius.pill,
    },

}));
