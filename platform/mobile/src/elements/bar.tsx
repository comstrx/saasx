import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { usePalette } from "@/styles/palette";

type Props = { brand: ReactNode; actions: ReactNode };

const styles = StyleSheet.create({ bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 } });

export default function Bar ({ brand, actions }: Props) {

    const palette = usePalette();

    return (

        <View style={[styles.bar, { backgroundColor: palette.panel, borderBottomColor: palette.line }]} accessibilityRole="header">

            <View>{brand}</View>

            <View>{actions}</View>

        </View>

    );

}
