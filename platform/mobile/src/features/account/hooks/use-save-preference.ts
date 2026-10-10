import { useTranslation } from "react-i18next";
import { useSavePreferences } from "@/query/account";
import { useViewer } from "@/query/wire";
import { key } from "@/std/key";
import { notify } from "@/store/notice";
import { usePrefs } from "@/store/prefs";
import { useSession } from "@/store/session";

export type Preference = "language" | "currency" | "theme";

export function useSavePreference () {

    const { t } = useTranslation();
    const saving = useSavePreferences();
    const token = useSession(( state ) => state.token );
    const viewer = useViewer();

    return ( field: Preference, value: string, apply: () => void ) => {

        apply();

        if ( !token ) return;

        if ( viewer ) usePrefs.getState().inherit(viewer);

        saving.mutateAsync({ patch: { [field]: value }, attempt: key.attempt("account-preferences") }).then(
            () => notify(t("settings.saved"), "success"),
            () => notify(t("settings.savedHere"), "info"),
        );

    };

}
