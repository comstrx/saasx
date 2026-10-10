import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof amount> & {
    number: string;
    currency: string;
    before: boolean;
    glyph: boolean;
    currencyLabel: string;
};

const amount = tv({
    slots: {
        frame: "inline-flex items-baseline gap-1 whitespace-nowrap font-latin tabular-nums",
        sign: "",
    },
    variants: {
        size: {
            micro: { frame: "text-label", sign: "text-micro" },
            small: { frame: "text-small", sign: "text-label" },
            base: { frame: "text-base", sign: "text-small" },
            title: { frame: "text-title", sign: "text-small" },
            large: { frame: "text-h3", sign: "text-base" },
            hero: { frame: "text-h2", sign: "text-title" },
            display: { frame: "text-display tracking-tight", sign: "text-title font-semibold" },
        },
        strike: {
            true: { frame: "font-normal text-muted line-through decoration-muted" },
            false: { frame: "font-bold text-ink" },
        },
        tone: { ink: {}, offer: { frame: "text-offer" }, success: { frame: "text-success" }, inherit: { frame: "text-inherit" } },
    },
    defaultVariants: { size: "base", strike: false, tone: "ink" },
});

export default function Amount ({ number, currency, before, glyph, currencyLabel, size, strike, tone }: Props) {

    const styles = amount({ size, strike, tone });
    const sign = glyph
        ? <span role="img" aria-label={currencyLabel} className="glyph-sar" />
        : <span className={styles.sign()}>{currency}</span>;

    return (

        <span className={styles.frame()}>

            {before ? sign : null}

            <bdi dir="ltr">{number}</bdi>

            {before ? null : sign}

        </span>

    );

}
