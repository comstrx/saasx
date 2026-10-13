import { ActivityIndicator, StyleSheet, View } from "react-native";
import { usePalette } from "@/styles/palette";

type Props = { label: string };

const styles = StyleSheet.create({ spinner: { padding: 12, alignItems: "center" } });

export default function Spinner ({ label }: Props) {

    const palette = usePalette();

    return (

        <View style={styles.spinner} accessibilityLabel={label} accessibilityRole="progressbar">

            <ActivityIndicator color={palette.primary} />

        </View>

    );

}
