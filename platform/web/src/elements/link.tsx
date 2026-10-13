import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";

type Props = { href: string; label: string; tone?: "default" | "primary" | "button" | undefined; current?: boolean | undefined; icon?: ReactNode | undefined };

export default function Link ({ href, label, tone = "default", current = false, icon }: Props) {
    return (

        <NextLink href={href as Route} className="link" data-tone={tone} aria-current={current ? "page" : undefined}>

            {icon}

            <span className="link-label">{label}</span>

        </NextLink>

    );
}
