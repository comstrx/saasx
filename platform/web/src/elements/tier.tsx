import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof tier> & { badge?: ReactNode; children: ReactNode; as?: "li" | "div" };

const tier = tv({
    slots: {
        frame: "relative flex min-w-0 flex-col gap-6 rounded-4xl border bg-panel p-6 control-motion md:p-8",
        badge: "absolute -top-3.5 start-6 md:start-8",
    },
    variants: {
        featured: {
            true: { frame: "border-accent shadow-lg ring-1 ring-accent lg:-translate-y-3" },
            false: { frame: "border-edge shadow-sm" },
        },
    },
    defaultVariants: { featured: false },
});

export default function Tier ({ badge, children, featured, as: Tag = "li" }: Props) {

    const styles = tier({ featured });

    return (

        <Tag className={styles.frame()}>

            {badge ? <span className={styles.badge()}>{badge}</span> : null}

            {children}

        </Tag>

    );

}
