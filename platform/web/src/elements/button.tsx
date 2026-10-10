import type { ButtonHTMLAttributes, Ref } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style" | "color"> & VariantProps<typeof button> & {
    pending?: boolean;
    ref?: Ref<HTMLButtonElement>;
};

const button = tv({
    base: "btn",
    variants: {
        variant: {
            filled: "btn-solid",
            outlined: "btn-outline",
            subtle: "btn-soft",
            ghost: "btn-ghost",
            danger: "btn-danger",
            link: "btn-link",
        },
        size: { xsmall: "btn-xs", small: "btn-sm", medium: "btn-md", large: "btn-lg", xlarge: "btn-xl" },
        rounded: { soft: "", full: "btn-pill", square: "btn-square" },
        width: { auto: "", full: "btn-full" },
        icon: { true: "btn-icon" },
        align: { center: "", start: "justify-start text-start" },
    },
    defaultVariants: { variant: "filled", size: "medium", rounded: "soft", width: "auto", align: "center" },
});

export default function Button ({
    variant, size, rounded, width, icon, align, pending, disabled, type = "button", children, ...props
}: Props) {

    return (

        <button
            type={type}
            disabled={disabled || pending}
            aria-busy={pending || undefined}
            className={button({ variant, size, rounded, width, icon, align })}
            {...props}
        >

            {pending ? (

                <svg data-spinner="" aria-hidden="true" viewBox="0 0 24 24" className="spinner">

                    <circle cx="12" cy="12" r="10" />

                    <circle cx="12" cy="12" r="10" pathLength="100" />

                </svg>

            ) : null}

            {children}

        </button>

    );

}
