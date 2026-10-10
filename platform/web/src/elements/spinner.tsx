import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof spinner> & { label?: string };

const spinner = tv({
    slots: {
        frame: "inline-grid shrink-0 place-items-center",
        ring: "spinner",
    },
    variants: {
        size: {
            xsmall: { ring: "spinner-xs" },
            small: { ring: "spinner-sm" },
            medium: {},
            large: { ring: "spinner-lg" },
            xlarge: { ring: "spinner-xl" },
        },
        tone: {
            accent: { frame: "text-primary" },
            inherit: {},
            muted: { frame: "text-muted" },
            inverse: { frame: "text-on-action" },
            photo: { frame: "text-on-photo" },
        },
    },
    defaultVariants: { size: "medium", tone: "accent" },
});

export default function Spinner ({ size, tone, label }: Props) {

    const look = spinner({ size, tone });

    return (

        <span role={label ? "status" : undefined} className={look.frame()}>

            <svg aria-hidden="true" viewBox="0 0 24 24" className={look.ring()}>

                <circle cx="12" cy="12" r="10" />

                <circle cx="12" cy="12" r="10" pathLength="100" />

            </svg>

            {label ? <span className="sr-only">{label}</span> : null}

        </span>

    );

}
