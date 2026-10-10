"use client";

import { useId } from "react";
import { useAppearance, useCurrency, useLocale } from "@/hooks/use-preferences";
import { useLocale as useCurrentLocale, useTranslations } from "@/lib/providers/intl";
import { languages } from "@/lib/spec/languages";

export function useDisplayPreferences () {

    const t = useTranslations("account");
    const prefix = useId();
    const locale = useCurrentLocale();
    const language = useLocale();
    const currency = useCurrency();
    const appearance = useAppearance();
    const names = new Intl.DisplayNames([locale], { type: "currency" });

    return {
        t,
        groups: [
            {
                key: "language" as const, ...language,
                options: language.options.map(( code ) => ({ value: code, label: languages[code].label })),
            },
            {
                key: "currency" as const, ...currency,
                options: currency.options.map(( code ) => ({ value: code, label: `${code} · ${names.of(code) ?? code}` })),
            },
            {
                key: "appearance" as const, ...appearance,
                options: appearance.options.map(( value ) => ({ value, label: t(`themes.${value}`) })),
            },
        ].map(( item ) => ({ ...item, id: `${prefix}-${item.key}` })),
    };

}
