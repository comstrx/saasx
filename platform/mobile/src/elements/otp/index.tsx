import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";
import { useEase } from "@/elements/motion";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { str } from "@/std/str";
import { above } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type OtpProps = {
    value: string;
    onChange: ( next: string ) => void;
    length?: number | undefined;
    error?: boolean | undefined;
    label?: string | undefined;
    autoFocus?: boolean | undefined;
    onFilled?: (( code: string ) => void) | undefined;
};

function Cell ({ digit, live, error }: { digit: string; live: boolean; error: boolean }) {

    const theme = useTheme();
    const seat = theme.plane[above(useSurface(), theme.name === "dark")];
    const fade = useEase([ "backgroundColor", "borderColor", "transform" ]);

    return (
        <Animated.View
            style={{
                flex: 1,
                aspectRatio: 1,
                maxWidth: theme.composition.otp.cell,
                borderRadius: theme.radius.pill,
                borderWidth: theme.stroke.base,
                alignItems: "center",
                justifyContent: "center",
                borderColor: error ? theme.tone.danger.base : live ? theme.tone.brand.base : theme.line.strong,
                backgroundColor: live ? theme.plane.base : seat,
                transform: [ { scale: digit ? 1 + theme.swell.pulse : 1 } ],
                ...fade,
            }}
        >
            <Text rank="otp" ltr figures>{digit}</Text>
        </Animated.View>
    );

}

export function Otp ({ value, onChange, length = 5, error = false, label, autoFocus = false, onFilled }: OtpProps) {

    const theme = useTheme();
    const box = useRef<TextInput>(null);
    const [ lit, setLit ] = useState(false);

    const seats = useMemo(() => Array.from({ length }, ( _, seat ) => `cell-${ seat }` ), [ length ]);

    useEffect(() => {

        if ( !autoFocus ) return;

        const settle = setTimeout(() => box.current?.focus(), theme.beat.calm);

        return () => clearTimeout(settle);

    }, [ autoFocus, theme.beat.calm ]);

    const take = ( next: string ) => {

        const clean = str.digits(next).replace(/\D/g, "").slice(0, length);

        onChange(clean);

        if ( clean.length === length ) onFilled?.(clean);

    };

    return (
        <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => box.current?.focus()}>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: theme.space["3"], direction: "ltr" }}>
                {seats.map(( key, seat ) => (
                    <Cell
                        key={key}
                        digit={value[seat] ?? ""}
                        live={lit && ( seat === value.length || ( seat === length - 1 && value.length === length ) )}
                        error={error}
                    />
                ))}
            </View>

            <TextInput
                ref={box}
                value={value}
                onChangeText={take}
                onFocus={() => setLit(true) }
                onBlur={() => setLit(false) }
                keyboardType="number-pad"
                maxLength={length}
                autoComplete="sms-otp"
                style={{ position: "absolute", inset: 0, opacity: 0 }}
            />
        </Pressable>
    );

}
