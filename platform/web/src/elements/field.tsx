import type { ReactNode } from "react";

type Props = { id: string; label: string; error?: string | undefined; children: ReactNode };

export default function Field ({ id, label, error, children }: Props) {
    return (

        <div className="field" data-invalid={error ? "" : undefined}>

            <label className="field-label" htmlFor={id}>{label}</label>

            {children}

            {error ? <span className="field-error" role="alert">{error}</span> : null}

        </div>

    );
}
