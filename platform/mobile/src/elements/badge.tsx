import { StyleSheet, Text, View } from "react-native";
import { usePalette } from "@/styles/palette";

type Props = { label: string };

const styles = StyleSheet.create({ badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }, label: { fontSize: 11, textTransform: "uppercase" } });

export default function Badge ({ label }: Props) {
    const palette = usePalette();

    return (

        <View style={[styles.badge, { backgroundColor: palette.line }]}>

            <Text style={[styles.label, { color: palette.ink }]}>{label}</Text>

        </View>

    );
}
