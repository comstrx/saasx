import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof container> & { children: ReactNode };

const container = tv({
    base: "min-w-0",
    variants: {
        width: {
            full: "w-full",
            boxed: "boxed",
            narrow: "mx-auto w-full max-w-md",
            form: "mx-auto w-full max-w-form",
            access: "mx-auto w-full max-w-access",
            reading: "mx-auto w-full max-w-reading",
            readable: "mx-auto w-full max-w-prose",
        },
    },
    defaultVariants: { width: "boxed" },
});

export default function Container ({ width, children }: Props) {

    return <div className={container({ width })}>{children}</div>;

}
