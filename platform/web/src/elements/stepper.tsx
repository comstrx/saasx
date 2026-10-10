"use client";

import { useId } from "react";
import { Minus, Plus } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof stepper> & {
    label: string;
    hint?: string;
    disabled?: boolean;
    value: number;
    minimum: number;
    maximum: number;
    decrease: string;
    increase: string;
    onChange: ( value: number ) => void;
};

const stepper = tv({
    slots: {
        frame: "flex min-w-0 items-center justify-between gap-4",
        step: "counter-step text-ink",
        value: "min-w-7 text-center font-latin text-base font-semibold tabular-nums",
    },
    variants: {
        size: {
            small: { step: "size-8", value: "min-w-6 text-small" },
            medium: {},
        },
        bare: { true: { frame: "justify-start" } },
    },
    defaultVariants: { size: "medium" },
});

export default function Stepper ({ label, hint, value, minimum, maximum, decrease, increase, onChange, disabled, size, bare }: Props) {

    const id = useId();
    const look = stepper({ size, bare });

    return (

        <div className={look.frame()}>

            <div className={bare ? "sr-only" : "min-w-0"}>

                <p id={id} className="text-small font-medium">{label}</p>

                {hint ? <p className="text-label text-muted">{hint}</p> : null}

            </div>

            <fieldset className="flex shrink-0 items-center gap-2.5" aria-labelledby={id} disabled={disabled}>

                <button
                    type="button"
                    aria-label={decrease}
                    disabled={value <= minimum}
                    onClick={() => onChange(Math.max(minimum, value - 1))}
                    className={look.step()}
                >

                    <Minus weight="bold" className="size-3.5" />

                </button>

                <output aria-live="polite" className={look.value()}>{value}</output>

                <button
                    type="button"
                    aria-label={increase}
                    disabled={value >= maximum}
                    onClick={() => onChange(Math.min(maximum, value + 1))}
                    className={look.step()}
                >

                    <Plus weight="bold" className="size-3.5" />

                </button>

            </fieldset>

        </div>

    );

}
