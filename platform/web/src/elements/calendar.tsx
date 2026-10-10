"use client";

import { ar, DayPicker, en } from "@/lib/providers/calendar";
import type { DateRange } from "@/lib/std/search";

type Props = {
    locale: "ar" | "en";
    value: DateRange;
    mode?: "range" | "single";
    months?: 1 | 2;
    minimum: Date;
    disabled?: readonly Date[];
    onChange: ( value: DateRange ) => void;
};

const classNames = {
    root: "calendar-root",
    months: "calendar-months",
    month: "calendar-month",
    month_caption: "calendar-caption",
    caption_label: "text-base font-semibold text-ink",
    nav: "calendar-nav-row",
    button_previous: "calendar-nav",
    button_next: "calendar-nav",
    chevron: "size-4 fill-current rtl:-scale-x-100",
    month_grid: "w-full border-collapse",
    weekdays: "flex",
    weekday: "calendar-cell grid place-items-center text-micro font-semibold text-muted",
    week: "flex",
    day: "calendar-day",
    day_button: "calendar-day-button",
    today: "calendar-today",
    selected: "calendar-selected",
    range_start: "calendar-range-start",
    range_end: "calendar-range-end",
    range_middle: "calendar-range-middle",
    disabled: "calendar-disabled",
    outside: "invisible",
    hidden: "invisible",
};

export default function Calendar ({ locale, value, mode = "range", months = 1, minimum, disabled = [], onChange }: Props) {

    const weekdays = new Intl.DateTimeFormat(locale, { weekday: locale === "ar" ? "narrow" : "short" });
    const props = {
        locale: locale === "ar" ? ar : en,
        dir: locale === "ar" ? "rtl" : "ltr",
        numerals: "latn" as const,
        numberOfMonths: months,
        defaultMonth: value.from ?? minimum,
        startMonth: minimum,
        disabled: [{ before: minimum }, ...disabled],
        showOutsideDays: false,
        classNames,
        formatters: { formatWeekdayName: ( day: Date ) => weekdays.format(day) },
    };

    return mode === "single" ? (

        <DayPicker {...props} mode="single" selected={value.from} onSelect={( from ) => onChange({ from })} />

    ) : (

        <DayPicker
            {...props}
            mode="range"
            min={1}
            selected={value.from ? { from: value.from, to: value.to } : undefined}
            onSelect={( range ) => onChange({ from: range?.from, to: range?.to })}
            excludeDisabled
        />

    );

}
