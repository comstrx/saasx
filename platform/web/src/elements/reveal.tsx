"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";

type Props = { children: ReactNode; order?: number };
type Phase = "rest" | "armed" | "shown";

export default function Reveal ({ children, order = 0 }: Props) {

    const node = useRef<HTMLDivElement>(null);
    const [phase, setPhase] = useState<Phase>("rest");

    useEffect(() => {

        const element = node.current;

        if ( !element || !("IntersectionObserver" in window) ) return;
        if ( element.getBoundingClientRect().top < window.innerHeight * .92 ) return;

        setPhase("armed");

        const observer = new IntersectionObserver(( entries ) => {

            if ( entries.some(( entry ) => entry.isIntersecting) ) {

                setPhase("shown");
                observer.disconnect();

            }

        }, { rootMargin: "0px 0px -6% 0px", threshold: .06 });

        observer.observe(element);

        return () => observer.disconnect();

    }, []);

    return (

        <div
            ref={node}
            data-phase={phase}
            className="reveal-on-scroll min-w-0"
            style={{ "--reveal-order": order } as CSSProperties}
        >

            {children}

        </div>

    );

}
