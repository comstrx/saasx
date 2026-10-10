"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useBusyItems () {

    const [items, setItems] = useState<ReadonlySet<string>>(new Set());
    const update = useCallback(( key: string, busy: boolean ) => {

        setItems(( previous ) => {

            if ( previous.has(key) === busy ) return previous;

            const next = new Set(previous);

            if ( busy ) next.add(key);
            else next.delete(key);

            return next;

        });

    }, []);

    return { items, update, busy: items.size > 0 };

}
export function useBusySignal ( busy: boolean, onBusy?: ( busy: boolean ) => void ) {

    const current = useRef(onBusy);

    useEffect(() => { current.current = onBusy; }, [onBusy]);
    useEffect(() => { current.current?.(busy); }, [busy]);
    useEffect(() => () => current.current?.(false), []);

}
