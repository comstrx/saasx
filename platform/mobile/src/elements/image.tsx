import { Image as Native, StyleSheet, View } from "react-native";
import { usePalette } from "@/styles/palette";

type Props = { src: string | null | undefined; alt: string; ratio?: "square" | "wide" | undefined };

const styles = StyleSheet.create({ frame: { width: "100%", borderRadius: 8, overflow: "hidden" }, wide: { aspectRatio: 1.6 }, square: { aspectRatio: 1 }, image: { width: "100%", height: "100%" } });

export default function Image ({ src, alt, ratio = "wide" }: Props) {

    const palette = usePalette();

    return (

        <View style={[styles.frame, ratio === "square" ? styles.square : styles.wide, { backgroundColor: palette.line }]}>

            {src ? <Native source={{ uri: src }} accessibilityLabel={alt} style={styles.image} resizeMode="cover" /> : null}

        </View>

    );

}
