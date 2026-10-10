"use client";

import { useEffect, useState } from "react";

export function useCountdown ( deadline: number | null ) {

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {

        setNow(Date.now());

        if ( deadline === null || deadline <= Date.now() ) return;

        const timer = window.setInterval(() => {

            const current = Date.now();

            setNow(current);

            if ( current >= deadline ) window.clearInterval(timer);

        }, 1000);

        return () => window.clearInterval(timer);

    }, [deadline]);

    return deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));

}
