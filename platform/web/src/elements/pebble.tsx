"use client";

import type { Route } from "next";
import NextLink from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";
import Tooltip from "./tooltip";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style" | "aria-label" | "aria-pressed">
    & VariantProps<typeof pebble> & {
    label: string;
    href?: string;
    count?: number;
    pressed?: boolean;
    tooltip?: boolean;
    children: ReactNode;
};

const pebble = tv({
    base: "pebble",
    variants: {
        size: { small: "pebble-sm", medium: "", large: "pebble-lg" },
        shape: { rounded: "", round: "pebble-round" },
        tone: { neutral: "", teal: "pebble-teal", photo: "pebble-photo", snow: "pebble-snow" },
        plain: { true: "pebble-plain" },
        visibility: { always: "", compact: "lg:hidden", wide: "max-lg:hidden" },
    },
    defaultVariants: { size: "medium", shape: "rounded", tone: "neutral" },
});

function Count ({ value }: { value?: number }) {

    if ( !value ) return null;

    return <span aria-hidden="true" className="counter counter-ember absolute -end-1.5 -top-1.5">{value > 99 ? "99+" : value}</span>;

}
export default function Pebble ({
    label, href, count, pressed, tooltip = true, size, shape, tone, plain, visibility, children, ...props
}: Props) {

    const name = count ? `${label} (${count})` : label;
    const className = pebble({ size, shape, tone, plain, visibility });
    const content = <>{children}<Count value={count} /></>;
    const control = href
        ? <NextLink href={href as Route} prefetch={false} aria-label={name} className={className}>{content}</NextLink>
        : <button type="button" aria-label={name} aria-pressed={pressed} className={className} {...props}>{content}</button>;

    return tooltip ? <Tooltip label={label}>{control}</Tooltip> : control;

}
