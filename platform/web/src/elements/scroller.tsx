"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";
import Pebble from "./pebble";

type Arrows = { start: ReactNode; end: ReactNode; previous: string; next: string };
type Props = VariantProps<typeof scroller> & { label?: string; arrows?: Arrows; children: ReactNode };

const scroller = tv({
    base: "scroller",
    variants: { gap: { 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4" }, align: { start: "", center: "lg:justify-center" } },
    defaultVariants: { gap: 2, align: "start" },
});

export default function Scroller ({ label, arrows, children, gap, align }: Props) {

    const list = useRef<HTMLUListElement>(null);
    const [edges, setEdges] = useState({ start: false, end: false });

    useEffect(() => {

        const frame = list.current;

        if ( !frame ) return;

        const measure = () => {

            const reach = frame.scrollWidth - frame.clientWidth;
            const at = Math.abs(frame.scrollLeft);
            const next = { start: at > 2, end: reach - at > 2 };

            setEdges(( previous ) => previous.start === next.start && previous.end === next.end ? previous : next);

        };
        const active = frame.querySelector<HTMLElement>("[aria-current='page']");

        if ( active && frame.scrollWidth > frame.clientWidth ) {

            const offset = active.offsetLeft - (frame.clientWidth - active.offsetWidth) / 2;

            frame.scrollTo({ left: offset, behavior: "instant" });

        }

        measure();

        const observer = new ResizeObserver(measure);

        observer.observe(frame);
        frame.addEventListener("scroll", measure, { passive: true });

        return () => {

            observer.disconnect();
            frame.removeEventListener("scroll", measure);

        };

    }, []);

    function move ( direction: 1 | -1 ) {

        const frame = list.current;

        if ( !frame ) return;

        const flip = getComputedStyle(frame).direction === "rtl" ? -1 : 1;

        frame.scrollBy({ left: direction * flip * frame.clientWidth * .7, behavior: "smooth" });

    }

    return (

        <div className="scroller-frame" data-start={edges.start || undefined} data-end={edges.end || undefined}>

            <ul ref={list} aria-label={label} className={scroller({ gap, align })}>{children}</ul>

            {arrows && edges.start ? (

                <span className="scroller-arrow" data-side="start">

                    <Pebble label={arrows.previous} size="small" shape="round" tooltip={false} onClick={() => move(-1)}>

                        {arrows.start}

                    </Pebble>

                </span>

            ) : null}

            {arrows && edges.end ? (

                <span className="scroller-arrow" data-side="end">

                    <Pebble label={arrows.next} size="small" shape="round" tooltip={false} onClick={() => move(1)}>

                        {arrows.end}

                    </Pebble>

                </span>

            ) : null}

        </div>

    );

}
