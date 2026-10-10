import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof progress> & { value?: number; label: string };

const progress = tv({
    slots: { track: "progress-track w-full", fill: "progress-fill" },
    variants: {
        size: { thin: { track: "h-1" }, medium: {}, thick: { track: "h-2.5" } },
    },
    defaultVariants: { size: "medium" },
});

export default function Progress ({ value, label, size }: Props) {

    const styles = progress({ size });
    const known = typeof value === "number";
    const percent = known ? Math.max(0, Math.min(100, value)) : 0;

    return (

        <span
            role="progressbar"
            aria-label={label}
            aria-valuemin={known ? 0 : undefined}
            aria-valuemax={known ? 100 : undefined}
            aria-valuenow={known ? percent : undefined}
            className={styles.track()}
        >

            <span
                className={known ? styles.fill() : `${styles.fill()} progress-indeterminate`}
                style={known ? { inlineSize: `${percent}%` } : undefined}
            />

        </span>

    );

}
