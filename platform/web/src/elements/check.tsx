"use client";

import type { ReactNode } from "react";
import { Minus, Check as Tick } from "@/lib/providers/icons";
import { Checkbox } from "@/lib/providers/ui";

type Props = {
    id: string;
    label: string;
    checked: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    labelVisible?: boolean;
    detail?: ReactNode;
    invalid?: boolean;
    onChange: ( checked: boolean ) => void;
};

export default function Check ({ id, label, checked, indeterminate, disabled, labelVisible = true, detail, invalid, onChange }: Props) {

    return (

        <label htmlFor={id} className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center gap-3 text-small text-ink">

            <Checkbox.Root
                id={id}
                checked={checked}
                indeterminate={indeterminate}
                disabled={disabled}
                data-invalid={invalid ? "" : undefined}
                onCheckedChange={( value ) => onChange(value)}
                className="check-box"
            >

                <Checkbox.Indicator className="check-mark">

                    {indeterminate ? <Minus weight="bold" /> : <Tick weight="bold" />}

                </Checkbox.Indicator>

            </Checkbox.Root>

            <span className={labelVisible ? "flex min-w-0 flex-col gap-0.5" : "sr-only"}>

                <span dir="auto">{label}</span>

                {detail ? <span className="text-label text-muted">{detail}</span> : null}

            </span>

        </label>

    );

}
