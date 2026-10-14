import { memo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { emoji, emojiSource } from "@/lib/spec/emoji";
import { usePalette } from "@/styles/palette";

type Props = { glyph: string; language?: "en" | "ar" | undefined; size?: "sm" | "md" | "lg" | "xl" | undefined; label?: string | undefined; selected?: boolean | undefined; onPress?: (( glyph: string ) => void) | undefined };

const sizes = { sm: 20, md: 28, lg: 48, xl: 112 } as const;
const styles = StyleSheet.create({ text: { textAlign: "center" }, key: { padding: 6, borderRadius: 10, borderWidth: 2, borderColor: "transparent" }, pressed: { opacity: 0.6 } });

function Emoji ({ glyph, language = "en", size = "md", label, selected, onPress }: Props) {

    const [broken, setBroken] = useState(false);
    const palette = usePalette();
    const source = broken ? undefined : emojiSource(glyph);
    const named = label ?? emoji.get(glyph)?.name[language] ?? glyph;
    const side = sizes[size];
    const face = source !== undefined
        ? <Image source={source} fadeDuration={0} onError={() => setBroken(true)} accessibilityLabel={named} resizeMode="contain" style={{ width: side, height: side }} />
        : <View style={{ width: side, height: side }}><Text style={[styles.text, { fontSize: side * 0.8, lineHeight: side }]} accessibilityLabel={named}>{glyph}</Text></View>;

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
