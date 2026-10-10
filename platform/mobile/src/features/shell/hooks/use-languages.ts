import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { shippedLocales } from "@/brand/i18n";
import { languageByCode, languages } from "@/model/language";
import { localeHint, localeLabel, type ServedLocale } from "@/model/vocabulary";
import { useServedLocales } from "@/query/vocabulary";

type LanguageOption = {
    key: string;
    label: string;
    note: string;
    flag: string | undefined;
    terms: readonly string[];
};

export function useLanguages (): readonly LanguageOption[] {

    const { i18n } = useTranslation();
    const served = useServedLocales();

    const arabic = i18n.language === "ar";
    const offered = served.data;

    return useMemo(() => {

        const rows: readonly ServedLocale[] = offered && offered.length > 0
            ? offered
            : languages.map(( item ) => ({ code: item.code, name: item.en, native: item.native, rtl: item.rtl }) );

        return rows
            .filter(( item ) => shippedLocales.includes(item.code) )
            .map(( item ) => ({
                key: item.code,
                label: localeLabel(item),
                note: localeHint(item, arabic),
                flag: languageByCode.get(item.code)?.flag,
                terms: [ localeLabel(item), item.native, item.name, item.code ],
            }));

    }, [ arabic, offered ]);

}
