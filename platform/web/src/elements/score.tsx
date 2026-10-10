import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof score> & { value: string; word?: string; detail?: string; label: string };

const score = tv({
    slots: {
        frame: "inline-flex min-w-0 items-center gap-3",
        badge: "score-badge",
        text: "flex min-w-0 flex-col",
        word: "font-semibold text-ink",
        detail: "text-muted",
    },
    variants: {
        size: {
            small: { badge: "size-9 text-small", word: "text-small", detail: "text-micro" },
            medium: { badge: "size-11 text-base", word: "text-base", detail: "text-label" },
            large: { badge: "size-14 text-h3", word: "text-h3", detail: "text-small" },
        },
        align: { start: {}, end: { frame: "flex-row-reverse text-end" } },
    },
    defaultVariants: { size: "medium", align: "start" },
});

export default function Score ({ value, word, detail, label, size, align }: Props) {

    const styles = score({ size, align });

    return (

        <span className={styles.frame()} role="img" aria-label={label}>

            <span aria-hidden="true" className={styles.badge()}>{value}</span>

            {word || detail ? (

                <span aria-hidden="true" className={styles.text()}>

                    {word ? <span className={styles.word()}>{word}</span> : null}

                    {detail ? <span className={styles.detail()}>{detail}</span> : null}

                </span>

            ) : null}

        </span>

    );

}
