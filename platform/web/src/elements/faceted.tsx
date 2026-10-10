import type { ReactNode } from "react";

type Props = { label: string; side: ReactNode; children: ReactNode };

export default function Faceted ({ label, side, children }: Props) {

    return (

        <div className="faceted">

            <aside aria-label={label} className="faceted-side">{side}</aside>

            <div className="faceted-main">{children}</div>

        </div>

    );

}
