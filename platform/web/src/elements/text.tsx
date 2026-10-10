import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = Omit<HTMLAttributes<HTMLParagraphElement>, "className" | "style"> & VariantProps<typeof text> & {
    as?: "p" | "span" | "small" | "strong" | "div";
};

const text = tv({
    base: "min-w-0",
    variants: {
        size: {
            base: "text-base", value: "text-value", small: "text-small", label: "text-label", micro: "text-micro", title: "text-title",
        },
        tone: {
            ink: "text-ink",
            muted: "text-muted",
            accent: "text-accent",
            danger: "text-danger",
            success: "text-success",
            warning: "text-warning",
            offer: "text-offer",
            placeholder: "text-placeholder",
            inherit: "",
        },
        weight: { normal: "font-normal", medium: "font-medium", semibold: "font-semibold", bold: "font-bold" },
        align: { start: "text-start", center: "text-center", end: "text-end" },
        measure: { full: "", readable: "max-w-prose", short: "max-w-lg", narrow: "max-w-sm" },
        truncate: { true: "truncate" },
        clamp: { 1: "line-clamp-1", 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4" },
        wrap: { normal: "", anywhere: "wrap-anywhere", balance: "text-balance", pretty: "text-pretty" },
        numeric: { true: "font-latin tabular-nums" },
        srOnly: { true: "sr-only" },
    },
    defaultVariants: { size: "base", tone: "ink", weight: "normal", align: "start" },
});

export default function Text ({
    as: Tag = "p", size, tone, weight, align, measure, truncate, clamp, numeric, wrap, srOnly, ...props
}: Props) {

    return <Tag className={text({ size, tone, weight, align, measure, truncate, clamp, numeric, wrap, srOnly })} {...props} />;

}
