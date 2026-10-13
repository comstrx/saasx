import type { Context } from "@engine/emoji";
import { Image } from "expo-image";
import { StyleSheet, Text } from "react-native";
import { useDeviceFact } from "@/hooks/use-device";
import { emoji, emojiSource } from "@/lib/spec/emoji";

type Props = { glyph: string; context?: Context | undefined; active?: boolean | undefined; size?: "sm" | "md" | "lg" | undefined };

const sizes = { sm: 20, md: 28, lg: 48 } as const;
const styles = StyleSheet.create({ text: { lineHeight: 0, textAlign: "center" } });

export default function Emoji ({ glyph, context = "standalone", active = false, size = "md" }: Props) {

    const reducedMotion = useDeviceFact("reducedMotion");
    const shown = emoji.display(glyph, { context, active, reducedMotion });
    const source = shown.kind === "glyph" ? undefined : emojiSource(shown.src);
    const label = emoji.get(glyph)?.name.en ?? glyph;
    const side = sizes[size];

    if ( source === undefined ) return <Text style={[styles.text, { fontSize: side * 0.85, lineHeight: side }]} accessibilityLabel={label}>{shown.glyph}</Text>;

    return <Image source={source} accessibilityLabel={label} style={{ width: side, height: side }} contentFit="contain" autoplay={shown.kind === "animated"} />;

}
