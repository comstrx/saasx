"use client";

import { type ReactNode, useState } from "react";
import { ImageBroken } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof thumb> & { src: string; alt: string; fallback?: ReactNode };

const thumb = tv({
    slots: {
        frame: "relative grid shrink-0 place-items-center overflow-hidden border border-line bg-panel text-muted",
        image: "size-full",
    },
    variants: {
        size: {
            small: { frame: "h-8 w-12 rounded-md p-1 [&>svg]:size-4" },
            medium: { frame: "size-16 rounded-xl [&>svg]:size-6" },
            large: { frame: "size-24 rounded-2xl [&>svg]:size-7" },
        },
        fit: { contain: { image: "object-contain" }, cover: { frame: "p-0", image: "object-cover" } },
    },
    defaultVariants: { size: "small", fit: "contain" },
});

export default function Thumb ({ src, alt, size, fit, fallback }: Props) {

    const styles = thumb({ size, fit });
    const [failed, setFailed] = useState<string | null>(null);

    return (

        <span className={styles.frame()}>

            {failed === src ? fallback ?? <ImageBroken aria-hidden="true" /> : (

                <picture className="contents">

                    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(src)} className={styles.image()} />

                </picture>

            )}

        </span>

    );

}
