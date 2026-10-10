import type { ReactNode } from "react";
import { tv } from "@/lib/providers/variants";
import type { BlockOptions } from "@/lib/spec/screens";

type Entry = { id: string; node: ReactNode };
type Props = BlockOptions & { entries: readonly Entry[] };

const block = tv({
    base: "min-w-0",
    variants: {
        width: {
            auto: "w-auto",
            full: "w-full",
            half: "w-full md:w-1/2",
            third: "w-full md:w-1/3",
            "two-thirds": "w-full md:w-2/3",
            quarter: "w-full md:w-1/4",
            narrow: "mx-auto w-full max-w-md",
            wide: "boxed",
        },
        height: { auto: "", screen: "min-h-dvh" },
        padding: { 0: "p-0", 1: "p-1", 2: "p-2", 3: "p-3", 4: "p-4", 6: "p-5 md:p-6", 8: "p-6 md:p-8", 12: "p-6 md:p-12" },
        tone: {
            default: "",
            surface: "border border-edge bg-panel",
            primary: "border border-accent bg-panel",
            inverse: "bg-ink text-body",
        },
        radius: { none: "rounded-none", sm: "rounded-lg", md: "rounded-2xl", lg: "rounded-3xl", xl: "rounded-4xl" },
        shadow: { none: "shadow-none", sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg" },
    },
});
const columns = {
    base: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" },
    sm: { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6" },
    md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6" },
    lg: { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" },
    xl: { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "xl:grid-cols-6" },
};
const flow = tv({
    base: "min-w-0",
    variants: {
        mode: { row: "flex flex-col lg:flex-row", grid: "grid" },
        gap: { 0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4", 6: "gap-6", 8: "gap-8 md:gap-10", 12: "gap-10 md:gap-14" },
        align: { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" },
        ...columns,
    },
});
const cell = tv({ base: "min-w-0" });

function columnsOf ( grid: BlockOptions["grid"] ) {

    return typeof grid === "number" ? { base: grid } : grid;

}
export default function Block ({ entries, grid, sizes, gap, align, ...look }: Props) {

    const sized = sizes.length > 0;
    const width = ( index: number ) => (sized ? { flexGrow: sizes[index] ?? 1, flexBasis: 0 } : undefined);

    return (

        <div className={block(look)}>

            <div className={flow({ mode: sized ? "row" : "grid", gap, align, ...(sized ? {} : columnsOf(grid)) })}>

                {entries.map(( entry, index ) => (

                    <div key={entry.id} className={cell()} style={width(index)}>{entry.node}</div>

                ))}

            </div>

        </div>

    );

}
