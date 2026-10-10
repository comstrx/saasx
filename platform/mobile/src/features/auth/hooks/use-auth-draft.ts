import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { BackHandler } from "react-native";
import { useSubmit } from "@/features/shell/hooks/use-submit";

export function useAuthDraft<T extends object> ( initial: T, owned: readonly string[], alias?: Record<string, string> ) {

    const [ form, setForm ] = useState(initial);
    const submission = useSubmit(owned, alias, "form");
    const { reset } = submission;

    const clear = useCallback(() => { reset(); setForm(initial); }, [ initial, reset ]);

    useFocusEffect(useCallback(() => clear, [ clear ]));

    const patch = useCallback(( value: Partial<T> ) => setForm(( current ) => ({ ...current, ...value })), []);

    const edit = useCallback(( value: Partial<T> ) => { reset(); patch(value); }, [ reset, patch ]);

    const change = <K extends keyof T>( name: K ) => ( value: T[K] ) => {

        reset();
        setForm(( current ) => ({ ...current, [name]: value }));

    };

    return { ...submission, form, patch, edit, change, clear };

}

export function useAuthBack ( back: () => void ) {

    const latest = useRef(back);
    latest.current = back;

    useFocusEffect(useCallback(() => {

        const listener = BackHandler.addEventListener("hardwareBackPress", () => { latest.current(); return true; });

        return () => listener.remove();

    }, []));

}

export function useAuthCleanup ( cleanup: () => void ) {

    const latest = useRef(cleanup);
    latest.current = cleanup;
    useFocusEffect(useCallback(() => () => latest.current(), []));

}
