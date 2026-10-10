import { Star } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof rating> & { value: string; count?: string; label: string };

const rating = tv({
    slots: {
        frame: "inline-flex shrink-0 items-center gap-1 font-latin tabular-nums",
        star: "fill-current text-star",
        score: "font-semibold text-ink",
        count: "text-muted",
    },
    variants: {
        size: {
            small: { frame: "text-label", star: "size-3.5" },
            medium: { frame: "text-small", star: "size-4" },
            large: { frame: "text-base", star: "size-5" },
        },
        tone: { ink: {}, gold: { star: "text-rating" } },
    },
    defaultVariants: { size: "medium", tone: "ink" },
});

export default function Rating ({ value, count, label, size, tone }: Props) {

    const styles = rating({ size, tone });

    return (

        <span className={styles.frame()} role="img" aria-label={label}>

            <Star weight="fill" aria-hidden="true" className={styles.star()} />

            <span aria-hidden="true" className={styles.score()}>{value}</span>

            {count ? <span aria-hidden="true" className={styles.count()}>({count})</span> : null}

        </span>

    );

}
