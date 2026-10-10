import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof field> & { children: ReactNode };

const field = tv({
    base: "search-segment",
    variants: { kind: { primary: "search-segment-primary", secondary: "", action: "search-segment-action" } },
    defaultVariants: { kind: "secondary" },
});

export default function SearchField ({ children, kind }: Props) {

    return <div className={field({ kind })}>{children}</div>;

}
