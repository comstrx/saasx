"use client";

import { useEffect, useState } from "react";
import { instant } from "@/lib/std/format";

export function useExpiry ( value: string | null | undefined ) {

    const deadline = value ? instant(value) : Number.NaN;
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {

        let timer: number | undefined;
        const update = () => {

            const current = Date.now();

            setNow(current);

            if ( Number.isFinite(deadline) && deadline > current ) {

                timer = window.setTimeout(update, Math.min(2147483647, deadline - current + 1));

            }

        };

        update();

        return () => window.clearTimeout(timer);

    }, [deadline]);

    return !Number.isFinite(deadline) || now >= deadline;

}
