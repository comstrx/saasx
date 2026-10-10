import { useMemo, useRef, useState } from "react";
import { type GestureResponderEvent, I18nManager, type LayoutChangeEvent, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { clamp } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

type RangeProps = {
    minimum: number;
    maximum: number;
    low: number;
    high: number;
    histogram?: readonly number[] | undefined;
    onChange: ( low: number, high: number ) => void;
};

type Thumb = "low" | "high";

export function Range ({ minimum, maximum, low, high, histogram = [], onChange }: RangeProps) {

    const theme = useTheme();
    const [ width, setWidth ] = useState(0);
    const thumb = useRef<Thumb>("low");

    const span = Math.max(1, maximum - minimum);
    const lowAt = clamp(( low - minimum ) / span, 0, 1);
    const highAt = clamp(( high - minimum ) / span, 0, 1);
    const lowX = width * lowAt;
    const highX = width * highAt;
    const peak = histogram.reduce(( top, value ) => Math.max(top, value), 1);

    const slots = useMemo(
        () => histogram.map(( count, slot ) => ({
            id: `slot-${ slot }`,
            count,
            at: slot / Math.max(1, histogram.length - 1),
        })),
        [ histogram ],
    );

    const position = ( event: GestureResponderEvent ) =>
        clamp(I18nManager.isRTL ? width - event.nativeEvent.locationX : event.nativeEvent.locationX, 0, width);

    const valueAt = ( x: number ) =>
        Math.round(( minimum + x / Math.max(1, width) * span ) / 5) * 5;

    const move = ( event: GestureResponderEvent ) => {

        if ( width <= 0 ) return;

        const value = valueAt(position(event));

        if ( thumb.current === "low" ) onChange(clamp(value, minimum, high), high);
        else onChange(low, clamp(value, low, maximum));

    };

    const begin = ( event: GestureResponderEvent ) => {

        const x = position(event);

        thumb.current = Math.abs(x - lowX) <= Math.abs(x - highX) ? "low" : "high";
        move(event);

    };

    const measure = ( event: LayoutChangeEvent ) => setWidth(event.nativeEvent.layout.width);

    return (
        <View
            style={styles.range(slots.length > 0)}
            onLayout={measure}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={begin}
            onResponderMove={move}
            accessibilityRole="adjustable"
            accessibilityValue={{ min: minimum, max: maximum, now: high }}
        >
            {slots.length > 0 ? (
                <View style={styles.histogram} pointerEvents="none">
                    {slots.map(( slot ) => (
                        <View
                            key={slot.id}
                            style={[
                                styles.bar,
                                styles.barHeight(Math.max(theme.space["1"], Math.round(74 * slot.count / peak))),
                                slot.at >= lowAt && slot.at <= highAt ? styles.barActive : null,
                            ]}
                        />
                    ))}
                </View>
            ) : null}

            <View style={styles.track} pointerEvents="none" />
            <View style={[ styles.active, styles.activeAt(lowAt, Math.max(0, highAt - lowAt)) ]} pointerEvents="none" />
            <View style={[ styles.thumb, styles.thumbAt(lowAt) ]} pointerEvents="none" />
            <View style={[ styles.thumb, styles.thumbAt(highAt) ]} pointerEvents="none" />
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    range: ( tall: boolean ) => ({
        height: tall ? 104 : theme.icon.lg + theme.space["4"] * 2,
        justifyContent: "flex-end" as const,
        paddingBottom: theme.space["4"],
    }),
    histogram: {
        height: theme.art.sm + theme.space["3"],
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 2,
    },
    bar: {
        flex: 1,
        minWidth: 2,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        backgroundColor: theme.line.strong,
    },
    barHeight: ( height: number ) => ({ height }),
    barActive: {
        backgroundColor: theme.tone.brand.line,
    },
    track: {
        position: "absolute",
        insetInlineStart: 0,
        insetInlineEnd: 0,
        bottom: theme.space["4"] + 8,
        height: theme.stroke.rail,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.line.strong,
    },
    active: {
        position: "absolute",
        bottom: theme.space["4"] + 8,
        height: theme.stroke.rail,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.base,
    },
    activeAt: ( start: number, width: number ) => ({ insetInlineStart: `${ start * 100 }%`, width: `${ width * 100 }%` }),
    thumb: {
        position: "absolute",
        bottom: theme.space["4"],
        width: theme.icon.lg,
        height: theme.icon.lg,
        marginStart: -theme.icon.lg / 2,
        borderRadius: theme.radius.pill,
        borderWidth: theme.stroke.base,
        borderColor: theme.material.lit,
        backgroundColor: theme.tone.brand.base,
    },
    thumbAt: ( start: number ) => ({ insetInlineStart: `${ start * 100 }%` }),

}));
