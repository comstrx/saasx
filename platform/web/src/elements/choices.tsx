"use client";

import type { ReactNode } from "react";
import { Check } from "@/lib/providers/icons";
import { Radio, RadioGroup } from "@/lib/providers/ui";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Choice = { value: string; label: string; detail?: string; lang?: string; media?: ReactNode; end?: ReactNode; disabled?: boolean };
type Props = VariantProps<typeof choices> & {
    label: string;
    value: string;
    options: readonly Choice[];
    disabled?: boolean;
    labelVisible?: boolean;
    onValueChange: ( value: string ) => void;
};

const choices = tv({
    slots: {
        group: "grid min-w-0 gap-2",
        item: "choice-tile",
    },
    variants: {
        columns: { 1: {}, 2: { group: "sm:grid-cols-2" }, 3: { group: "sm:grid-cols-2 lg:grid-cols-3" } },
        look: {
            tile: {},
            plain: { item: "border-transparent bg-transparent px-1 hover:border-transparent" },
            pick: { item: "choice-pick" },
        },
    },
    defaultVariants: { columns: 1, look: "tile" },
});

export default function Choices ({ label, value, options, disabled, labelVisible = false, columns, look, onValueChange }: Props) {

    const styles = choices({ columns, look });

    return (

        <div className="flex min-w-0 flex-col gap-2">

            {labelVisible ? <span className="field-label">{label}</span> : null}

            <RadioGroup
                aria-label={label}
                value={value}
                disabled={disabled}
                onValueChange={( next ) => onValueChange(String(next))}
                className={styles.group()}
            >

                {options.map(( option ) => (

                    <Radio.Root key={option.value} value={option.value} disabled={option.disabled} className={styles.item()}>

                        {look === "pick" ? null : <span aria-hidden="true" className="radio-dot" />}

                        {option.media}

                        <span className="flex min-w-0 flex-1 flex-col">

                            <span lang={option.lang} className="text-small font-semibold" dir="auto">{option.label}</span>

                            {option.detail ? <span className="text-micro font-normal text-muted" dir="auto">{option.detail}</span> : null}

                        </span>

                        {option.end}

                        {look === "pick" ? <Radio.Indicator className="choice-check"><Check weight="bold" /></Radio.Indicator> : null}

                    </Radio.Root>

                ))}

            </RadioGroup>

        </div>

    );

}
