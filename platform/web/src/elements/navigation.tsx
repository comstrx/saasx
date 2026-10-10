import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof navigation> & { label: string; children: ReactNode };

const navigation = tv({
    base: "flex min-w-0",
    variants: { direction: { column: "flex-col gap-0.5", row: "flex-row flex-wrap items-center gap-1" } },
    defaultVariants: { direction: "column" },
});

export default function Navigation ({ label, children, direction }: Props) {

    return <nav aria-label={label} className={navigation({ direction })}>{children}</nav>;

}
