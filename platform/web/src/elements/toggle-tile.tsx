import type { ReactNode } from "react";
import { Check } from "@/lib/providers/icons";

type Props = { label: string; icon: ReactNode; pressed: boolean; disabled?: boolean; onToggle: () => void };

export default function ToggleTile ({ label, icon, pressed, disabled, onToggle }: Props) {

    return (

        <button type="button" aria-pressed={pressed} disabled={disabled} onClick={onToggle} className="toggle-tile">

            {pressed ? <span aria-hidden="true" className="toggle-tile-check"><Check weight="bold" /></span> : null}

            <span aria-hidden="true" className="toggle-tile-icon">{icon}</span>

            <span className="toggle-tile-label">{label}</span>

        </button>

    );

}
