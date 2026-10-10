"use client";

import type { Route } from "next";
import NextLink from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ImageBroken } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof cover> & {
    href?: string | null;
    image?: string | null;
    variants?: Record<string, string | null> | readonly never[] | null;
    title: string;
    subtitle?: string;
    meta?: ReactNode;
};

const cover = tv({
    slots: {
        frame: "cover-frame group",
        title: "font-semibold text-on-photo",
        subtitle: "text-on-photo/85",
    },
    variants: {
        size: {
            small: { frame: "min-h-48", title: "text-title", subtitle: "text-label" },
            large: { frame: "min-h-48 md:min-h-full", title: "text-h3", subtitle: "text-small" },
        },
    },
    defaultVariants: { size: "small" },
});

export default function Cover ({ href, image, variants, title, subtitle, meta, size }: Props) {

    const styles = cover({ size });
    const picture = useRef<HTMLImageElement>(null);
    const [failed, setFailed] = useState<string | null>(null);
    const broken = !image || failed === image;

    useEffect(() => {

        const node = picture.current;

        if ( image && node?.complete && node.naturalWidth === 0 ) setFailed(image);

    }, [image]);

    const sources = Object.entries(variants ?? {})
        .filter(( entry ) => /^\d+$/.test(entry[0]) && entry[1])
        .map(( [width, url] ) => `${url} ${width}w`)
        .join(", ");
    const body = (

        <>

            {!broken ? (

                <picture className="contents">

                    <img
                        ref={picture}
                        src={image}
                        srcSet={sources || undefined}
                        sizes="(min-width: 64rem) 33vw, 100vw"
                        alt=""
                        loading="lazy"
                        onError={() => setFailed(image)}
                        className="cover-image image-zoom"
                    />

                </picture>

            ) : <span className="cover-placeholder media-empty"><ImageBroken /></span>}

            <span aria-hidden="true" className="cover-scrim" />

            <span className="cover-text">

                <span className={styles.title()} dir="auto">{title}</span>

                {subtitle ? <span className={styles.subtitle()} dir="auto">{subtitle}</span> : null}

                {meta ? <span className="mt-1">{meta}</span> : null}

            </span>

        </>

    );

    return (

        <li className="min-w-0 list-none">

            {href ? (

                <NextLink href={href as Route} prefetch={false} className={styles.frame()}>{body}</NextLink>

            ) : <span className={styles.frame()}>{body}</span>}

        </li>

    );

}
