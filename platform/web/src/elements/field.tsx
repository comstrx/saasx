import type { InputHTMLAttributes, ReactNode } from "react";
import { WarningCircle } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "style" | "size"> & VariantProps<typeof field> & {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    optional?: string;
    start?: ReactNode;
    end?: ReactNode;
    controlDirection?: "ltr" | "rtl";
    labelHidden?: boolean;
};

const field = tv({
    slots: {
        root: "flex min-w-0 flex-col gap-2",
        label: "field-label",
        shell: "field-shell",
        input: "field-input",
    },
    variants: {
        size: {
            small: { shell: "field-sm" },
            medium: {},
            large: { shell: "field-lg" },
        },
        layout: {
            standard: {},
            stacked: {
                shell: "field-lg items-stretch",
                label: "pointer-events-none absolute start-3.5 top-2 text-micro font-medium text-muted",
                input: "pt-5 text-base",
            },
        },
    },
    defaultVariants: { size: "medium", layout: "standard" },
});

export default function Field ({
    id, label, hint, error, optional, start, end, controlDirection, labelHidden, size, layout, ...props
}: Props) {

    const look = field({ size, layout });
    const help = hint ? `${id}-hint` : undefined;
    const failure = error ? `${id}-error` : undefined;
    const caption = (
        <label htmlFor={id} className={labelHidden ? "sr-only" : look.label()}>
            {label}
            {optional ? <span className="font-normal text-muted"> {optional}</span> : null}
        </label>
    );

    return (

        <div className={look.root()}>

            {layout !== "stacked" ? caption : null}

            <div
                dir={controlDirection}
                data-invalid={error ? "" : undefined}
                data-disabled={props.disabled ? "" : undefined}
                className={look.shell()}
            >

                {layout === "stacked" ? caption : null}

                {start ? <span className="field-affix">{start}</span> : null}

                <input
                    {...props}
                    id={id}
                    className={look.input()}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={[help, failure, props["aria-describedby"]].filter(Boolean).join(" ") || undefined}
                />

                {end ? <span className="field-affix">{end}</span> : null}

            </div>

            {hint ? <p id={help} className="field-hint">{hint}</p> : null}

            {error ? <p id={failure} role="alert" className="field-error"><WarningCircle weight="fill" />{error}</p> : null}

        </div>

    );

}
