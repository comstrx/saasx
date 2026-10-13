import type { ReactNode } from "react";

type Props = { label: string; type?: "button" | "submit" | undefined; tone?: "primary" | "ghost" | "danger" | undefined; busy?: boolean | undefined; disabled?: boolean | undefined; icon?: ReactNode | undefined; onPress?: (() => void) | undefined };

export default function Button ({ label, type = "button", tone = "primary", busy = false, disabled = false, icon, onPress }: Props) {
    return (

        <button type={type} className="button" data-tone={tone} data-busy={busy ? "" : undefined} disabled={disabled || busy} aria-busy={busy} onClick={onPress}>

            {icon}

            <span className="button-label">{label}</span>

        </button>

    );
}
