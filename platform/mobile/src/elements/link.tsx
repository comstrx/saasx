import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "@/hooks/use-router";
import { usePalette } from "@/styles/palette";

type Props = { href: string; label: string; tone?: "default" | "primary" | "button" | undefined; icon?: ReactNode | undefined };

const styles = StyleSheet.create({ link: { fontSize: 15, paddingVertical: 6 }, primary: { fontWeight: "600" }, pressed: { opacity: 0.7 }, inner: { flexDirection: "row", alignItems: "center", gap: 6 }, button: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 } });

export default function Link ({ href, label, tone = "default", icon }: Props) {

    const palette = usePalette();
    const router = useRouter();
    const color = tone === "primary" ? palette.primary : palette.ink;

    return (

        <Pressable accessibilityRole="link" onPress={() => router.push(href)} style={({ pressed }) => [tone === "button" && [styles.button, { borderColor: palette.line, backgroundColor: palette.panel }], pressed && styles.pressed]}>

            <View style={styles.inner}>{icon}<Text style={[styles.link, tone === "primary" && styles.primary, { color }]}>{label}</Text></View>

        </Pressable>

    );

}
