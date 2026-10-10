"use client";

import type { ReactNode } from "react";
import { Switch as Base } from "@/lib/providers/ui";

type Props = {
    id: string;
    label: string;
    checked: boolean;
    detail?: ReactNode;
    disabled?: boolean;
    labelVisible?: boolean;
    onChange: ( checked: boolean ) => void;
};

export default function Switch ({ id, label, checked, detail, disabled, labelVisible = true, onChange }: Props) {

    return (

        <label htmlFor={id} className="flex min-h-11 min-w-0 cursor-pointer items-center justify-between gap-4">

            <span className={labelVisible ? "flex min-w-0 flex-col gap-0.5" : "sr-only"}>

                <span className="text-small font-medium text-ink" dir="auto">{label}</span>

                {detail ? <span className="text-label text-muted">{detail}</span> : null}

            </span>

            <Base.Root id={id} checked={checked} disabled={disabled} onCheckedChange={( value ) => onChange(value)} className="switch-root">

                <Base.Thumb className="switch-thumb" />

            </Base.Root>

        </label>

    );

}
