import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof badge> & { children: ReactNode; label?: string };

const badge = tv({
    base: "badge",
    variants: {
        tone: { neutral: "", teal: "", ember: "", success: "", warning: "", danger: "", info: "", ivory: "" },
        look: { ceramic: "", flat: "badge-flat" },
        size: { small: "", large: "badge-lg" },
    },
    compoundVariants: [
        { look: "ceramic", tone: "neutral", class: "ceramic text-ink" },
        { look: "ceramic", tone: "teal", class: "ceramic-teal" },
        { look: "ceramic", tone: "ember", class: "ceramic-ember" },
        { look: "ceramic", tone: "success", class: "ceramic-success" },
        { look: "ceramic", tone: "warning", class: "ceramic-warning" },
        { look: "ceramic", tone: "danger", class: "ceramic-danger" },
        { look: "ceramic", tone: "info", class: "ceramic-info" },
        { look: "ceramic", tone: "ivory", class: "ceramic-ivory" },
        { look: "flat", tone: "neutral", class: "text-ink" },
        { look: "flat", tone: "teal", class: "text-accent" },
        { look: "flat", tone: "ember", class: "text-offer" },
        { look: "flat", tone: "success", class: "text-success" },
        { look: "flat", tone: "warning", class: "text-warning" },
        { look: "flat", tone: "danger", class: "text-danger" },
        { look: "flat", tone: "info", class: "text-info" },
        { look: "flat", tone: "ivory", class: "text-ink" },
    ],
    defaultVariants: { tone: "neutral", look: "ceramic", size: "small" },
});

export default function Badge ({ tone, look, size, label, children }: Props) {

    return <span className={badge({ tone, look, size })} title={label}>{children}</span>;

}
