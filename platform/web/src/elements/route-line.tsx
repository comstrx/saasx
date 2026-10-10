import type { ReactNode } from "react";

type Stop = { place: string; time?: string | null; detail?: string | null };
type Props = { from: Stop; to: Stop; middle?: ReactNode; icon?: ReactNode };

export default function RouteLine ({ from, to, middle, icon }: Props) {

    return (

        <div className="route-line">

            <div className="flex min-w-0 flex-col gap-0.5">

                {from.time ? <span className="font-latin text-h3 font-semibold tabular-nums text-ink" dir="ltr">{from.time}</span> : null}

                <span className="truncate text-small font-medium text-ink" dir="auto">{from.place}</span>

                {from.detail ? <span className="truncate text-label text-muted" dir="auto">{from.detail}</span> : null}

            </div>

            <div aria-hidden="true" className="route-track">

                <span className="route-dot" />

                <span className="route-rail" />

                <span className="route-badge">{icon}{middle}</span>

                <span className="route-rail" />

                <span className="route-dot route-dot-end" />

            </div>

            <div className="flex min-w-0 flex-col items-end gap-0.5 text-end">

                {to.time ? <span className="font-latin text-h3 font-semibold tabular-nums text-ink" dir="ltr">{to.time}</span> : null}

                <span className="truncate text-small font-medium text-ink" dir="auto">{to.place}</span>

                {to.detail ? <span className="truncate text-label text-muted" dir="auto">{to.detail}</span> : null}

            </div>

        </div>

    );

}
