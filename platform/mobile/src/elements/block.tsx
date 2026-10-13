import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { BlockOptions } from "@/lib/spec/surface";
import { type Palette, step } from "@/styles/theme";

type Entry = { id: string; node: ReactNode };
type Props = BlockOptions & { entries: readonly Entry[]; palette: Palette };

const radii = { none: 0, sm: 8, md: 12, lg: 16, xl: 24 } as const;
const widths = { full: undefined, boxed: 720, narrow: 420 } as const;
const styles = StyleSheet.create({
    block: { width: "100%", alignSelf: "center" },
    flow: { flexDirection: "row", flexWrap: "wrap" },
    cell: { minWidth: 0 },
});

function tone ( palette: Palette, value: BlockOptions["tone"] ): { backgroundColor?: string | undefined; borderColor?: string | undefined; borderWidth?: number | undefined } {

    if ( value === "surface" ) return { backgroundColor: palette.panel, borderColor: palette.line, borderWidth: 1 };
    if ( value === "inverse" ) return { backgroundColor: palette.ink };
    if ( value === "primary" ) return { backgroundColor: palette.panel, borderColor: palette.primary, borderWidth: 1 };

    return {};

}
export default function Block ({ entries, grid, gap, padding, align, width, height, tone: look, radius, palette }: Props) {

    const spacing = step(gap);

    return (

        <View style={[styles.block, { maxWidth: widths[width], minHeight: height === "screen" ? "100%" : undefined, padding: step(padding), borderRadius: radii[radius] }, tone(palette, look)]}>

            <View style={[styles.flow, { gap: spacing, alignItems: align === "stretch" ? "stretch" : `flex-${align === "center" ? "center" : align}` as "flex-start" | "flex-end" | "center" }]}>

                {entries.map(( entry ) => (

                    <View key={entry.id} style={[styles.cell, { flexBasis: `${100 / grid}%`, flexGrow: 1 }]}>{entry.node}</View>

                ))}

            </View>

        </View>

    );

}
