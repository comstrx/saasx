"use client";

import { WarningCircle } from "@/lib/providers/icons";
import { OTPField } from "@/lib/providers/ui";
import { otpValue } from "@/lib/std/auth";

type Props = {
    id: string;
    label: string;
    hint: string;
    value: string;
    length: number;
    error?: string;
    disabled?: boolean;
    width?: "compact" | "full";
    slotLabel: ( index: number ) => string;
    onValueChange: ( value: string ) => void;
};

export default function OtpInput ({ id, label, hint, value, length, error, disabled, width = "compact", slotLabel, onValueChange }: Props) {

    const slots = Array.from({ length }, ( _, index ) => ({ id: `${id}-${index}`, position: index + 1 }));
    const described = `${id}-hint${error ? ` ${id}-error` : ""}`;
    const size = width === "compact" ? "w-full max-w-sm" : "w-full";

    return (

        <div className="flex min-w-0 flex-col gap-2.5">

            <label htmlFor={id} className="field-label">{label}</label>

            {length > 6 ? (

                <input
                    id={id}
                    dir="ltr"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={value}
                    maxLength={length}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={described}
                    onChange={( event ) => onValueChange(otpValue(event.target.value).slice(0, length))}
                    className={`otp-slot ${size}`}
                />

            ) : (

                <OTPField.Root
                    id={id}
                    length={length}
                    value={value}
                    disabled={disabled}
                    dir="ltr"
                    inputMode="numeric"
                    validationType="none"
                    normalizeValue={otpValue}
                    autoSubmit={false}
                    onValueChange={onValueChange}
                    className={`grid min-w-0 auto-cols-fr grid-flow-col gap-2.5 ${size}`}
                >

                    {slots.map(( slot ) => (

                        <OTPField.Input
                            key={slot.id}
                            className="otp-slot"
                            aria-label={slot.position === 1 ? undefined : slotLabel(slot.position)}
                            aria-invalid={!!error}
                            aria-describedby={described}
                        />

                    ))}

                </OTPField.Root>

            )}

            <p id={`${id}-hint`} className="field-hint">{hint}</p>

            {error ? <p id={`${id}-error`} role="alert" className="field-error"><WarningCircle weight="fill" />{error}</p> : null}

        </div>

    );

}
