import { digitsLocale as latin } from "@/std/locale";

const dayMs = 86_400_000;

export type DateSpan = {
    start: string | null;
    end: string | null;
};

type CalendarDay = {
    iso: string;
    day: number;
    inMonth: boolean;
    disabled: boolean;
};

export type CalendarMonth = {
    key: string;
    title: string;
    days: readonly CalendarDay[];
};

const parsed = ( iso: string ): Date => {

    const [ year = 1970, month = 1, day = 1 ] = iso.slice(0, 10).split("-").map(Number);

    return new Date(Date.UTC(year, month - 1, day, 12));

};

const isoDate = ( value: Date ): string =>
    `${ value.getUTCFullYear() }-${ String(value.getUTCMonth() + 1).padStart(2, "0") }-${ String(value.getUTCDate()).padStart(2, "0") }`;

export const todayIso = (): string => {

    const now = new Date();

    return isoDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12)));

};

export const addIsoDays = ( iso: string, days: number ): string => {

    const value = parsed(iso);

    value.setUTCDate(value.getUTCDate() + days);

    return isoDate(value);

};

export const nightsBetween = ( start: string | null, end: string | null ): number => {

    if ( !start || !end ) return 0;

    return Math.max(0, Math.round(( parsed(end).getTime() - parsed(start).getTime() ) / dayMs));

};

export const validDateSpan = ( span: DateSpan, ranged = true, minimum = "" ): boolean =>
    Boolean(span.start && span.start >= minimum && ( !ranged || ( span.end && span.end > span.start ) ));

export const selectDateSpan = ( current: DateSpan, iso: string ): DateSpan => {

    if ( !current.start || current.end ) return { start: iso, end: null };
    if ( iso <= current.start ) return { start: iso, end: null };

    return { start: current.start, end: iso };

};

export const inDateSpan = ( iso: string, span: DateSpan ): boolean =>
    Boolean(span.start && span.end && iso > span.start && iso < span.end);

export const calendarMonths = (
    locale: string,
    anchor: string,
    count: number,
    minimum: string,
): readonly CalendarMonth[] => {

    const origin = parsed(anchor);
    const months: CalendarMonth[] = [];

    for ( let slot = 0; slot < count; slot += 1 ) {

        const first = new Date(Date.UTC(origin.getUTCFullYear(), origin.getUTCMonth() + slot, 1, 12));
        const year = first.getUTCFullYear();
        const month = first.getUTCMonth();
        const offset = ( first.getUTCDay() + 1 ) % 7;
        const span = new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate();
        const cells = Math.ceil(( offset + span ) / 7 ) * 7;
        const days: CalendarDay[] = [];

        for ( let cell = 0; cell < cells; cell += 1 ) {

            const value = new Date(Date.UTC(year, month, cell - offset + 1, 12));
            const iso = isoDate(value);

            days.push({
                iso,
                day: value.getUTCDate(),
                inMonth: value.getUTCMonth() === month,
                disabled: iso < minimum,
            });

        }

        months.push({
            key: `${ year }-${ month }`,
            title: new Intl.DateTimeFormat(latin(locale), { month: "long", year: "numeric", timeZone: "UTC" }).format(first),
            days,
        });

    }

    return months;

};

export const weekdayLabels = ( locale: string ): readonly string[] => {

    const saturday = new Date(Date.UTC(2026, 7, 22, 12));
    const formatter = new Intl.DateTimeFormat(latin(locale), { weekday: locale.startsWith("ar") ? "narrow" : "short", timeZone: "UTC" });

    return Array.from({ length: 7 }, (_, slot ) => {

        const day = new Date(saturday);

        day.setUTCDate(saturday.getUTCDate() + slot);

        return formatter.format(day);

    });

};

export const weekdayOf = ( locale: string, iso: string ): string =>
    new Intl.DateTimeFormat(latin(locale), { weekday: "short", timeZone: "UTC" }).format(parsed(iso));

const formatLongDate = ( locale: string, iso: string | null ): string =>
    iso
        ? new Intl.DateTimeFormat(latin(locale), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(parsed(iso))
        : "";

export const formatDateSpan = ( locale: string, span: DateSpan ): string => {

    if ( !span.start ) return "";
    if ( !span.end ) return formatLongDate(locale, span.start);

    const start = parsed(span.start);
    const end = parsed(span.end);
    const sameMonth = start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();

    if ( sameMonth ) {

        const month = new Intl.DateTimeFormat(latin(locale), { month: "long", year: "numeric", timeZone: "UTC" }).format(end);

        return `${ start.getUTCDate() }-${ end.getUTCDate() } ${ month }`;

    }

    return `${ formatLongDate(locale, span.start) } - ${ formatLongDate(locale, span.end) }`;

};
