import type { FormHTMLAttributes } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "className" | "style"> & VariantProps<typeof form> & { pending?: boolean };

const form = tv({
    base: "flex min-w-0 flex-col [&>button]:self-start",
    variants: { gap: { tight: "gap-4", normal: "gap-5", loose: "gap-7" } },
    defaultVariants: { gap: "normal" },
});

export default function Form ({ pending, gap, ...props }: Props) {

    return <form className={form({ gap })} aria-busy={pending || undefined} {...props} />;

}
