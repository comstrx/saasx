import { iconGlyph } from "@engine/world";
import { StyleSheet, Text, View } from "react-native";
import { usePalette } from "@/styles/palette";

export type Scene = "empty" | "failed" | "offline" | "denied" | "done";
type Props = { scene: Scene; label?: string | undefined };

const styles = StyleSheet.create({
    frame: { alignItems: "center", paddingVertical: 8 },
    disc: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
    glyph: { fontFamily: "lucide", fontSize: 48, lineHeight: 48, includeFontPadding: false },
});

export default function Illustration ({ scene, label }: Props) {

    const palette = usePalette();
    const color = (scene === "failed" || scene === "denied" ? palette.danger : scene === "done" ? palette.success : palette.primary) ?? palette.ink;

    return (

        <View style={styles.frame} accessibilityLabel={label} accessibilityElementsHidden={!label}>

            <View style={[styles.disc, { backgroundColor: `${color}1f` }]}>

                <Text style={[styles.glyph, { color }]}>{iconGlyph(scene)}</Text>

            </View>

        </View>

    );

}
