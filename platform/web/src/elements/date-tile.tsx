import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof tile> & { month: string; day: string; weekday?: string; label: string };

const tile = tv({
    slots: {
        frame: "date-tile ceramic",
        month: "date-tile-month",
        day: "font-latin font-semibold tabular-nums text-ink",
        weekday: "text-muted",
    },
    variants: {
        size: {
            small: { frame: "w-14", day: "text-h3", weekday: "text-micro" },
            large: { frame: "w-20", day: "text-h1", weekday: "text-label" },
        },
    },
    defaultVariants: { size: "small" },
});

export default function DateTile ({ month, day, weekday, label, size }: Props) {

    const styles = tile({ size });

    return (

        <span className={styles.frame()} role="img" aria-label={label}>

            <span aria-hidden="true" className={styles.month()}>{month}</span>

            <span aria-hidden="true" className={styles.day()}>{day}</span>

            {weekday ? <span aria-hidden="true" className={styles.weekday()}>{weekday}</span> : null}

        </span>

    );

}
