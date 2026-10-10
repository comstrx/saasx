import type { ReactNode } from "react";
import { CaretDown } from "@/lib/providers/icons";

type Option = { value: string; label: string; detail: string };
type Props = {
    label: string;
    value: string;
    options: readonly Option[];
    children: ReactNode;
    disabled?: boolean;
    onValueChange: ( value: string ) => void;
};

export default function CountrySelect ({ label, value, options, children, disabled, onValueChange }: Props) {

    return (

        <div className="relative flex min-h-11 shrink-0 items-center gap-2 border-e border-line ps-3.5 pe-2.5 text-small font-medium">

            {children}

            <CaretDown aria-hidden="true" weight="bold" className="size-3.5 text-muted" />

            <select
                aria-label={label}
                value={value}
                disabled={disabled}
                onChange={( event ) => onValueChange(event.target.value)}
                className="absolute inset-0 size-full cursor-pointer bg-control text-ink opacity-0"
            >

                {options.map(( option ) => (

                    <option key={option.value} value={option.value}>{option.label} ({option.detail})</option>

                ))}

            </select>

        </div>

    );

}
