import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";

type Item = { key: string; href: string; label: string; icon: ReactNode; active?: boolean; count?: number };
type Props = { label: string; items: readonly Item[] };

function badge ( count: number ) {

    return count > 99 ? "99+" : String(count);

}
export default function TabBar ({ label, items }: Props) {

    return (

        <nav aria-label={label} className="tab-bar">

            <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>

                {items.map(( item ) => (

                    <li key={item.key} className="min-w-0">

                        <NextLink
                            href={item.href as Route}
                            prefetch={false}
                            aria-current={item.active ? "page" : undefined}
                            className="tab-bar-item"
                        >

                            <span className="tab-bar-icon">

                                {item.icon}

                                {item.count ? (

                                    <span aria-hidden="true" className="tab-bar-count counter counter-ember">{badge(item.count)}</span>

                                ) : null}

                            </span>

                            <span className="max-w-full truncate">{item.label}</span>

                        </NextLink>

                    </li>

                ))}

            </ul>

        </nav>

    );

}
