import type { ReactNode } from "react";

type Props = { legend: string; description?: string; children: ReactNode; disabled?: boolean };

export default function Fieldset ({ legend, description, children, disabled }: Props) {

    return (

        <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-4 border-0 p-0">

            <legend className="mb-1 text-title font-semibold text-ink">{legend}</legend>

            {description ? <p className="-mt-2 text-small text-muted">{description}</p> : null}

            {children}

        </fieldset>

    );

}
