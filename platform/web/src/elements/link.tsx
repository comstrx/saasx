import type { Route } from "next";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = Omit<ComponentProps<"a">, "className" | "style" | "color" | "href"> & VariantProps<typeof link>
    & Pick<ComponentProps<typeof NextLink>, "prefetch" | "replace" | "scroll" | "onNavigate" | "transitionTypes"> & { href: string };

const link = tv({
    base: "min-w-0",
    variants: {
        variant: {
            card: "text-start text-ink outline-none after:absolute after:inset-0 after:z-1 after:rounded-[inherit]",
            text: [
                "text-accent underline decoration-transparent underline-offset-4 control-motion",
                "hover:decoration-current",
            ],
            inline: "font-medium text-ink underline decoration-strong underline-offset-4 control-motion hover:decoration-current",
            quiet: "inline-flex items-center gap-1.5 text-muted control-motion hover:text-ink",
            heading: "inline-flex items-center justify-start text-start text-ink control-motion hover:text-accent",
            nav: [
                "inline-flex min-h-11.5 items-center gap-2 rounded-control px-4 text-value font-semibold whitespace-nowrap",
                "control-motion [&_svg]:size-5",
            ],
            tile: "flex min-w-0 items-center gap-3 rounded-control p-2 text-start text-ink control-motion hover:bg-hover",
            chip: "chip",
            avatar: "inline-flex shrink-0 rounded-full press-motion",
            filled: "btn btn-solid",
            outlined: "btn btn-outline",
            subtle: "btn btn-soft",
            ghost: "btn btn-ghost",
        },
        size: { small: "", medium: "", large: "" },
        active: { true: "", false: "" },
        width: { auto: "", full: "w-full" },
        compact: { true: "", false: "" },
        shape: { soft: "", pill: "" },
    },
    compoundVariants: [
        { variant: ["filled", "outlined", "subtle", "ghost"], size: "small", class: "btn-sm" },
        { variant: ["filled", "outlined", "subtle", "ghost"], size: "medium", class: "btn-md" },
        { variant: ["filled", "outlined", "subtle", "ghost"], size: "large", class: "btn-lg" },
        { variant: ["filled", "outlined", "subtle", "ghost"], compact: true, class: "btn-icon lg:aspect-auto lg:[--btn-fill:1]" },
        { variant: ["filled", "outlined", "subtle", "ghost"], shape: "pill", class: "btn-pill" },
        { variant: "nav", active: false, class: "border border-transparent text-muted hover:bg-hover hover:text-ink" },
        { variant: "nav", active: true, class: "ceramic text-ink" },
        { variant: "tile", active: true, class: "bg-selected" },
        { variant: "quiet", active: true, class: "text-ink" },
    ],
    defaultVariants: { variant: "text", size: "medium", active: false, width: "auto", compact: false, shape: "soft" },
});

export default function Link ({
    variant, size, active, width, compact, shape, href, prefetch = false, replace, scroll, onNavigate, transitionTypes, ...props
}: Props) {

    const attributes = {
        "aria-current": active ? "page" : undefined, className: link({ variant, size, active, width, compact, shape }), ...props,
    } as const;

    const plain = href.startsWith("#") || props.target || props.download || /^(?:https?:|mailto:|tel:)/.test(href);

    if ( plain ) return <a href={href} {...attributes} />;

    return (

        <NextLink
            href={href as Route}
            prefetch={prefetch}
            replace={replace}
            scroll={scroll}
            onNavigate={onNavigate}
            transitionTypes={transitionTypes}
            {...attributes}
        />

    );

}
