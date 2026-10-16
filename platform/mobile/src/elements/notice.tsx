import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Palette } from "@/styles/theme";

type Props = {
    tone: "missing" | "failed";
    message: string;
    action?: string | undefined;
    onAction?: (() => void) | undefined;
    palette: Palette;
};

const styles = StyleSheet.create({
    notice: { padding: 24, alignItems: "center", gap: 12 },
    message: { fontSize: 16, textAlign: "center" },
    action: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
});

export default function Notice ({ tone, message, action, onAction, palette }: Props) {

    return (

        <View style={styles.notice} accessibilityRole={tone === "failed" ? "alert" : "text"}>

            <Text style={[styles.message, { color: palette.ink }]}>{message}</Text>

            {action && onAction ? (

                <Pressable onPress={onAction} style={[styles.action, { backgroundColor: palette.primary }]} accessibilityRole="button">

                    <Text style={{ color: palette.panel }}>{action}</Text>

                </Pressable>

            ) : null}

        </View>

    );

}
