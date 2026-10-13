import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { usePalette } from "@/styles/palette";

type Props = { label: string; error?: string | undefined; children: ReactNode };

const styles = StyleSheet.create({ field: { gap: 4 }, label: { fontSize: 13 }, error: { fontSize: 13 } });

export default function Field ({ label, error, children }: Props) {
    const palette = usePalette();

    return (

        <View style={styles.field}>

            <Text style={[styles.label, { color: palette.muted }]}>{label}</Text>

            {children}

            {error ? <Text accessibilityRole="alert" style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}

        </View>

    );
}
