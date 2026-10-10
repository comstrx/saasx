import type { Route } from "next";
import NextLink from "next/link";
import { CaretLeft, CaretRight } from "@/lib/providers/icons";

type Props = {
    label: string;
    page: number;
    pages: number;
    href: ( page: number ) => string;
    previous: string;
    next: string;
    pageLabel: ( page: number ) => string;
};

function windowOf ( page: number, pages: number ): (number | `gap-${number}`)[] {

    const set = new Set([1, pages, page - 1, page, page + 1].filter(( item ) => item >= 1 && item <= pages));
    const sorted = [...set].sort(( a, b ) => a - b);

    return sorted.flatMap(( item, index ) => {

        const previous = sorted[index - 1];

        return previous !== undefined && item - previous > 1 ? [`gap-${previous}` as const, item] : [item];

    });

}
export default function Pagination ({ label, page, pages, href, previous, next, pageLabel }: Props) {

    if ( pages <= 1 ) return null;

    return (

        <nav aria-label={label} className="flex items-center justify-center gap-1.5">

            {page > 1 ? (

                <NextLink href={href(page - 1) as Route} prefetch={false} aria-label={previous} className="pebble pebble-sm pebble-round">

                    <CaretLeft weight="bold" className="rtl:-scale-x-100" />

                </NextLink>

            ) : null}

            {windowOf(page, pages).map(( item ) => typeof item === "string" ? (

                <span key={item} aria-hidden="true" className="px-1 text-muted">…</span>

            ) : (

                <NextLink
                    key={item}
                    href={href(item) as Route}
                    prefetch={false}
                    aria-label={pageLabel(item)}
                    aria-current={item === page ? "page" : undefined}
                    className="page-dot"
                >

                    {item}

                </NextLink>

            ))}

            {page < pages ? (

                <NextLink href={href(page + 1) as Route} prefetch={false} aria-label={next} className="pebble pebble-sm pebble-round">

                    <CaretRight weight="bold" className="rtl:-scale-x-100" />

                </NextLink>

            ) : null}

        </nav>

    );

}
