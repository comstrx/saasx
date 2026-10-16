import type { ReactNode } from "react";
import { type FlexStyle, StyleSheet, View } from "react-native";
import type { BlockOptions } from "@/lib/spec/surface";
import { type Palette, step } from "@/styles/theme";

type Entry = { id: string; node: ReactNode };
type Props = BlockOptions & { entries: readonly Entry[]; palette: Palette };

const radii = { none: 0, sm: 8, md: 12, lg: 16, xl: 24 } as const;
const widths = { full: undefined, boxed: 720, narrow: 420 } as const;
const alignments = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
} as const satisfies Record<BlockOptions["align"], FlexStyle["alignItems"]>;
const styles = StyleSheet.create({
    block: { width: "100%", alignSelf: "center" },
    flow: { flexDirection: "row", flexWrap: "wrap" },
    cell: { minWidth: 0 },
    fill: { flex: 1, alignContent: "stretch" },
});

function tone (
    palette: Palette,
    value: BlockOptions["tone"],
): { backgroundColor?: string | undefined; borderColor?: string | undefined; borderWidth?: number | undefined } {

    if ( value === "surface" ) return { backgroundColor: palette.panel, borderColor: palette.line, borderWidth: 1 };
    if ( value === "inverse" ) return { backgroundColor: palette.ink };
    if ( value === "primary" ) return { backgroundColor: palette.panel, borderColor: palette.primary, borderWidth: 1 };

    return {};

}
export default function Block ({ entries, grid, gap, padding, align, width, height, tone: look, radius, palette }: Props) {

    const spacing = step(gap);
    const filled = height === "screen" && styles.fill;
    const box = { maxWidth: widths[width], padding: step(padding), borderRadius: radii[radius] };

    return (

        <View style={[styles.block, box, filled, tone(palette, look)]}>

            <View style={[styles.flow, filled, { gap: spacing, alignItems: alignments[align] }]}>

                {entries.map(( entry ) => (

                    <View key={entry.id} style={[styles.cell, { flexBasis: `${100 / grid}%`, flexGrow: 1 }]}>{entry.node}</View>

                ))}

            </View>

        </View>

    );

}
