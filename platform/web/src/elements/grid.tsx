import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof grid> & { children: ReactNode; label?: string; as?: "ul" | "div" | "ol" | "dl" };

const grid = tv({
    base: "grid min-w-0",
    variants: {
        columns: {
            1: "sm:grid-cols-1",
            2: "sm:grid-cols-2",
            3: "sm:grid-cols-2 lg:grid-cols-3",
            4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            5: "sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
            6: "sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
            auto: "grid-cards",
            tiles: "grid-tiles",
            mosaic: "grid-mosaic",
            stats: "grid-stats",
            pairs: "lg:grid-cols-2",
        },
        mobileColumns: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" },
        gap: { 2: "gap-2", 3: "gap-3", 4: "gap-4", 5: "gap-x-5 gap-y-7", 6: "gap-6", 8: "gap-x-6 gap-y-10" },
        align: { start: "items-start", end: "items-end", stretch: "items-stretch", center: "items-center" },
    },
    defaultVariants: { columns: 4, gap: 5 },
});

export default function Grid ({ columns = 4, mobileColumns, gap, align, as: Tag = "ul", children, label }: Props) {

    const phone = typeof columns === "number" ? mobileColumns ?? 1 : undefined;

    return <Tag className={grid({ columns, mobileColumns: phone, gap, align })} aria-label={label}>{children}</Tag>;

}
