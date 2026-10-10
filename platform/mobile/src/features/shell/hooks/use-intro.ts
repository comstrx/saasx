import { useIsFocused } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { usePrefs } from "@/store/prefs";
import { beats } from "@/theme/motion";

const gates = "menu:";

export function useIntro ( page: string, hold = false ) {

    const focused = useIsFocused();
    const gate = `${ gates }${ page }`;
    const seen = usePrefs(( state ) => Boolean(state.seen[gate]) );
    const see = usePrefs(( state ) => state.see );
    const [ open, setOpen ] = useState(false);

    useEffect(() => {

        if ( seen || hold || !focused ) {

            setOpen(false);

            return;

        }

        const timer = setTimeout(() => setOpen(true), beats.calm);

        return () => clearTimeout(timer);

    }, [ seen, hold, focused ]);

    const onClose = useCallback(() => {

        setOpen(false);
        see(gate);

    }, [ gate, see ]);

    return { open: open && focused, onClose };

}

export function useReplayIntros () {

    const forget = usePrefs(( state ) => state.forget );

    return useCallback(() => forget(gates), [ forget ]);

}
