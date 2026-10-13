import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Entry = { key: string; node: ReactNode };
type Props = { columns: number; entries: readonly Entry[] };

const styles = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, cell: { minWidth: 0 } });

export default function Grid ({ columns, entries }: Props) {
    const width = `${Math.floor(100 / Math.max(1, columns)) - 2}%` as const;

    return (

        <View style={styles.grid} accessibilityRole="list">

            {entries.map(( entry ) => <View key={entry.key} style={[styles.cell, { width }]}>{entry.node}</View>)}

        </View>

    );
}
