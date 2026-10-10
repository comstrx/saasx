import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Picker } from "@/components/picker";
import { Round } from "@/elements/round";
import { useLanguages } from "@/features/shell/hooks/use-languages";
import { usePrefs } from "@/store/prefs";
import { useTheme } from "@/theme/use-theme";

export function ThemeSwitch () {

    const { t } = useTranslation();
    const theme = useTheme();
    const setTheme = usePrefs(( state ) => state.setTheme );

    const dark = theme.name === "dark";

    return <Round icon={dark ? "sun" : "moon"} onPress={() => setTheme(dark ? "light" : "dark") } label={t("common.theme")} />;

}

export function LanguageSwitch () {

    const { t } = useTranslation();
    const language = usePrefs(( state ) => state.language );
    const setLanguage = usePrefs(( state ) => state.setLanguage );
    const [ picking, setPicking ] = useState(false);

    const languages = useLanguages();

    return (
        <>
            <Round icon="globe" onPress={() => setPicking(true) } label={t("common.language")} />

            <Picker
                open={picking}
                onClose={() => setPicking(false) }
                title={t("common.language")}
                hint={t("common.searchLanguage")}
                options={languages}
                value={language}
                onPick={setLanguage}
                empty={t("common.noMatches")}
                searchable={false}
            />
        </>
    );

}
