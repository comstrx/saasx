import type { InputHTMLAttributes } from "react";
import { CloudArrowUp, WarningCircle } from "@/lib/providers/icons";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "style" | "type" | "value"> & {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    chooseLabel: string;
    emptyLabel: string;
    filename?: string;
};

export default function FileInput ({ id, label, hint, error, chooseLabel, emptyLabel, filename, ...props }: Props) {

    return (

        <div className="flex min-w-0 flex-col gap-2">

            <label id={`${id}-label`} htmlFor={id} className="field-label">{label}</label>

            <div data-invalid={error ? "" : undefined} className="drop-zone">

                <input
                    {...props}
                    id={id}
                    type="file"
                    aria-labelledby={`${id}-label ${id}-choose`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={[hint ? `${id}-hint` : null, error ? `${id}-error` : null, props["aria-describedby"]]
                        .filter(Boolean).join(" ") || undefined}
                    className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />

                <span aria-hidden="true" className="pebble pebble-static shrink-0 text-accent"><CloudArrowUp /></span>

                <span className="flex min-w-0 flex-col">

                    <span id={`${id}-choose`} className="text-small font-semibold">{chooseLabel}</span>

                    <span title={filename} dir="auto" className="truncate text-label text-muted">{filename || emptyLabel}</span>

                </span>

            </div>

            {hint ? <p id={`${id}-hint`} className="field-hint">{hint}</p> : null}

            {error ? <p id={`${id}-error`} role="alert" className="field-error"><WarningCircle weight="fill" />{error}</p> : null}

        </div>

    );

}
