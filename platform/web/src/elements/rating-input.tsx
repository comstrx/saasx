"use client";

import { Star, WarningCircle } from "@/lib/providers/icons";
import { Radio, RadioGroup } from "@/lib/providers/ui";

type Props = {
    id: string;
    label: string;
    value: string;
    options: readonly { value: string; label: string }[];
    hint?: string;
    error?: string;
    disabled?: boolean;
    clearLabel?: string;
    onChange: ( value: string ) => void;
};

export default function RatingInput ({ id, label, value, options, hint, error, disabled, clearLabel, onChange }: Props) {

    return (

        <fieldset id={id} tabIndex={-1} disabled={disabled} className="flex min-w-0 flex-col gap-2.5">

            <legend className="field-label mb-2.5">{label}</legend>

            <RadioGroup
                aria-label={label}
                value={value}
                disabled={disabled}
                aria-invalid={!!error || undefined}
                aria-describedby={[hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined}
                onValueChange={( next ) => onChange(String(next))}
                className="flex items-center gap-1"
            >

                {options.map(( option ) => {

                    const filled = Number(option.value) <= Number(value);

                    return (

                        <Radio.Root
                            key={option.value}
                            value={option.value}
                            aria-label={option.label}
                            className="grid size-11 cursor-pointer place-items-center rounded-full press-motion hover:bg-hover"
                        >

                            <Star weight={filled ? "fill" : "regular"} className={filled ? "size-7 text-rating" : "size-7 text-disabled"} />

                        </Radio.Root>

                    );

                })}

            </RadioGroup>

            {hint ? <p id={`${id}-hint`} className="field-hint">{hint}</p> : null}

            {error ? <p id={`${id}-error`} role="alert" className="field-error"><WarningCircle weight="fill" />{error}</p> : null}

            {clearLabel && value ? (

                <button type="button" onClick={() => onChange("")} disabled={disabled} className="btn btn-link btn-sm self-start">

                    {clearLabel}

                </button>

            ) : null}

        </fieldset>

    );

}
