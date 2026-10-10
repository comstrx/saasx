import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import Animated, { runOnJS, useAnimatedProps, useSharedValue, withSpring } from "react-native-reanimated";
import type { RankName } from "@/theme/text";
import { useScript } from "@/theme/use-script";
import { useTheme } from "@/theme/use-theme";

const Roll = Animated.createAnimatedComponent(TextInput);

Animated.addWhitelistedNativeProps({ text: true });

type CounterProps = {
    value: number;
    rank?: RankName | undefined;
    digits?: number | undefined;
    prefix?: string | undefined;
    suffix?: string | undefined;
    group?: boolean | undefined;
    color?: string | undefined;
};

const grouped = ( written: string ): string => {

    "worklet";

    const [ whole, rest ] = written.split(".");
    const sign = whole?.startsWith("-") ? "-" : "";
    const bare = sign ? ( whole ?? "" ).slice(1) : whole ?? "";

    let out = "";

    for ( let seat = 0; seat < bare.length; seat++ ) {

        if ( seat > 0 && ( bare.length - seat ) % 3 === 0 ) out += ",";

        out += bare[seat];

    }

    return rest ? `${ sign }${ out }.${ rest }` : `${ sign }${ out }`;

};

export function Counter ({ value, rank = "price", digits = 0, prefix = "", suffix = "", group = true, color }: CounterProps) {

    const theme = useTheme();
    const script = useScript();
    const metric = theme.text[rank][script];

    const [ rested, setRested ] = useState(value);
    const held = useSharedValue(value);
    const rolling = rested !== value;

    useEffect(() => {

        held.value = withSpring(value, theme.spring.settle, ( done ) => {

            if ( done ) runOnJS(setRested)(value);

        });

    }, [ value, held, theme.spring.settle ]);

    const write = ( amount: number ): string => {

        "worklet";

        const raw = amount.toFixed(digits);

        return `${ prefix }${ group ? grouped(raw) : raw }${ suffix }`;

    };

    const props = useAnimatedProps(() => {

        const written = write(held.value);

        return { text: written, defaultValue: written } as never;

    });

    const face = {
        padding: 0,
        color: color ?? theme.ink.base,
        fontFamily: theme.fonts[script][metric.weight],
        fontSize: metric.size,
        lineHeight: metric.height,
        letterSpacing: metric.track,
        textAlign: "left",
        includeFontPadding: false,
    } as const;

    return (
        <View>
            <Text style={[ face, { opacity: rolling ? 0 : 1 } ]}>{write(value)}</Text>

            {rolling ? <Roll editable={false} animatedProps={props} style={[ face, { position: "absolute", top: 0, start: 0, end: 0 } ]} /> : null}
        </View>
    );

}
