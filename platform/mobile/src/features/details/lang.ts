import type { TFunction } from "i18next";
import type { Terms, Trait } from "@/model/detail";
import { formatNumber } from "@/std/number";

export const traitText = ( item: Trait, t: TFunction, locale: string ): string => {

    if ( item.text && item.text !== item.value ) return item.text;

    if ( !item.value ) return "";

    const named = t(`details.featureValue.${ item.value }`, { defaultValue: "" });

    if ( named ) return named;

    const numeric = Number(item.value);
    const counted = item.value.trim() !== "" && Number.isFinite(numeric);
    const shown = counted ? formatNumber(locale, numeric) : item.value;

    return t(`details.featureUnit.${ item.key }`, { value: shown, defaultValue: shown, ...( counted ? { count: numeric } : {} ) });

};

type TermsWord = {
    label: string;
    note: string;
    tint: "success" | "warning" | "danger";
    icon: "shield" | "clock" | "alert";
};

export const termsWord = ( terms: Terms | null, t: TFunction, locale: string ): TermsWord | null => {

    if ( !terms ) return null;

    const hours = formatNumber(locale, terms.hours);
    const penalty = formatNumber(locale, terms.penalty);

    if ( !terms.refundable ) return {
        label: t("details.terms.none"),
        note: t("details.terms.noneBody"),
        tint: "danger",
        icon: "alert",
    };

    if ( terms.hours <= 0 ) return {
        label: t("details.terms.instant"),
        note: t("details.terms.partialBody", { percent: penalty }),
        tint: "warning",
        icon: "clock",
    };

    return {
        label: t("details.terms.free", { value: hours }),
        note: terms.penalty > 0
            ? t("details.terms.thenBody", { percent: penalty })
            : t("details.terms.fullBody"),
        tint: "success",
        icon: "shield",
    };

};
