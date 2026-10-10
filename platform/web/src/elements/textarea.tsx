import type { TextareaHTMLAttributes } from "react";
import { WarningCircle } from "@/lib/providers/icons";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "style"> & {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    optional?: string;
    labelHidden?: boolean;
};

export default function Textarea ({ id, label, hint, error, optional, labelHidden, ...props }: Props) {

    const help = hint ? `${id}-hint` : undefined;
    const failure = error ? `${id}-error` : undefined;

    return (

        <div className="flex min-w-0 flex-col gap-2">

            <label htmlFor={id} className={labelHidden ? "sr-only" : "field-label"}>

                {label}

                {optional ? <span className="font-normal text-muted"> {optional}</span> : null}

            </label>

            <div
                data-invalid={error ? "" : undefined}
                data-disabled={props.disabled ? "" : undefined}
                className="field-shell items-stretch"
            >

                <textarea
                    {...props}
                    id={id}
                    rows={props.rows ?? 4}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={[help, failure, props["aria-describedby"]].filter(Boolean).join(" ") || undefined}
                    className="field-input field-grow min-h-28 resize-y py-3"
                />

            </div>

            {hint ? <p id={help} className="field-hint">{hint}</p> : null}

            {error ? <p id={failure} role="alert" className="field-error"><WarningCircle weight="fill" />{error}</p> : null}

        </div>

    );

}
