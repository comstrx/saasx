"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { ImageBroken } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof media> & {
    src?: string | null;
    variants?: Record<string, string | null> | readonly never[] | null;
    alt: string;
    placeholder?: ReactNode;
    priority?: boolean;
    fit?: "cover" | "contain";
    sizes?: string;
    overlay?: ReactNode;
};

const media = tv({
    slots: {
        frame: "relative isolate grid min-w-0 place-items-center overflow-hidden bg-track",
        image: "size-full",
        empty: "media-empty",
    },
    variants: {
        ratio: {
            card: { frame: "aspect-(--aspect-card)" },
            wide: { frame: "aspect-(--aspect-wide)" },
            square: { frame: "aspect-square" },
            portrait: { frame: "aspect-(--aspect-portrait)" },
            viewer: { frame: "photo-viewer" },
            fill: { frame: "size-full" },
        },
        radius: {
            none: {},
            small: { frame: "rounded-lg" },
            medium: { frame: "rounded-2xl" },
            large: { frame: "rounded-3xl" },
            round: { frame: "rounded-full" },
        },
        width: {
            auto: {},
            thumb: { frame: "w-24 shrink-0 sm:w-32" },
            mini: { frame: "w-16 shrink-0" },
            icon: { frame: "w-12 shrink-0" },
            deal: { frame: "h-15 w-19 shrink-0" },
            spotlight: { frame: "h-18 w-24 shrink-0 sm:h-20 sm:w-28" },
        },
        zoom: { true: { image: "image-zoom" } },
        border: { true: { frame: "border border-edge" } },
    },
    defaultVariants: { ratio: "card", radius: "medium" },
});

function sourcesOf ( variants: Props["variants"] ): string {

    return Object.entries(variants ?? {})
        .filter(( entry ) => /^\d+$/.test(entry[0]) && entry[1])
        .map(( [width, url] ) => `${url} ${width}w`)
        .join(", ");

}
export default function Media ({
    src, variants, alt, placeholder, priority, fit = "cover", sizes, overlay, ratio, radius, zoom, border, width,
}: Props) {

    const styles = media({ ratio, radius, zoom, border, width });
    const sources = sourcesOf(variants);
    const image = useRef<HTMLImageElement>(null);
    const [failed, setFailed] = useState<string | null>(null);
    const broken = !src || failed === src;

    useEffect(() => {

        const node = image.current;

        if ( src && node?.complete && node.naturalWidth === 0 ) setFailed(src);

    }, [src]);

    return (

        <div className={styles.frame()}>

            {broken ? (

                alt ? (

                    <span role="img" aria-label={alt} className={styles.empty()}>{placeholder ?? <ImageBroken />}</span>

                ) : <span aria-hidden="true" className={styles.empty()}>{placeholder ?? <ImageBroken />}</span>

            ) : (

                <picture className="contents">

                    <img
                        ref={image}
                        src={src}
                        srcSet={sources || undefined}
                        sizes={sources ? sizes ?? "auto, (min-width: 64rem) 25vw, 100vw" : undefined}
                        alt={alt}
                        loading={priority ? "eager" : "lazy"}
                        fetchPriority={priority ? "high" : undefined}
                        decoding="async"
                        onError={() => setFailed(src)}
                        className={`${styles.image()} ${fit === "contain" ? "object-contain" : "object-cover"}`}
                    />

                </picture>

            )}

            {overlay}

        </div>

    );

}
