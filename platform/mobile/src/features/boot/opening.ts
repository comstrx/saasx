import { useEffect, useRef, useState } from "react";

export function useOpening ( duration: number, enabled = true ): boolean {

    const started = useRef<number | null>(null);
    const [ elapsed, setElapsed ] = useState(false);

    useEffect(() => {

        if ( !enabled ) return;

        started.current ??= Date.now();
        const remaining = Math.max(0, duration - ( Date.now() - started.current ));
        const timer = setTimeout(() => setElapsed(true), remaining);

        return () => clearTimeout(timer);

    }, [ duration, enabled ]);

    return elapsed;

}
