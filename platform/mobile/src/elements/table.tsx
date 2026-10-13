import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePalette } from "@/styles/palette";

export type Column = { key: string; label: string; align?: "start" | "end" | undefined; width?: number | undefined };
export type Row = { key: string; cells: Record<string, ReactNode> };
type Props = { columns: readonly Column[]; rows: readonly Row[]; selected?: string | undefined; onSelect?: (( key: string ) => void) | undefined };

const styles = StyleSheet.create({
    table: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
    row: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
    pressed: { opacity: 0.7 },
    selected: { borderStartWidth: 3 },
    cell: { paddingHorizontal: 12, paddingVertical: 10, justifyContent: "center" },
    head: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
    text: { fontSize: 14 },
    end: { alignItems: "flex-end" },
});

export default function Table ({ columns, rows, selected, onSelect }: Props) {

    const palette = usePalette();
    const width = ( column: Column ): number => column.width ?? 140;

    return (

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

            <View style={[styles.table, { borderColor: palette.line, backgroundColor: palette.panel }]}>

                <View style={[styles.row, { borderBottomColor: palette.line }]}>

                    {columns.map(( column ) => (

                        <View key={column.key} style={[styles.cell, { width: width(column) }, column.align === "end" && styles.end]}>

                            <Text style={[styles.head, { color: palette.muted }]}>{column.label}</Text>

                        </View>

                    ))}

                </View>

                {rows.map(( row ) => {

                    const chosen = row.key === selected;
                    const cells = columns.map(( column ) => (

                        <View key={column.key} style={[styles.cell, { width: width(column) }, column.align === "end" && styles.end]}>

                            {typeof row.cells[column.key] === "string" ? <Text style={[styles.text, { color: palette.ink }]}>{row.cells[column.key]}</Text> : row.cells[column.key]}

                        </View>

                    ));

                    if ( !onSelect ) return <View key={row.key} style={[styles.row, { borderBottomColor: palette.line }]} testID="row">{cells}</View>;

                    return (

                        <Pressable
                            key={row.key}
                            testID="row"
                            accessibilityRole="button"
                            accessibilityState={{ selected: chosen }}
                            onPress={() => onSelect(row.key)}
                            style={( { pressed } ) => [styles.row, { borderBottomColor: palette.line }, chosen && [styles.selected, { borderStartColor: palette.primary, backgroundColor: palette.body }], pressed && styles.pressed]}
                        >

                            {cells}

                        </Pressable>

                    );

                })}

            </View>

        </ScrollView>

    );

}
