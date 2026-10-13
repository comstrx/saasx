import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePalette } from "@/styles/palette";

export type Tab = { key: string; label: string; icon?: ReactNode | undefined; current: boolean; onPress: () => void };
type Props = { label: string; tabs: readonly Tab[] };

const styles = StyleSheet.create({
    bar: { flexDirection: "row", borderTopWidth: 1, paddingVertical: 6 },
    tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2, minHeight: 52, borderRadius: 10 },
    label: { fontSize: 12 },
    pressed: { opacity: 0.7 },
});

export default function TabBar ({ label, tabs }: Props) {
    const palette = usePalette();

    return (

        <View accessibilityRole="tablist" accessibilityLabel={label} style={[styles.bar, { borderTopColor: palette.line, backgroundColor: palette.panel }]}>

            {tabs.map(( tab ) => (

                <Pressable key={tab.key} testID={`tab-${tab.key}`} accessibilityRole="tab" accessibilityState={{ selected: tab.current }} onPress={tab.onPress} style={( { pressed } ) => [styles.tab, pressed && styles.pressed]}>

                    {tab.icon}

                    <Text style={[styles.label, { color: tab.current ? palette.primary : palette.muted, fontWeight: tab.current ? "700" : "400" }]}>{tab.label}</Text>

                </Pressable>

            ))}

        </View>

    );
}
