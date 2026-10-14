import type { EmojiContext, EmojiSprite } from "@engine/world";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, I18nManager, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useDeviceFact } from "@/hooks/use-device";
import { type EmojiSource, emoji, emojiSource } from "@/lib/spec/emoji";
import { usePalette } from "@/styles/palette";

type Props = { glyph: string; context?: EmojiContext | undefined; active?: boolean | undefined; size?: "sm" | "md" | "lg" | "xl" | undefined; label?: string | undefined; selected?: boolean | undefined; onPress?: (( glyph: string ) => void) | undefined };

const sizes = { sm: 20, md: 28, lg: 48, xl: 112 } as const;
const mirrored = I18nManager.isRTL && I18nManager.doLeftAndRightSwapInRTL;
const styles = StyleSheet.create({ text: { textAlign: "center" }, clip: { overflow: "hidden" }, sheet: { position: "absolute", left: 0, top: 0 }, key: { padding: 6, borderRadius: 10, borderWidth: 2, borderColor: "transparent" }, pressed: { opacity: 0.6 } });

function steps ( frames: number, place: ( frame: number ) => number ) {

    const frame = Array.from({ length: frames }, ( _, index ) => index);

    return { inputRange: frame.flatMap(( index ) => [index, index + 0.999]), outputRange: frame.flatMap(( index ) => [place(index), place(index)]) };

}
function Motion ({ sprite, source, side, label }: { sprite: EmojiSprite; source: EmojiSource; side: number; label: string }) {

    const progress = useRef(new Animated.Value(0)).current;
    const x = progress.interpolate(steps(sprite.frames, ( frame ) => (mirrored ? sprite.columns - 1 - (frame % sprite.columns) : -(frame % sprite.columns)) * side));
    const y = progress.interpolate(steps(sprite.frames, ( frame ) => -Math.floor(frame / sprite.columns) * side));
    const play = useCallback(() => {

        const run = Animated.timing(progress, { toValue: sprite.frames - 0.001, duration: sprite.ms, easing: Easing.linear, useNativeDriver: true });

        progress.setValue(0);
        run.start();

        return run;

    }, [progress, sprite.frames, sprite.ms]);

    useEffect(() => {

        const run = play();

        return () => run.stop();

    }, [play]);

    return (

        <Pressable accessibilityRole="image" accessibilityLabel={label} onPress={() => play()} style={[styles.clip, { width: side, height: side }]}>

            <Animated.Image source={source} fadeDuration={0} style={[styles.sheet, { width: side * sprite.columns, height: side * sprite.rows, transform: [{ translateX: x }, { translateY: y }] }]} />

        </Pressable>

    );

}
function Still ({ shown, source, side, label, onBroken }: { shown: string; source: EmojiSource | undefined; side: number; label: string; onBroken: () => void }) {

    if ( source !== undefined ) return <Image source={source} fadeDuration={0} onError={onBroken} accessibilityLabel={label} style={{ width: side, height: side }} />;

    return <View style={{ width: side, height: side }}><Text style={[styles.text, { fontSize: side * 0.8, lineHeight: side }]} accessibilityLabel={label}>{shown}</Text></View>;

}
function Emoji ({ glyph, context = "standalone", active = false, size = "md", label, selected, onPress }: Props) {

    const reducedMotion = useDeviceFact("reducedMotion");
    const shown = emoji.display(glyph, { context, active, reducedMotion });
    const [broken, setBroken] = useState(false);
    const palette = usePalette();
    const named = label ?? emoji.get(glyph)?.name.en ?? glyph;
    const side = sizes[size];
    const sheet = shown.kind === "animated" ? emojiSource(shown.sprite.src) : undefined;
    const still = shown.kind === "static" ? emojiSource(shown.src) : shown.kind === "animated" && shown.still ? emojiSource(shown.still) : undefined;

    if ( !broken && shown.kind === "animated" && sheet !== undefined ) return <Motion sprite={shown.sprite} source={sheet} side={side} label={named} />;

    const face = <Still shown={shown.glyph} source={broken ? undefined : still} side={side} label={named} onBroken={() => setBroken(true)} />;

    if ( !onPress ) return face;

    return (

        <Pressable
            accessibilityRole={selected === undefined ? "button" : "radio"}
            accessibilityLabel={named}
            accessibilityState={selected === undefined ? undefined : { selected }}
            onPress={() => onPress(glyph)}
            style={({ pressed }) => [styles.key, selected && { borderColor: palette.primary, backgroundColor: `${palette.primary}24` }, pressed && styles.pressed]}
        >

            {face}

        </Pressable>

    );

}

export default memo(Emoji);
