"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@/lib/providers/icons";

type Props = { label: string; previous: string; next: string; children: ReactNode; heading?: ReactNode; action?: ReactNode };

const control = "pebble pebble-sm pebble-round";

export default function Rail ({ label, previous, next, children, heading, action }: Props) {

    const track = useRef<HTMLUListElement>(null);
    const [edges, setEdges] = useState({ start: true, end: false });

    const measure = useCallback(() => {

        const element = track.current;

        if ( !element ) return;

        const scrolled = Math.abs(element.scrollLeft);
        const room = element.scrollWidth - element.clientWidth;

        setEdges({ start: scrolled < 4, end: scrolled > room - 4 });

    }, []);

    useEffect(() => {

        measure();

        const element = track.current;

        if ( !element ) return;

        const observer = new ResizeObserver(measure);

        observer.observe(element);

        return () => observer.disconnect();

    }, [measure]);

    const move = ( direction: 1 | -1 ) => {

        const element = track.current;

        if ( !element ) return;

        const sign = getComputedStyle(element).direction === "rtl" ? -1 : 1;

        element.scrollBy({ left: element.clientWidth * .85 * direction * sign, behavior: "smooth" });

    };

    return (

        <section aria-label={label} className="flex min-w-0 flex-col gap-5">

            <div className="flex min-w-0 items-end justify-between gap-4">

                <div className="min-w-0 flex-1">{heading}</div>

                <div className="flex shrink-0 items-center gap-2">

                    {action}

                    <button type="button" aria-label={previous} disabled={edges.start} onClick={() => move(-1)} className={control}>

                        <CaretLeft weight="bold" className="rtl:-scale-x-100" />

                    </button>

                    <button type="button" aria-label={next} disabled={edges.end} onClick={() => move(1)} className={control}>

                        <CaretRight weight="bold" className="rtl:-scale-x-100" />

                    </button>

                </div>

            </div>

            <ul ref={track} onScroll={measure} className="rail-track">{children}</ul>

        </section>

    );

}
