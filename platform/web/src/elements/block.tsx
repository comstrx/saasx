import type { CSSProperties, ReactNode } from "react";
import type { BlockOptions } from "@/lib/spec/surface";

type Entry = { id: string; node: ReactNode };
type Props = BlockOptions & { entries: readonly Entry[] };

function columns ( grid: BlockOptions["grid"] ): CSSProperties {
    const chosen = typeof grid === "number" ? { base: grid } : grid;
    const variables = Object.entries(chosen).map(( [point, count] ) => [`--grid-${point}`, String(count)]);

    return Object.fromEntries(variables) as CSSProperties;
}
export default function Block ({ entries, grid, sizes, gap, padding, align, width, height, tone, radius, shadow }: Props) {
    const sized = sizes.length > 0;

    return (

        <section
            className="block"
            data-width={width}
            data-height={height}
            data-tone={tone}
            data-radius={radius}
            data-shadow={shadow}
            data-padding={padding}
        >

            <div className="block-flow" data-mode={sized ? "row" : "grid"} data-gap={gap} data-align={align} style={sized ? undefined : columns(grid)}>

                {entries.map(( entry, index ) => (

                    <div key={entry.id} className="block-cell" style={sized ? { flexGrow: sizes[index] ?? 1, flexBasis: 0 } : undefined}>{entry.node}</div>

                ))}

            </div>

        </section>

    );
}
