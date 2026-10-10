"use client";

import { type ReactNode, useEffect, useState } from "react";

type Section = { id: string; label: string };
type Props = { label: string; sections: readonly Section[]; end?: ReactNode };

export default function SectionNav ({ label, sections, end }: Props) {

    const [current, setCurrent] = useState(sections[0]?.id ?? "");

    useEffect(() => {

        const targets = sections
            .map(( section ) => document.getElementById(section.id))
            .filter(( node ): node is HTMLElement => Boolean(node));

        if ( !targets.length || !("IntersectionObserver" in window) ) return;

        const observer = new IntersectionObserver(( entries ) => {

            const visible = entries
                .filter(( entry ) => entry.isIntersecting)
                .sort(( a, b ) => a.boundingClientRect.top - b.boundingClientRect.top);

            if ( visible[0] ) setCurrent(visible[0].target.id);

        }, { rootMargin: "-30% 0px -60% 0px" });

        for ( const target of targets ) {

            observer.observe(target);

        }

        return () => observer.disconnect();

    }, [sections]);

    return (

        <nav aria-label={label} className="section-nav">

            <div className="boxed flex min-w-0 items-center justify-between gap-4">

                <ul className="tabs-line flex-1 border-0">

                    {sections.map(( section ) => (

                        <li key={section.id} className="shrink-0">

                            <a
                                href={`#${section.id}`}
                                aria-current={current === section.id ? "true" : undefined}
                                className="section-nav-link"
                            >

                                {section.label}

                            </a>

                        </li>

                    ))}

                </ul>

                {end ? <div className="hidden shrink-0 items-center gap-3 lg:flex">{end}</div> : null}

            </div>

        </nav>

    );

}
