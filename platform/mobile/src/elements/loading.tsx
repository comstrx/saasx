import { ActivityIndicator, StyleSheet, View } from "react-native";
import type { Palette } from "@/styles/theme";

const styles = StyleSheet.create({ loading: { padding: 24, alignItems: "center" } });

export default function Loading ({ palette }: { palette: Palette }) {

    return (

        <View style={styles.loading}>

            <ActivityIndicator color={palette.primary} />

        </View>

    );

}
