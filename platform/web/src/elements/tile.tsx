import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof tile> & {
    href?: string;
    onSelect?: () => void;
    art?: string | null;
    title: string;
    description?: string;
    icon?: ReactNode;
    meta?: ReactNode;
    active?: boolean;
    as?: "li" | "div";
};

const tile = tv({
    slots: {
        link: "tile-link group",
        body: "flex min-w-0 flex-1 flex-col",
        title: "truncate font-semibold text-ink",
        description: "line-clamp-1 text-muted",
        meta: "shrink-0 text-label text-muted",
    },
    variants: {
        look: {
            plain: {},
            panel: { link: "tile-panel" },
            chosen: { link: "tile-chosen", title: "line-clamp-2 whitespace-normal", meta: "flex flex-col items-end gap-0.5 text-end" },
            art: { link: "tile-art", body: "items-center", title: "text-center whitespace-normal line-clamp-2" },
        },
        size: {
            small: { link: "gap-2.5 p-1.5", title: "text-small", description: "text-micro" },
            medium: { link: "gap-3 p-2", title: "text-small", description: "text-label" },
            large: { link: "gap-4 p-4", title: "text-base", description: "text-small" },
        },
        direction: {
            row: {},
            column: { link: "flex-col items-start text-start", body: "w-full" },
            stacked: { link: "tile-stacked", body: "items-center", title: "text-center", description: "text-center" },
        },
    },
    compoundVariants: [
        { look: "art", size: "large", class: { link: "tile-art-large", title: "text-title", description: "text-small" } },
    ],
    defaultVariants: { look: "plain", size: "medium", direction: "row" },
});

export default function Tile ({
    href, onSelect, art, title, description, icon, meta, active, as: Tag = "li", look, size, direction,
}: Props) {

    const styles = tile({ look, size, direction });
    const content = (

        <>

            {art ? (

                <span aria-hidden="true" className="tile-art-stage">

                    <picture className="contents"><img src={art} alt="" loading="lazy" decoding="async" draggable={false} /></picture>

                </span>

            ) : icon}

            <span className={styles.body()}>

                <span className={styles.title()} dir="auto">{title}</span>

                {description ? <span className={styles.description()} dir="auto">{description}</span> : null}

            </span>

            {meta ? <span className={styles.meta()}>{meta}</span> : null}

        </>

    );

    return (

        <Tag className="min-w-0 list-none">

            {href ? (

                <NextLink href={href as Route} prefetch={false} aria-current={active ? "page" : undefined} className={styles.link()}>

                    {content}

                </NextLink>

            ) : (

                <button type="button" aria-pressed={active} onClick={onSelect} className={`${styles.link()} w-full cursor-pointer`}>

                    {content}

                </button>

            )}

        </Tag>

    );

}
