import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useTheme } from "@/theme/use-theme";

type ConfettiProps = {
    on: boolean;
    reach: number;
    pieces?: number | undefined;
};

const seed = ( index: number, salt: number ): number => {

    const raw = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;

    return raw - Math.floor(raw);

};

function Piece ({ index, on, reach, paint }: { index: number; on: boolean; reach: number; paint: string }) {

    const theme = useTheme();
    const flight = useSharedValue(0);
    const angle = seed(index, 1) * Math.PI * 2;
    const speed = reach * ( 0.5 + seed(index, 2) * 0.5 );
    const spin = ( seed(index, 3) - 0.5 ) * 900;
    const size = theme.space["1"] + seed(index, 4) * theme.space["2"];
    const round = seed(index, 5) > 0.55;

    useEffect(() => {

        if ( !on ) return;

        flight.value = 0;
        flight.value = withDelay(index * 14, withTiming(1, { duration: theme.beat.rest * 1.3, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.System }));

    }, [ on, index, flight, theme.beat.rest ]);

    const skin = useAnimatedStyle(() => {

        const at = flight.value;

        return {
            opacity: at === 0 ? 0 : 1 - at * at,
            transform: [
                { translateX: Math.cos(angle) * speed * at },
                { translateY: Math.sin(angle) * speed * at + reach * 0.8 * at * at },
                { rotate: `${ spin * at }deg` },
            ],
        };

    });

    return (
        <Animated.View
            style={[ {
                position: "absolute",
                width: size,
                height: round ? size : size * 1.7,
                borderRadius: round ? size / 2 : theme.stroke.base,
                backgroundColor: paint,
            }, skin ]}
        />
    );

}

export function Confetti ({ on, reach, pieces = 18 }: ConfettiProps) {

    const theme = useTheme();
    const palette = [ theme.tone.brand.base, theme.tone.accent.base, theme.star, theme.tone.success.base, theme.tone.brand.bright ];

    return (
        <View pointerEvents="none" style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
            {Array.from({ length: pieces }, ( _, index ) => `piece-${ index }` ).map(( key, index ) => (
                <Piece key={key} index={index} on={on} reach={reach} paint={palette[index % palette.length] ?? theme.tone.brand.base} />
            ))}
        </View>
    );

}
