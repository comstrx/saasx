"use client";

import { useMemo, useState } from "react";
import { useCurrency, useLocale } from "@/hooks/use-preferences";
import { useLocale as useCurrentLocale, useTranslations } from "@/lib/providers/intl";
import { type Locale, languages } from "@/lib/spec/languages";
import { hasGlyph } from "@/lib/std/format";
import { issuer } from "@/lib/std/geo";

type Tab = "language" | "currency";

export function useLocalePicker () {

    const t = useTranslations("preferences");
    const current = useCurrentLocale();
    const language = useLocale();
    const currency = useCurrency();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>("language");
    const names = useMemo(() => ({
        languages: new Intl.DisplayNames([current], { type: "language" }),
        currencies: new Intl.DisplayNames([current], { type: "currency" }),
        order: new Intl.Collator(current),
    }), [current]);
    const tongues = language.options.map(( code: Locale ) => ({
        value: code,
        label: languages[code].label,
        lang: code,
        detail: code === current ? undefined : names.languages.of(code),
        flag: languages[code].flag,
    }));
    const monies = currency.options
        .map(( code ) => ({ value: code, label: names.currencies.of(code) ?? code, detail: code, flag: issuer(code) }))
        .sort(( a, b ) => names.order.compare(a.label, b.label));

    return {
        open,
        setOpen,
        tab,
        setTab: ( next: string ) => setTab(next === "currency" ? "currency" : "language"),
        label: `${t("label")}: ${languages[current].label} · ${currency.value}`,
        title: t("title"),
        tabs: { language: t("language"), currency: t("currency") },
        flag: languages[current].flag,
        language: languages[current].label,
        currency: currency.value,
        glyph: hasGlyph(currency.value),
        locale: current,
        languages: tongues,
        currencies: monies,
        pending: language.pending || currency.pending,
        failed: language.failed || currency.failed ? t("failed") : null,
        chooseLanguage: language.change,
        chooseCurrency: currency.change,
    };

}
