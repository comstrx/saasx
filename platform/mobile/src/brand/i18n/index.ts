import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { bundles } from "@/brand/i18n/locales";
import { wordsFor } from "@/brand/identity";
import { installPluralRules } from "@/std/plural";

installPluralRules();

const dictionaries = Object.fromEntries(
    Object.entries(bundles).map(([ code, translation ]) => [ code, { translation: { ...translation, brand: wordsFor(code) } } ] ),
);

const refreshDictionaries = () => {

    for ( const [ code, bundle ] of Object.entries(dictionaries) ) i18n.addResourceBundle(code, "translation", bundle.translation, true, true);

};

if ( typeof __DEV__ !== "undefined" && __DEV__ && i18n.isInitialized ) {

    refreshDictionaries();

}

export const shippedLocales: readonly string[] = Object.keys(bundles);

export const uiLocale = ( language: string ): string => shippedLocales.includes(language) ? language : "en";

export const start = ( language: string ) => {

    const locale = uiLocale(language);

    if ( i18n.isInitialized ) {

        refreshDictionaries();

        return i18n.changeLanguage(locale);

    }

    return i18n.use(initReactI18next).init({
        resources: dictionaries,
        lng: locale,
        fallbackLng: "en",
        interpolation: { escapeValue: false },
        returnNull: false,
        react: { bindI18nStore: "added removed" },
    });

};

export { i18n };
