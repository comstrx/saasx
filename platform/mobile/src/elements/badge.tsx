import { StyleSheet, Text, View } from "react-native";
import { useFont } from "@/styles/font";
import { usePalette } from "@/styles/palette";

type Props = { label: string };

const styles = StyleSheet.create({
    badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
    label: { fontSize: 11, textTransform: "uppercase" },
});

export default function Badge ({ label }: Props) {

    const palette = usePalette();
    const font = useFont();

    return (

        <View style={[styles.badge, { backgroundColor: palette.line }]}>

            <Text style={[font, styles.label, { color: palette.ink }]}>{label}</Text>

        </View>

    );

}
