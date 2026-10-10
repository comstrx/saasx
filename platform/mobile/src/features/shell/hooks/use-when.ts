import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatClock, formatDate, formatDay, formatMoment, formatMonth, formatSince, formatStamp } from "@/std/number";

export type When = {
    date: ( value: string | null | undefined ) => string;
    moment: ( value: string | null | undefined ) => string;
    clock: ( value: string | null | undefined ) => string;
    day: ( value: string | null | undefined ) => string;
    month: ( value: string | null | undefined ) => string;
    stamp: ( value: string | null | undefined ) => string;
    since: ( value: string | null | undefined ) => string;
};

export function useWhen (): When {

    const { t, i18n } = useTranslation();
    const locale = i18n.language;
    const yesterday = t("common.yesterday");
    const today = t("common.today");

    return useMemo(() => ({
        date: ( value ) => formatDate(locale, value),
        moment: ( value ) => formatMoment(locale, value),
        clock: ( value ) => formatClock(locale, value),
        day: ( value ) => formatDay(locale, value),
        month: ( value ) => formatMonth(locale, value),
        stamp: ( value ) => formatStamp(locale, value, yesterday),
        since: ( value ) => formatSince(locale, value, today, yesterday),
    }), [ locale, today, yesterday ]);

}
