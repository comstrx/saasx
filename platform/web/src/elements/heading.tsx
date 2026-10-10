import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = Omit<HTMLAttributes<HTMLHeadingElement>, "className" | "style"> & VariantProps<typeof heading> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
};

const heading = tv({
    base: "min-w-0 text-balance",
    variants: {
        size: {
            display: "text-display font-semibold",
            headline: "text-headline font-semibold",
            h1: "text-h1 font-semibold",
            h2: "text-h2 font-semibold",
            h3: "text-h3 font-semibold",
            title: "text-title font-semibold",
            label: "text-small font-semibold",
        },
        tone: { ink: "text-ink", muted: "text-muted", inherit: "" },
        align: { start: "text-start", center: "text-center", end: "text-end" },
        clamp: { 1: "line-clamp-1", 2: "line-clamp-2", 3: "line-clamp-3" },
        wrap: { normal: "", balance: "text-balance", pretty: "text-pretty" },
    },
    defaultVariants: { size: "h2", tone: "ink", align: "start" },
});

export default function Heading ({ level = 2, size, tone, align, clamp, wrap, ...props }: Props) {

    const Tag = `h${level}` as const;

    return <Tag className={heading({ size, tone, align, clamp, wrap })} {...props} />;

}
