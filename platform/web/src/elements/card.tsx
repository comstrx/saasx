import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof card> & {
    media?: ReactNode;
    children: ReactNode;
    actions?: ReactNode;
    badges?: ReactNode;
    footer?: ReactNode;
};

const card = tv({
    slots: {
        frame: "card-frame group",
        body: "order-2 flex min-w-0 flex-1 flex-col gap-1.5",
        media: "order-1 min-w-0",
        badges: "pointer-events-none absolute start-4.5 top-5.5 z-2 flex flex-wrap gap-1.5",
        actions: "absolute end-4.5 top-4.5 z-2",
        footer: "order-3 mt-auto",
    },
    variants: {
        look: {
            panel: { frame: "card-panel", body: "px-2 pt-3", footer: "px-2 pt-2.5 pb-2" },
            plain: { frame: "card-plain", body: "pt-3", footer: "pt-2" },
        },
        layout: {
            vertical: { frame: "flex-col" },
            horizontal: { frame: "flex-row items-stretch gap-4", body: "order-2 py-1", media: "w-36 shrink-0 sm:w-48" },
            row: {
                frame: "flex-col md:flex-row md:items-stretch md:gap-5",
                body: "md:px-0 md:pt-2 md:pb-1",
                media: "relative md:w-72 md:shrink-0 lg:w-80",
                badges: "md:start-4.5",
                actions: "end-3 top-3",
                footer: [
                    "flex flex-col gap-3 pt-3 md:mt-0 md:w-52 md:shrink-0 md:items-end md:justify-end md:border-s md:border-line",
                    "md:py-2 md:ps-5 md:text-end",
                ],
            },
        },
    },
    defaultVariants: { look: "panel", layout: "vertical" },
});

export default function Card ({ media, children, actions, badges, footer, look, layout }: Props) {

    const styles = card({ look, layout });
    const shelf = actions ? <div className={styles.actions()}>{actions}</div> : null;
    const docked = layout === "row" && Boolean(media);

    return (

        <li className={styles.frame()}>

            <div className={styles.body()}>{children}</div>

            {media ? <div className={styles.media()}>{media}{docked ? shelf : null}</div> : null}

            {footer ? <div className={styles.footer()}>{footer}</div> : null}

            {badges ? <div className={styles.badges()}>{badges}</div> : null}

            {docked ? null : shelf}

        </li>

    );

}
