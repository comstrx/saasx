import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof status> & { children: ReactNode; icon?: ReactNode };

const status = tv({
    base: "badge badge-flat badge-lg",
    variants: {
        tone: {
            neutral: "text-muted",
            positive: "text-success",
            attention: "text-warning",
            negative: "text-danger",
            info: "text-info",
            brand: "text-accent",
        },
    },
    defaultVariants: { tone: "neutral" },
});

export default function Status ({ tone, icon, children }: Props) {

    return <span className={status({ tone })}>{icon}{children}</span>;

}
