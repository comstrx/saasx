import { router } from "expo-router";
import { type ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Group } from "@/components/group";
import { type Option, Picker } from "@/components/picker";
import { Row } from "@/elements/row";
import { type Preference, useSavePreference } from "@/features/account/hooks/use-save-preference";
import { concepts } from "@/features/shell/concepts";
import { useLanguages } from "@/features/shell/hooks/use-languages";
import { currencies, currencyByCode } from "@/model/currency";
import { currencyHint, currencyLabel, currencySymbol, type ServedCurrency } from "@/model/vocabulary";
import { useServedCurrencies } from "@/query/vocabulary";
import { type ThemeMode, usePrefs } from "@/store/prefs";

const themeModes: readonly ThemeMode[] = [ "system", "light", "dark" ];

const isTheme = ( value: string ): value is ThemeMode => themeModes.includes(value as ThemeMode);

type PreferencesProps = {
    children?: ReactNode;
    title?: string | undefined;
    plated?: boolean | undefined;
};

export function Preferences ({ children, title, plated = true }: PreferencesProps) {

    const { t, i18n } = useTranslation();
    const persist = useSavePreference();

    const language = usePrefs(( state ) => state.language );
    const currency = usePrefs(( state ) => state.currency );
    const theme = usePrefs(( state ) => state.theme );
    const setCurrency = usePrefs(( state ) => state.setCurrency );
    const setTheme = usePrefs(( state ) => state.setTheme );

    const [ picking, setPicking ] = useState<Preference | null>(null);

    const arabic = i18n.language === "ar";
    const servedCurrencies = useServedCurrencies();
    const languages = useLanguages();

    const offeredCurrencies = useMemo<readonly ServedCurrency[]>(() => {

        const served = servedCurrencies.data ?? [];

        if ( served.length > 0 ) return served;

        return currencies.map(( item ) => ({ code: item.code, name: item.en, native: item.ar, symbol: item.symbol, digits: item.digits }));

    }, [ servedCurrencies.data ]);

    const currencyOptions = useMemo<readonly Option[]>(() => offeredCurrencies.map(( item ) => ({
        key: item.code,
        label: currencyLabel(item, arabic),
        note: currencyHint(item, arabic),
        flag: currencyByCode.get(item.code)?.flag,
        terms: [ item.code, currencySymbol(item, arabic), item.native, item.name ],
    })), [ arabic, offeredCurrencies ]);

    const themeOptions = useMemo<readonly Option[]>(() => themeModes.map(( value ) => ({
        key: value,
        label: t(`settings.themeMode.${ value }`),
        icon: value === "dark" ? "moon" : value === "light" ? "sun" : "device",
        terms: [ value, t(`settings.themeMode.${ value }`) ],
    })), [ t ]);

    const save = ( field: Preference, value: string, apply: () => void ) => {

        setPicking(null);
        persist(field, value, apply);

    };

    const pickCurrency = ( value: string ) => save("currency", value, () => setCurrency(value) );
    const pickTheme = ( value: string ) => {

        if ( isTheme(value) ) save("theme", value, () => setTheme(value) );

    };

    const pickedLocale = languages.find(( item ) => item.key === language );
    const pickedCurrency = offeredCurrencies.find(( item ) => item.code === currency );

    return (
        <>
            <Group title={title}>
                <Row
                    key="language"
                    plated={plated}
                    tone={concepts.language}
                    icon="language"
                    title={t("settings.language")}
                    note={t("settings.languageNote")}
                    value={pickedLocale ? pickedLocale.label : language.toUpperCase()}
                    onPress={() => router.push("/language") }
                />
                <Row
                    key="currency"
                    plated={plated}
                    tone={concepts.currency}
                    icon="card"
                    title={t("settings.currency")}
                    note={t("settings.currencyNote")}
                    value={pickedCurrency ? currencyLabel(pickedCurrency, arabic) : currency}
                    onPress={() => setPicking("currency") }
                />
                <Row
                    key="theme"
                    plated={plated}
                    tone={concepts.appearance}
                    icon={theme === "dark" ? "moon" : theme === "light" ? "sun" : "device"}
                    title={t("settings.theme")}
                    note={t("settings.themeNote")}
                    value={t(`settings.themeMode.${ theme }`)}
                    onPress={() => setPicking("theme") }
                />
                {children}
            </Group>

            <Picker
                open={picking === "currency"}
                onClose={() => setPicking(null) }
                title={t("settings.currency")}
                hint={t("settings.searchCurrency")}
                options={currencyOptions}
                value={currency}
                onPick={pickCurrency}
                empty={t("common.noMatches")}
            />

            <Picker
                open={picking === "theme"}
                onClose={() => setPicking(null) }
                title={t("settings.theme")}
                hint={t("settings.searchTheme")}
                options={themeOptions}
                value={theme}
                onPick={pickTheme}
                empty={t("common.noMatches")}
                searchable={false}
            />
        </>
    );

}
