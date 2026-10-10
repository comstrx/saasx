import { useState } from "react";
import { type LayoutChangeEvent, ScrollView, useWindowDimensions, View } from "react-native";
import Animated, { css, cubicBezier, type SharedValue, useAnimatedStyle, useReducedMotion } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import type { IconName } from "@/elements/icon";
import { Media } from "@/elements/media";
import { Press } from "@/elements/press";
import { leadOf } from "@/elements/scroll/lead";
import { Text } from "@/elements/text";
import { isolateLtr } from "@/std/bidi";
import type { Picture } from "@/std/picture";
import { useTheme } from "@/theme/use-theme";

const developing = css.keyframes({
    from: { opacity: 0.4, transform: [ { scale: 1.08 } ] },
    to: { opacity: 1, transform: [ { scale: 1 } ] },
});

const outCubic = cubicBezier(0.33, 1, 0.68, 1);

type GalleryProps = {
    shots: readonly Picture[];
    height: number;
    icon?: IconName | undefined;
    track?: SharedValue<number> | undefined;
    overlap?: number | undefined;
    label?: string | undefined;
    settled?: boolean | undefined;
    onOpen?: (( index: number ) => void) | undefined;
    onReady?: (() => void) | undefined;
};

export function Gallery ({ shots, height, icon, track, overlap = 0, label, settled = false, onOpen, onReady }: GalleryProps) {

    const theme = useTheme();
    const { width } = useWindowDimensions();
    const [ seat, setSeat ] = useState(0);
    const [ span, setSpan ] = useState(width);
    const still = useReducedMotion();

    const float = useAnimatedStyle(() => {

        const shift = track?.value ?? 0;

        return {
            transform: [
                { translateY: shift * 0.5 },
                { scale: shift < 0 ? Math.min(1.35, 1 - shift / height) : 1 },
            ],
        };

    });

    const measure = ( event: LayoutChangeEvent ) => setSpan(Math.round(event.nativeEvent.layout.width) );

    return (
        <View style={styles.stage(height)} onLayout={measure}>
            <Animated.View style={[ styles.float, float ]}>
                <Animated.View
                    style={[ styles.float, settled || still ? null : {
                        animationName: developing,
                        animationDuration: theme.beat.slow * 1.6,
                        animationTimingFunction: outCubic,
                    } ]}
                >
                    {shots.length > 0 ? (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={( event ) => setSeat(Math.round(leadOf(event.nativeEvent) / span) ) }
                        >
                            {shots.map(( shot, index ) => (
                                <Press key={shot.uri} feel="none" onPress={() => onOpen?.(index)} accessibilityRole="button" accessibilityLabel={label}>
                                    <Media source={shot} icon={icon} ratio={null} scrim={false} style={styles.frame(span, height)} onReady={index === 0 ? onReady : undefined} />
                                </Press>
                            ))}
                        </ScrollView>
                    ) : <Media icon={icon} ratio={null} scrim={false} style={styles.frame(span, height)} />}
                </Animated.View>
            </Animated.View>

            {shots.length > 1 ? (
                <Press style={styles.count(overlap)} onPress={() => onOpen?.(seat)} hitSlop={theme.hit.slop} sink="control" accessibilityRole="button" accessibilityLabel={label}>
                    <Text rank="note" tint="on" figures>{isolateLtr(`${ seat + 1 } / ${ shots.length }`)}</Text>
                </Press>
            ) : null}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    stage: ( height: number ) => ({
        height,
        overflow: "hidden",
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "well"],
    }),
    float: {
        ...StyleSheet.absoluteFillObject,
    },
    frame: ( width: number, height: number ) => ({
        width,
        height,
    }),
    count: ( overlap: number ) => ({
        position: "absolute",
        insetInlineEnd: theme.space["4"],
        bottom: overlap + theme.space["4"],
        flexDirection: "row",
        alignItems: "center",
        minHeight: theme.control.sm.height - theme.space["2"],
        paddingHorizontal: theme.space["3"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.photo.chip,
    }),

}));
