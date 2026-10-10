import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = Omit<HTMLAttributes<HTMLElement>, "className" | "style"> & VariantProps<typeof stack> & {
    as?: "div" | "ul" | "ol" | "li" | "section" | "header" | "dl" | "nav" | "span";
};

const stack = tv({
    base: "flex min-w-0",
    variants: {
        direction: {
            column: "flex-col",
            row: "flex-row",
            responsive: "flex-col sm:flex-row",
            wide: "flex-col lg:flex-row",
            fluid: "flex-col @min-[16rem]:flex-row",
        },
        gap: {
            0: "gap-0",
            1: "gap-1",
            2: "gap-2",
            3: "gap-3",
            4: "gap-4",
            5: "gap-5",
            6: "gap-6",
            8: "gap-8",
            10: "gap-10",
            12: "gap-12",
            16: "gap-12 md:gap-16",
        },
        align: {
            start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch", baseline: "items-baseline",
            wide: "items-stretch lg:items-end",
            responsive: "items-stretch sm:items-end",
            lead: "items-start @min-[16rem]:items-center",
        },
        justify: { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" },
        wrap: { true: "flex-wrap", false: "flex-nowrap" },
        width: { auto: "", full: "w-full", narrow: "max-w-xs", readable: "max-w-prose", form: "w-full max-w-form" },
        grow: { true: "flex-1" },
        fixed: { true: "shrink-0" },
        visibility: {
            always: "", desktop: "hidden lg:flex", mobile: "lg:hidden", tablet: "hidden md:flex", phone: "md:hidden", narrow: "xl:hidden",
        },
        inset: { none: "", small: "p-2", medium: "p-3", large: "p-4 sm:p-5" },
        divided: { true: "border-t border-line", false: "" },
        fill: { true: "h-full" },
    },
    defaultVariants: { direction: "column", gap: 4, align: "stretch", width: "auto", visibility: "always" },
});

export default function Stack ({
    as: Tag = "div", direction, gap, align, justify, wrap, width, grow, fixed, visibility, inset, divided, fill, ...props
}: Props) {

    const look = stack({ direction, gap, align, justify, wrap, width, grow, fixed, visibility, inset, divided, fill });

    return <Tag className={look} {...props} />;

}
