import type { ReactNode } from "react";
import { X } from "@/lib/providers/icons";

type Props = { icon?: ReactNode; as?: "span" | "li"; children: ReactNode; onRemove?: () => void; removeLabel?: string };

export default function Tag ({ icon, as: Box = "span", children, onRemove, removeLabel }: Props) {

    return (

        <Box className="tag">

            {icon}

            <span dir="auto">{children}</span>

            {onRemove ? (

                <button type="button" aria-label={removeLabel} className="tag-remove" onClick={onRemove}><X weight="bold" /></button>

            ) : null}

        </Box>

    );

}
