import { useEffect, useRef } from "react";
import { preferencesOf, samePreferences } from "@/model/account";
import { useAccount, useSavePreferences } from "@/query/account";
import { useViewer } from "@/query/wire";
import { key } from "@/std/key";
import { type ThemeMode, usePrefs } from "@/store/prefs";

const themeModes: readonly ThemeMode[] = [ "system", "light", "dark" ];

const isTheme = ( value: string ): value is ThemeMode => themeModes.includes(value as ThemeMode);

export function Adopt () {

    const profile = useAccount();
    const served = profile.data?.preferences;
    const viewer = useViewer();
    const pending = usePrefs(( state ) => state.inheritFor );
    const language = usePrefs(( state ) => state.language );
    const currency = usePrefs(( state ) => state.currency );
    const theme = usePrefs(( state ) => state.theme );
    const { mutate: save } = useSavePreferences();
    const attempted = useRef("");
    const told = useRef(0);

    useEffect(() => {

        if ( !viewer || profile.data?.id !== viewer || !served ) return;

        const store = usePrefs.getState();

        if ( pending === viewer ) {

            const patch = preferencesOf({ language, currency, theme });

            if ( samePreferences(served, patch) ) {

                store.inherited(viewer);
                return;

            }

            const stamp = JSON.stringify([ viewer, patch, profile.dataUpdatedAt ]);

            if ( attempted.current === stamp ) return;
            attempted.current = stamp;
            save({ patch, viewer, attempt: key.attempt("account-inherit") });
            return;

        }

        const patch = {
            ...( served.currency && served.currency !== currency ? { currency: served.currency } : {} ),
            ...( served.language && served.language !== language ? { language: served.language } : {} ),
            ...( served.theme && isTheme(served.theme) && served.theme !== theme ? { theme: served.theme } : {} ),
        };

        if ( Object.keys(patch).length ) store.adopt(patch);

        if ( served.language || told.current === viewer ) return;

        told.current = viewer;
        save({ patch: { language }, viewer, attempt: key.attempt("account-language") });

    }, [ served, profile.data?.id, profile.dataUpdatedAt, viewer, pending, language, currency, theme, save ]);

    return null;

}
