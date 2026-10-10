"use client";

import type { ReactNode } from "react";
import { CaretDown, Check, WarningCircle } from "@/lib/providers/icons";
import { Select as Base } from "@/lib/providers/ui";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Option = { value: string; label: string; disabled?: boolean; detail?: string; leading?: ReactNode; lang?: string };
type Props = VariantProps<typeof select> & {
    id: string;
    label: string;
    value: string;
    options: readonly Option[];
    error?: string;
    hint?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    autoComplete?: string;
    labelHidden?: boolean;
    onValueChange: ( value: string ) => void;
};

const select = tv({
    slots: {
        trigger: "field-shell w-full cursor-pointer justify-between gap-2 px-3.5 text-start data-popup-open:border-focus",
        popup: "menu-popup popup-motion popup-frame min-w-(--anchor-width) max-h-80 thin-scrollbar",
    },
    variants: {
        size: {
            small: { trigger: "field-sm" },
            medium: {},
            large: { trigger: "field-lg" },
        },
    },
    defaultVariants: { size: "medium" },
});

export default function Select ({
    id, label, value, options, error, hint, placeholder, disabled, required, name, autoComplete, labelHidden, size, onValueChange,
}: Props) {

    const look = select({ size });
    const help = hint ? `${id}-hint` : undefined;
    const failure = error ? `${id}-error` : undefined;
    const chosen = options.find(( option ) => option.value === value);

    return (

        <div className="flex min-w-0 flex-col gap-2">

            <Base.Root
                id={id}
                name={name}
                autoComplete={autoComplete}
                value={value}
                items={options}
                disabled={disabled}
                required={required}
                onValueChange={( next ) => onValueChange(String(next ?? ""))}
            >

                <Base.Label className={labelHidden ? "sr-only" : "field-label"}>{label}</Base.Label>

                <Base.Trigger
                    aria-invalid={error ? true : undefined}
                    aria-describedby={[help, failure].filter(Boolean).join(" ") || undefined}
                    data-invalid={error ? "" : undefined}
                    className={look.trigger()}
                >

                    <span className="flex min-w-0 items-center gap-2.5">

                        {chosen?.leading}

                        <Base.Value placeholder={placeholder} className="truncate text-base data-placeholder:text-placeholder">

                            {() => chosen?.label ?? placeholder}

                        </Base.Value>

                    </span>

                    <Base.Icon className="shrink-0 text-muted control-motion in-data-popup-open:rotate-180">

                        <CaretDown weight="bold" className="size-4" />

                    </Base.Icon>

                </Base.Trigger>

                <Base.Portal>

                    <Base.Positioner sideOffset={6} alignItemWithTrigger={false} className="z-60">

                        <Base.Popup className={look.popup()}>

                            <Base.List>

                                {options.map(( option ) => (

                                    <Base.Item key={option.value} value={option.value} disabled={option.disabled} className="menu-item">

                                        {option.leading}

                                        <span className="flex min-w-0 flex-1 flex-col">

                                            <Base.ItemText lang={option.lang} className="truncate">{option.label}</Base.ItemText>

                                            {option.detail ? <span className="truncate text-label text-muted">{option.detail}</span> : null}

                                        </span>

                                        <Base.ItemIndicator className="text-accent">

                                            <Check weight="bold" className="size-4" />

                                        </Base.ItemIndicator>

                                    </Base.Item>

                                ))}

                            </Base.List>

                        </Base.Popup>

                    </Base.Positioner>

                </Base.Portal>

            </Base.Root>

            {hint ? <p id={help} className="field-hint">{hint}</p> : null}

            {error ? <p id={failure} role="alert" className="field-error"><WarningCircle weight="fill" />{error}</p> : null}

        </div>

    );

}
