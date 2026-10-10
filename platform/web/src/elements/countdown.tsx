"use client";

import { useEffect, useState } from "react";

type Props = { until: string; labels: { days: string; hours: string; minutes: string }; label: string; start?: number };

function parts ( until: number, now: number ) {

    const left = Math.max(0, until - now);
    const minutes = Math.floor(left / 60000);

    return { days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 };

}
function digits ( value: number | null ): string {

    return value === null ? "––" : String(value).padStart(2, "0");

}
export default function Countdown ({ until, labels, label, start }: Props) {

    const target = Date.parse(until);
    const [now, setNow] = useState<number | null>(start ?? null);

    useEffect(() => {

        setNow(Date.now());

        const timer = window.setInterval(() => setNow(Date.now()), 30000);

        return () => window.clearInterval(timer);

    }, []);

    if ( !Number.isFinite(target) ) return null;

    const left = parts(target, now ?? target);
    const units = [
        { key: "days", value: left.days, label: labels.days },
        { key: "hours", value: left.hours, label: labels.hours },
        { key: "minutes", value: left.minutes, label: labels.minutes },
    ];

    return (

        <div role="timer" aria-label={label} className="flex flex-wrap items-center gap-x-4 gap-y-2">

            {units.map(( unit ) => (

                <span key={unit.key} className="countdown-unit">

                    <span className="countdown-value" dir="ltr" suppressHydrationWarning>{digits(now === null ? null : unit.value)}</span>

                    <span className="text-small text-muted">{unit.label}</span>

                </span>

            ))}

        </div>

    );

}
