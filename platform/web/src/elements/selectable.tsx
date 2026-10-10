"use client";

import type { ReactNode } from "react";
import { Check as Tick } from "@/lib/providers/icons";
import { Checkbox } from "@/lib/providers/ui";

type Props = {
    id: string;
    label: string;
    selected: boolean;
    onChange: ( selected: boolean ) => void;
    disabled?: boolean;
    detail?: ReactNode;
    end?: ReactNode;
    children?: ReactNode;
};

export default function Selectable ({ id, label, selected, onChange, disabled, detail, end, children }: Props) {

    return (

        <div data-selected={selected ? "" : undefined} className="selectable-card">

            <label htmlFor={id} className="flex min-h-16 cursor-pointer items-start gap-3.5 p-4">

                <Checkbox.Root
                    id={id}
                    checked={selected}
                    disabled={disabled}
                    onCheckedChange={( value ) => onChange(value)}
                    className="check-box mt-0.5"
                >

                    <Checkbox.Indicator className="check-mark"><Tick weight="bold" /></Checkbox.Indicator>

                </Checkbox.Root>

                <span className="flex min-w-0 flex-1 flex-col gap-1">

                    <span className="text-base font-semibold" dir="auto">{label}</span>

                    {detail}

                </span>

                {end}

            </label>

            {children ? <div className="flex min-w-0 flex-col gap-5 border-t border-line p-4">{children}</div> : null}

        </div>

    );

}
