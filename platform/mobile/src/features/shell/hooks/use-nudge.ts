import { useIsFocused } from "expo-router";
import { useEffect } from "react";
import { dayKey } from "@/std/number";
import { notify } from "@/store/notice";
import { usePrefs } from "@/store/prefs";
import { useTheme } from "@/theme/use-theme";

export function useNudge ( key: string, message: string | null ) {

    const theme = useTheme();
    const focused = useIsFocused();
    const seen = usePrefs(( state ) => state.seen );
    const see = usePrefs(( state ) => state.see );

    useEffect(() => {

        const gate = `nudge:${ key }:${ dayKey() }`;

        if ( !focused || !message || seen[gate] ) return;

        const soon = setTimeout(() => {

            see(gate);
            notify(message, "delight");

        }, theme.beat.slow);

        return () => clearTimeout(soon);

    }, [ focused, message, key, seen, see, theme.beat.slow ]);

}
