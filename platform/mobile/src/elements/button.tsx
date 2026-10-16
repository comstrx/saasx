import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFont } from "@/styles/font";
import { usePalette } from "@/styles/palette";

type Props = {
    label: string;
    name?: string | undefined;
    tone?: "primary" | "ghost" | "danger" | undefined;
    busy?: boolean | undefined;
    disabled?: boolean | undefined;
    icon?: ReactNode | undefined;
    onPress: () => void;
};

const styles = StyleSheet.create({
    button: {
        minHeight: 44,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    inner: { flexDirection: "row", alignItems: "center", gap: 8 },
    label: { fontSize: 15, fontWeight: "600" },
    pressed: { opacity: 0.8 },
    off: { opacity: 0.6 },
});

export default function Button ({ label, name, tone = "primary", busy = false, disabled = false, icon, onPress }: Props) {

    const palette = usePalette();
    const font = useFont();
    const fill = tone === "danger" ? palette.danger : tone === "primary" ? palette.primary : "transparent";
    const ink = tone === "ghost" ? palette.primary : palette.panel;
    const off = disabled || busy;

    return (

        <Pressable
            testID={name}
            accessibilityRole="button"
            accessibilityState={{ disabled: off, busy }}
            disabled={off}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: fill, borderColor: tone === "ghost" ? palette.primary : fill },
                pressed && styles.pressed,
                off && styles.off,
            ]}
        >

            {busy ? <ActivityIndicator color={ink} /> : (

                <View style={styles.inner}>

                    {icon}

                    <Text style={[font, styles.label, { color: ink }]}>{label}</Text>

                </View>

            )}

        </Pressable>

    );

}
