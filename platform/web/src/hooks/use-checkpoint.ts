"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { storage } from "@/lib/std/browser";

type State<T> = { key: string; ready: boolean; restored: boolean; value: T | null; issue: boolean };
type Decoder<T> = ( value: unknown ) => T | null;

export function useCheckpoint<T> ( key: string, decode: Decoder<T> ) {

    const latest = useRef(decode);
    const [state, setState] = useState<State<T>>({ key, ready: false, restored: false, value: null, issue: false });

    useEffect(() => { latest.current = decode; }, [decode]);
    useEffect(() => {

        const saved = storage("session").inspect(key);
        const value = saved.state === "stored" ? latest.current(saved.value) : null;

        setState({
            key, ready: true, restored: !!value, value,
            issue: saved.state === "invalid" || saved.state === "unavailable" || saved.state === "stored" && !value,
        });

    }, [key]);

    const save = useCallback(( value: T | null ) => {

        const success = storage("session").write(key, value);

        setState(( previous ) => previous.key !== key ? previous : ({
            key, ready: true, restored: false,
            value: success || value !== null ? value : previous.value,
            issue: !success,
        }));

        return success;

    }, [key]);

    return {
        value: state.key === key ? state.value : null, ready: state.key === key && state.ready,
        restored: state.key === key && state.restored, issue: state.key === key && state.issue, save,
    };

}
