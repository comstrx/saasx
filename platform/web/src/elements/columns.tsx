import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof columns> & { start: ReactNode; end: ReactNode; label?: string };

const columns = tv({
    slots: {
        frame: "grid min-w-0 gap-6",
        start: "min-w-0",
        end: "min-w-0",
    },
    variants: {
        ratio: {
            "3:1": { frame: "columns-wide" },
            "2:1": { frame: "columns-main" },
            "1:1": { frame: "md:grid-cols-2" },
            "5:7": { frame: "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" },
            "1:2": { frame: "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]" },
        },
        gap: { 4: { frame: "gap-4" }, 6: { frame: "gap-6" }, 8: { frame: "gap-8 lg:gap-10" } },
        sticky: { true: { end: "detail-aside" } },
        align: { start: { frame: "items-start" }, stretch: { frame: "items-stretch" } },
    },
    defaultVariants: { ratio: "2:1", gap: 6, align: "start" },
});

export default function Columns ({ start, end, label, ratio, gap, sticky, align }: Props) {

    const styles = columns({ ratio, gap, sticky, align });

    return (

        <div className={styles.frame()}>

            <div className={styles.start()}>{start}</div>

            {label ? <aside aria-label={label} className={styles.end()}>{end}</aside> : <div className={styles.end()}>{end}</div>}

        </div>

    );

}
