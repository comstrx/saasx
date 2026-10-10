import type { ReactNode } from "react";

type Props = { direction?: "horizontal" | "vertical"; label?: ReactNode; inset?: boolean };

export default function Divider ({ direction = "horizontal", label, inset }: Props) {

    if ( direction === "vertical" ) return <span aria-hidden="true" className="h-7 w-px shrink-0 self-center bg-strong" />;

    if ( label ) return (

        <div className="flex min-w-0 items-center gap-3 text-label text-muted">

            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            <span className="shrink-0">{label}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />

        </div>

    );

    return <hr className={inset ? "mx-4 border-0 border-t border-line" : "w-full border-0 border-t border-line"} />;

}
