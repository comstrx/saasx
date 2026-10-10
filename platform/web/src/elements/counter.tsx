import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof counter> & { value: number; maximum?: number; label?: string };

const counter = tv({
    base: "counter",
    variants: {
        tone: { ember: "counter-ember", teal: "counter-teal", quiet: "counter-quiet", ivory: "counter-ivory" },
        placement: { inline: "", floating: "absolute -end-1.5 -top-1.5" },
    },
    defaultVariants: { tone: "ember" },
});

export default function Counter ({ value, maximum = 99, label, tone, placement }: Props) {

    if ( value <= 0 ) return null;

    return (

        <span className={counter({ tone, placement })} aria-hidden={label ? undefined : true}>

            {value > maximum ? `${maximum}+` : value}

            {label ? <span className="sr-only">{label}</span> : null}

        </span>

    );

}
