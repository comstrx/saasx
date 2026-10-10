"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { nextDate } from "@/lib/std/availability";
import type { BookingRules, BookingValues } from "@/lib/std/checkout";
import { days } from "@/lib/std/format";
import { calendarDate, type DateRange, dateValue } from "@/lib/std/search";

type Change = ( patch: Partial<BookingValues> ) => void;

export function useBookingFields ( values: BookingValues, rules: BookingRules, today: string, onChange: Change ) {

    const locale = useLocale() as "ar" | "en";
    const t = useTranslations("checkout");
    const search = useTranslations("search");
    const [open, setOpen] = useState(false);
    const from = calendarDate(values.starts_at);
    const to = rules.range ? calendarDate(values.ends_at) : undefined;
    const earliest = rules.insured ? nextDate(today) : today;

    function choose ( next: DateRange ) {

        onChange({
            starts_at: next.from ? dateValue(next.from) : "",
            ends_at: rules.range ? (next.to ? dateValue(next.to) : "") : values.ends_at,
            slot: "",
        });

    }

    return {
        locale, t, search, open, setOpen, choose,
        range: { from, to } satisfies DateRange,
        minimum: calendarDate(earliest) ?? new Date(),
        label: t(rules.insured ? "coveragePeriod" : rules.range ? "stayDates" : "date"),
        summary: from ? days(from, to ?? from, locale) : search("addDates"),
        counts: rules.party ? ["quantity", "adults", "children", "infants"] as const : ["quantity"] as const,
    };

}
