"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

type Phase = "idle" | "running" | "done";

function Watch ({ onChange }: { onChange: () => void }) {

    const path = usePathname();
    const query = useSearchParams();
    const last = useRef(`${path}?${query}`);

    useEffect(() => {

        const now = `${path}?${query}`;

        if ( now !== last.current ) {

            last.current = now;
            onChange();

        }

    }, [path, query, onChange]);

    return null;

}
function leaving ( event: MouseEvent ): boolean {

    if ( event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) return false;

    const anchor = (event.target as Element | null)?.closest?.("a[href]");

    if ( !(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download") ) return false;

    const next = new URL(anchor.href, location.href);

    return next.origin === location.origin && (next.pathname !== location.pathname || next.search !== location.search);

}
export default function RouteProgress () {

    const [phase, setPhase] = useState<Phase>("idle");
    const done = useRef(() => setPhase(( current ) => (current === "running" ? "done" : current)));

    useEffect(() => {

        const start = ( event: MouseEvent ) => {

            if ( leaving(event) ) setPhase("running");

        };

        document.addEventListener("click", start, true);

        return () => document.removeEventListener("click", start, true);

    }, []);

    useEffect(() => {

        if ( phase === "idle" ) return;

        const timer = window.setTimeout(() => setPhase(phase === "done" ? "idle" : "done"), phase === "done" ? 420 : 12000);

        return () => window.clearTimeout(timer);

    }, [phase]);

    return (

        <>

            <Suspense fallback={null}><Watch onChange={done.current} /></Suspense>

            <span aria-hidden="true" data-phase={phase} className="route-progress" />

        </>

    );

}
