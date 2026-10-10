"use client";

import type { Route } from "next";
import NextLink from "next/link";
import { type ReactNode, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";
import Media from "./media";

type Slide = { src: string | null; variants?: Record<string, string | null> | readonly never[] | null };
type Props = VariantProps<typeof slides> & {
    items: readonly Slide[];
    alt: string;
    href?: string | null;
    priority?: boolean;
    labels: { previous: string; next: string };
    overlay?: ReactNode;
    counter?: boolean;
};

const slides = tv({
    base: "slides group/slides",
    variants: { look: { card: "", bleed: "slides-bleed" } },
    defaultVariants: { look: "card" },
});

function Frame ({ href, children }: { href?: string | null; children: ReactNode }) {

    return href ? (

        <NextLink href={href as Route} prefetch={false} tabIndex={-1} aria-hidden="true" className="slides-item">{children}</NextLink>

    ) : <div className="slides-item">{children}</div>;

}
export default function Slides ({ items, alt, href, priority, labels, overlay, counter, look }: Props) {

    const track = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState(0);
    const total = items.length;

    function go ( index: number ) {

        const frame = track.current;
        const target = frame?.children[Math.max(0, Math.min(total - 1, index))] as HTMLElement | undefined;

        if ( frame && target ) frame.scrollTo({ left: target.offsetLeft - frame.offsetLeft, behavior: "smooth" });

    }
    function settle () {

        const frame = track.current;

        if ( !frame?.clientWidth ) return;

        setCurrent(Math.round(Math.abs(frame.scrollLeft) / frame.clientWidth));

    }

    return (

        <div className={slides({ look })}>

            <div ref={track} className="slides-track" onScroll={settle}>

                {items.map(( item, index ) => (

                    <Frame key={item.src ?? index} href={href}>

                        <Media
                            src={item.src} variants={item.variants} alt={index ? "" : alt} ratio="fill" radius="none"
                            priority={priority && !index}
                        />

                    </Frame>

                ))}

            </div>

            {overlay ? <div className="slides-overlay">{overlay}</div> : null}

            {total > 1 ? (

                <>

                    <button
                        type="button" aria-label={labels.previous} disabled={current === 0} onClick={() => go(current - 1)}
                        className="slides-arrow slides-previous"
                    >

                        <CaretLeft weight="bold" className="rtl:-scale-x-100" />

                    </button>

                    <button
                        type="button" aria-label={labels.next} disabled={current >= total - 1} onClick={() => go(current + 1)}
                        className="slides-arrow slides-next"
                    >

                        <CaretRight weight="bold" className="rtl:-scale-x-100" />

                    </button>

                    {counter ? <span aria-hidden="true" className="slides-counter"><bdi dir="ltr">{current + 1} / {total}</bdi></span> : (

                        <span aria-hidden="true" className="slides-dots">

                            {items.map(( item, index ) => (

                                <span key={item.src ?? index} data-current={index === current || undefined} className="slides-dot" />

                            ))}

                        </span>

                    )}

                </>

            ) : null}

        </div>

    );

}
