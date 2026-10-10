import { isolateLtr } from "@/std/bidi";
import { digitsLocale as latin } from "@/std/locale";

const zoned = /(?:z|[+-]\d{2}:?\d{2})$/i;

const dated = /^\d{4}-\d{2}-\d{2}$/;

export const stampOf = ( value: string | null | undefined ): Date | null => {

    if ( !value ) return null;

    const text = value.trim();
    const iso = dated.test(text) ? `${ text }T12:00:00Z` : zoned.test(text) ? text.replace(" ", "T") : `${ text.replace(" ", "T") }Z`;
    const parsed = new Date(iso);

    return Number.isNaN(parsed.getTime()) ? null : parsed;

};

const at = stampOf;

export const timer = ( seconds: number ): string => {

    const total = Math.max(0, Math.floor(seconds));

    return `${ Math.floor(total / 60) }:${ String(total % 60).padStart(2, "0") }`;

};

export const secondsUntil = ( value: string | null | undefined, now = Date.now() ): number => {

    const moment = at(value);

    return moment ? Math.max(0, Math.ceil(( moment.getTime() - now ) / 1000)) : 0;

};

export const decimal = ( amount: number, digits: number ): string =>
    ( Number.isFinite(amount) ? amount : 0 ).toFixed(Math.max(0, Math.round(digits)));

export const calendarDay = ( value: string | null | undefined ): string | null => {

    const text = value?.trim() ?? "";

    return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : null;

};

export const clamp = ( value: number, minimum: number, maximum: number ): number =>
    Math.min(maximum, Math.max(minimum, value));

const tallyCeiling = 99;

export const tally = ( count: number ): string =>
    count > tallyCeiling ? `${ tallyCeiling }+` : String(count);

export const formatNumber = ( locale: string, value: number, maximumFractionDigits = 0 ): string =>
    new Intl.NumberFormat(latin(locale), { maximumFractionDigits }).format(value);

const worded = /\p{L}$/u;
const arabic = /\p{Script=Arabic}/u;

export const symbolLeads = ( symbol: string ): boolean => !arabic.test(symbol);

export const formatAmount = ( locale: string, symbol: string, value: number, fractionDigits = 3 ): string => {

    const rounded = Number(value.toFixed(fractionDigits));

    const digits = new Intl.NumberFormat(latin(locale), {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(Math.abs(rounded));

    const signed = `${ rounded < 0 ? "-" : "" }${ digits }`;

    return symbolLeads(symbol)
        ? isolateLtr(`${ symbol }${ worded.test(symbol) ? "\u00a0" : "" }${ signed }`)
        : `${ isolateLtr(signed) }\u00a0${ symbol }`;

};

const dateShapes: Record<"short" | "medium" | "month", Intl.DateTimeFormatOptions> = {
    short: { day: "numeric", month: "numeric", year: "numeric" },
    medium: { day: "numeric", month: "long", year: "numeric" },
    month: { month: "long", year: "numeric" },
};

export const formatDate = ( locale: string, value: string | null | undefined, style: keyof typeof dateShapes = "medium" ): string => {

    const parsed = at(value);

    if ( !parsed ) return "";

    const shape = dateShapes[style];

    return new Intl.DateTimeFormat(latin(locale), shape).format(parsed);

};

const plainDay = /^\d{4}-\d{2}-\d{2}(?:[ T]00:00(?::00)?(?:z|[+-]\d{2}:?\d{2})?)?$/i;

const tied = ( format: Intl.DateTimeFormat, date: Date ): string => {

    if ( typeof format.formatToParts !== "function" ) return format.format(date);

    const parts = format.formatToParts(date);

    return parts.map(( part, index ) => part.type === "literal" && parts[index + 1]?.type === "dayPeriod" ? part.value.replaceAll(" ", "\u00a0") : part.value ).join("");

};

export const formatMoment = ( locale: string, value: string | null | undefined ): string => {

    const parsed = at(value);

    if ( parsed && plainDay.test(value?.trim() ?? "") ) return formatDate(locale, value);

    return parsed
        ? tied(new Intl.DateTimeFormat(latin(locale), {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }), parsed)
        : "";

};

export const formatDay = ( locale: string, value: string | null | undefined ): string => {

    const parsed = at(value);

    return parsed ? new Intl.DateTimeFormat(latin(locale), { day: "numeric" }).format(parsed) : "";

};

export const formatMonth = ( locale: string, value: string | null | undefined ): string => {

    const parsed = at(value);

    return parsed ? new Intl.DateTimeFormat(latin(locale), { month: "short" }).format(parsed) : "";

};

export const formatClock = ( locale: string, value: string | null | undefined ): string => {

    const parsed = at(value);

    return parsed
        ? tied(new Intl.DateTimeFormat(latin(locale), { hour: "numeric", minute: "2-digit" }), parsed)
        : "";

};

const midnight = ( date: Date ): number => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const formatSince = ( locale: string, value: string | null | undefined, today: string, yesterday: string ): string => {

    const parsed = at(value);

    if ( !parsed ) return "";

    const days = Math.round(( midnight(new Date()) - midnight(parsed) ) / 86400000);

    if ( days <= 0 ) return today;
    if ( days === 1 ) return yesterday;
    if ( days < 7 ) return new Intl.DateTimeFormat(latin(locale), { weekday: "long" }).format(parsed);

    return formatDate(locale, value, "short");

};

export const formatStamp = ( locale: string, value: string | null | undefined, yesterday: string ): string => {

    const parsed = at(value);

    if ( !parsed ) return "";

    const days = Math.round(( midnight(new Date()) - midnight(parsed) ) / 86400000);

    if ( days <= 0 ) return formatClock(locale, value);
    if ( days === 1 ) return yesterday;
    if ( days < 7 ) return new Intl.DateTimeFormat(latin(locale), { weekday: "long" }).format(parsed);

    return formatDate(locale, value, "short");

};

export const dayKey = ( at: number = Date.now() ): string => {

    const day = new Date(at);

    return `${ day.getFullYear() }-${ String(day.getMonth() + 1).padStart(2, "0") }-${ String(day.getDate()).padStart(2, "0") }`;

};

type DayGroup<T> = {
    key: string;
    at: string;
    items: readonly T[];
};

export const byDay = <T extends { at: string | null }>( rows: readonly T[] ): readonly DayGroup<T>[] => {

    const days = new Map<string, DayGroup<T>>();

    for ( const row of rows ) {

        const stamp = at(row.at);
        const key = stamp ? dayKey(stamp.getTime()) : "unknown";
        const held = days.get(key);

        if ( held ) days.set(key, { ...held, items: [ ...held.items, row ] });
        else days.set(key, { key, at: row.at ?? "", items: [ row ] });

    }

    return [ ...days.values() ];

};
