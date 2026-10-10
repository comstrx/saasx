import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";

type Props = { children: ReactNode; href?: string; pressed?: boolean; label?: string; scroll?: boolean; onClick?: () => void };

export default function Chip ({ children, href, pressed, label, scroll, onClick }: Props) {

    const selected = pressed ? "" : undefined;

    if ( href ) return (

        <NextLink
            href={href as Route} prefetch={false} scroll={scroll} aria-label={label} aria-current={pressed ? "true" : undefined}
            data-selected={selected} className="chip"
        >

            {children}

        </NextLink>

    );

    return (

        <button type="button" aria-label={label} aria-pressed={pressed} data-selected={selected} onClick={onClick} className="chip">

            {children}

        </button>

    );

}
