"use client";

import { useState } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof portrait> & { src?: string | null; alt: string; initials: string; online?: boolean };

const portrait = tv({
    slots: {
        frame: "relative inline-grid shrink-0 place-items-center rounded-full ceramic-ivory font-semibold",
        image: "size-full rounded-full object-cover",
        dot: "absolute bottom-0 end-0 size-3 rounded-full border-2 border-panel bg-success",
    },
    variants: {
        size: {
            xsmall: { frame: "size-8 text-micro" },
            small: { frame: "size-10 text-label" },
            tool: { frame: "size-11 text-small" },
            medium: { frame: "size-14 text-title" },
            large: { frame: "size-20 text-h3", dot: "size-4" },
            xlarge: { frame: "size-28 text-h2", dot: "size-5" },
        },
    },
    defaultVariants: { size: "medium" },
});

export default function Portrait ({ src, alt, initials, online, size }: Props) {

    const styles = portrait({ size });
    const [failed, setFailed] = useState<string | null>(null);
    const shown = src && failed !== src;

    return (

        <span className={styles.frame()}>

            {shown ? (

                <picture className="contents">

                    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(src)} className={styles.image()} />

                </picture>

            ) : <span aria-label={alt} role="img">{initials}</span>}

            {online ? <span aria-hidden="true" className={styles.dot()} /> : null}

        </span>

    );

}
