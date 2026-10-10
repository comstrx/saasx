import type { ReactNode } from "react";

type Props = { children: ReactNode; label?: string };

export default function FieldGroup ({ children, label }: Props) {

    return <fieldset aria-label={label} className="field-group">{children}</fieldset>;

}
