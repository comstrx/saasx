import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof art> & { src: string; alt?: string; priority?: boolean; glow?: boolean };

const art = tv({
    slots: {
        stage: "relative isolate grid shrink-0 place-items-center",
        floor: "art-floor",
        glow: "art-glow",
        image: "relative size-full select-none object-contain",
    },
    variants: {
        size: {
            hint: { stage: "size-(--hint-art)" },
            small: { stage: "size-16" },
            medium: { stage: "size-28" },
            large: { stage: "size-(--state-art)" },
            hero: { stage: "size-32 md:art-hero" },
            adaptive: { stage: "size-19 md:size-(--stage-art)" },
        },
        motion: { still: {}, float: { image: "art-float" } },
    },
    defaultVariants: { size: "medium", motion: "still" },
});

export default function Art ({ src, alt = "", size, motion, priority = false, glow = false }: Props) {

    const styles = art({ size, motion });

    return (

        <span className={styles.stage()}>

            {glow ? <span aria-hidden="true" className={styles.glow()} /> : null}

            <span aria-hidden="true" className={styles.floor()} />

            <picture className="contents">

                <img
                    src={src}
                    alt={alt}
                    className={styles.image()}
                    loading={priority ? "eager" : "lazy"}
                    fetchPriority={priority ? "high" : undefined}
                    decoding="async"
                    draggable={false}
                />

            </picture>

        </span>

    );

}
