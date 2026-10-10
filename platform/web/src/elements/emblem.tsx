import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof emblem> & { children: ReactNode };

const emblem = tv({
    base: "pebble pebble-static",
    variants: {
        tone: {
            neutral: "text-ink",
            accent: "text-accent",
            teal: "pebble-teal",
            ember: "pebble-ember",
            ivory: "pebble-ivory",
            green: "pebble-green",
            blue: "pebble-blue",
            amber: "pebble-amber",
            red: "pebble-red",
        },
        size: { small: "pebble-sm", medium: "", large: "pebble-lg" },
        shape: { rounded: "", round: "pebble-round" },
        look: { ceramic: "", flat: "pebble-flat" },
    },
    defaultVariants: { tone: "accent", size: "medium", shape: "rounded", look: "ceramic" },
});

export default function Emblem ({ tone, size, shape, look, children }: Props) {

    return <span aria-hidden="true" className={emblem({ tone, size, shape, look })}>{children}</span>;

}
