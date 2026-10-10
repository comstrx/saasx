"use client";

import { Check as Tick, WarningCircle } from "@/lib/providers/icons";
import { Checkbox } from "@/lib/providers/ui";

type Props = {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    columns?: 1 | 2 | 3;
    options: readonly { value: string; label: string; detail?: string }[];
    value: readonly string[];
    onChange: ( value: string[] ) => void;
};

const grids = { 1: "grid gap-2", 2: "grid gap-2 sm:grid-cols-2", 3: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3" };

export default function Checks ({ id, label, hint, error, disabled, columns = 2, options, value, onChange }: Props) {

    const toggle = ( option: string, checked: boolean ) => {

        onChange(checked ? [...value, option] : value.filter(( item ) => item !== option));

    };

    return (

        <fieldset
            id={id}
            tabIndex={-1}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={[hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined}
            className="min-w-0"
        >

            <legend className="field-label mb-2">{label}</legend>

            {hint ? <p id={`${id}-hint`} className="field-hint mb-3">{hint}</p> : null}

            <div className={grids[columns]}>

                {options.map(( option, index ) => (

                    <label key={option.value} htmlFor={`${id}-${index}`} className="choice-tile">

                        <Checkbox.Root
                            id={`${id}-${index}`}
                            checked={value.includes(option.value)}
                            disabled={disabled}
                            onCheckedChange={( checked ) => toggle(option.value, checked)}
                            className="check-box"
                        >

                            <Checkbox.Indicator className="check-mark"><Tick weight="bold" /></Checkbox.Indicator>

                        </Checkbox.Root>

                        <span className="flex min-w-0 flex-col">

                            <span className="text-small font-medium" dir="auto">{option.label}</span>

                            {option.detail ? <span className="text-label text-muted" dir="auto">{option.detail}</span> : null}

                        </span>

                    </label>

                ))}

            </div>

            {error ? <p id={`${id}-error`} role="alert" className="field-error mt-2"><WarningCircle weight="fill" />{error}</p> : null}

        </fieldset>

    );

}
