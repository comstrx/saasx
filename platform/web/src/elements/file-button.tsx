import type { ReactNode } from "react";

type Props = {
    id: string; label: string; accept?: string; multiple?: boolean; disabled?: boolean; children: ReactNode;
    onFiles: ( files: File[] ) => void;
};

export default function FileButton ({ id, label, accept, multiple, disabled, children, onFiles }: Props) {

    return (

        <label htmlFor={id} aria-label={label} title={label} data-disabled={disabled || undefined} className="file-button">

            {children}

            <input
                id={id}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                className="sr-only"
                onChange={( event ) => { onFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }}
            />

        </label>

    );

}
