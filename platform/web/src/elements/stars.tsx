import type { CSSProperties } from "react";
import { Star } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof stars> & { value: number; label: string; total?: number };

const stars = tv({
    slots: {
        frame: "inline-flex shrink-0 items-center gap-0.5",
        star: "relative inline-grid shrink-0 [&>svg]:col-start-1 [&>svg]:row-start-1",
        empty: "text-strong",
        full: "text-star",
        partial: [
            "text-star ltr:[clip-path:inset(0_calc(100%-var(--fill))_0_0)]",
            "rtl:[clip-path:inset(0_0_0_calc(100%-var(--fill)))]",
        ],
    },
    variants: {
        size: {
            small: { star: "[&>svg]:size-3.5" },
            medium: { star: "[&>svg]:size-4" },
            large: { star: "[&>svg]:size-5" },
        },
        tone: { ink: {}, gold: { full: "text-rating", partial: "text-rating" } },
    },
    defaultVariants: { size: "medium", tone: "ink" },
});

export default function Stars ({ value, label, total = 5, size, tone }: Props) {

    const styles = stars({ size, tone });

    return (

        <span role="img" aria-label={label} className={styles.frame()}>

            {Array.from({ length: total }, ( _, index ) => `star-${index + 1}`).map(( key, index ) => {

                const fill = Math.max(0, Math.min(1, value - index));

                return (

                    <span key={key} aria-hidden="true" className={styles.star()}>

                        <Star weight="fill" className={styles.empty()} />

                        {fill >= 1 ? <Star weight="fill" className={styles.full()} /> : fill > 0 ? (

                            <Star
                                weight="fill"
                                className={styles.partial()}
                                style={{ "--fill": `${Math.round(fill * 100)}%` } as CSSProperties}
                            />

                        ) : null}

                    </span>

                );

            })}

        </span>

    );

}
