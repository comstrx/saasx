import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { useTheme } from "@/theme/use-theme";

type StarsProps = {
    value: number;
    onChange: ( value: number ) => void;
    size?: number | undefined;
    label?: string | undefined;
};

const stars = [ 1, 2, 3, 4, 5 ];

function Star ({ slot, value, size, onPress }: { slot: number; value: number; size: number; onPress: () => void }) {

    const theme = useTheme();
    const lit = slot <= value;
    const pop = useSharedValue(0);

    useEffect(() => {

        if ( !lit ) return;

        pop.value = withDelay(
            theme.beat.stagger * ( slot - 1 ) * 0.4,
            withSequence(withTiming(1, { duration: theme.beat.instant }), withSpring(0, theme.spring.press)),
        );

    }, [ lit, pop, slot, theme.beat.instant, theme.spring.press, theme.beat.stagger ]);

    const bouncing = useAnimatedStyle(() => ({ transform: [ { scale: 1 + pop.value * 0.28 } ] }));

    return (
        <Press onPress={onPress} sink="disc" hitSlop={theme.space["1"]} accessibilityRole="button" accessibilityLabel={String(slot)} accessibilityState={{ selected: lit }}>
            <Animated.View style={bouncing}>
                <Icon name={lit ? "ratingStar" : "ratingStarEmpty"} size={size} tint="star" />
            </Animated.View>
        </Press>
    );

}

export function Stars ({ value, onChange, size, label }: StarsProps) {

    const theme = useTheme();

    return (
        <Box
            row
            align="center"
            justify="center"
            gap="3"
            style={styles.row}
            accessibilityLabel={label}
        >
            {stars.map(( slot ) => (
                <Star
                    key={slot}
                    slot={slot}
                    value={value}
                    size={size ?? theme.icon.xl + theme.space["2"]}
                    onPress={() => onChange(slot) }
                />
            ))}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        paddingVertical: theme.space["2"],
    },

}));
