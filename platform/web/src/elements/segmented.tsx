"use client";

import type { ReactNode } from "react";
import { Radio, RadioGroup } from "@/lib/providers/ui";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof segmented> & {
    label: string;
    value: string;
    options: readonly { value: string; label: string; icon?: ReactNode; disabled?: boolean }[];
    disabled?: boolean;
    onValueChange: ( value: string ) => void;
};

const segmented = tv({
    base: "segment-track",
    variants: { width: { auto: "", full: "flex w-full" } },
    defaultVariants: { width: "full" },
});

export default function Segmented ({ label, value, options, disabled, width, onValueChange }: Props) {

    return (

        <RadioGroup
            aria-label={label}
            value={value}
            disabled={disabled}
            onValueChange={( next ) => onValueChange(String(next))}
            className={segmented({ width })}
        >

            {options.map(( option ) => (

                <Radio.Root key={option.value} value={option.value} disabled={option.disabled} className="segment">

                    {option.icon}

                    <span className="min-w-0 truncate">{option.label}</span>

                </Radio.Root>

            ))}

        </RadioGroup>

    );

}
