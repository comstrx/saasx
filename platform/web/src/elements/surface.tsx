import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = Omit<HTMLAttributes<HTMLElement>, "className" | "style"> & VariantProps<typeof surface> & {
    as?: "div" | "section" | "article" | "aside" | "header" | "li";
};

const surface = tv({
    base: "relative min-w-0",
    variants: {
        tone: { panel: "bg-panel", popup: "bg-popup", control: "bg-control", track: "bg-track", clear: "" },
        padding: {
            0: "p-0",
            2: "p-2",
            3: "p-3",
            4: "p-4",
            5: "p-4 sm:p-5",
            6: "p-5 sm:p-6",
            8: "p-6 md:p-8",
            10: "p-6 md:p-10",
            12: "p-6 md:p-12",
        },
        radius: {
            none: "rounded-none",
            sm: "rounded-lg",
            md: "rounded-2xl",
            lg: "rounded-3xl",
            xl: "rounded-4xl",
            hero: "rounded-5xl md:rounded-6xl",
        },
        border: { true: "border", false: "", start: "border-s border-line" },
        elevation: { none: "", low: "shadow-sm", medium: "shadow-md", high: "shadow-lg" },
        overflow: { visible: "", hidden: "overflow-hidden" },
        motion: { none: "", enter: "reveal", scroll: "reveal-scroll" },
        interactive: { true: "control-motion lift-motion hover:shadow-md" },
        fill: { true: "h-full" },
        contained: { true: "@container" },
    },
    compoundVariants: [
        { border: true, tone: ["panel", "control", "clear"], class: "border-edge" },
        { border: true, tone: "popup", class: "border-float" },
        { border: true, tone: "track", class: "border-line" },
    ],
    defaultVariants: { tone: "panel", padding: 6, radius: "lg", border: true, elevation: "low", motion: "none" },
});

export default function Surface ({
    as: Tag = "div", tone, padding, radius, border, elevation, overflow, motion, interactive, fill, contained, ...props
}: Props) {

    const look = surface({ tone, padding, radius, border, elevation, overflow, motion, interactive, fill, contained });

    return <Tag className={look} {...props} />;

}
