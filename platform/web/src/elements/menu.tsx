import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";

export type MenuEntry = { href: string; label: string; icon?: ReactNode | undefined; current?: boolean | undefined };
type Props = { label: string; entries: readonly MenuEntry[] };

export default function Menu ({ label, entries }: Props) {
    return (

        <nav className="menu" aria-label={label}>

            <ul className="menu-list">

                {entries.map(( entry ) => (

                    <li key={entry.href} className="menu-item">

                        <NextLink href={entry.href as Route} className="menu-link" aria-current={entry.current ? "page" : undefined}>

                            {entry.icon}

                            <span className="menu-label">{entry.label}</span>

                        </NextLink>

                    </li>

                ))}

            </ul>

        </nav>

    );
}
