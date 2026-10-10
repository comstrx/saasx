import { day as dayLabel } from "./format.ts";
import { calendarDate, dateValue } from "./search.ts";

type Day = { date: string; open?: boolean | null; units?: number | null };
type Perks = { from?: Date; today: Date; hours?: number | null; payLater?: boolean; locale: string };
type PerkWords = ( key: "freeUntil" | "freeBefore" | "payLaterToday", values?: Record<string, string | number> ) => string;

export function nextDate ( value: string ): string {

    const date = calendarDate(value);

    if ( !date ) return value;

    date.setDate(date.getDate() + 1);

    return dateValue(date);

}
export function availabilityDays ( from: string, to: string ): string[] {

    const start = calendarDate(from);
    const end = calendarDate(to);
    const days: string[] = [];

    if ( !start || !end || end <= start ) return days;

    while ( start < end ) {

        days.push(dateValue(start));
        start.setDate(start.getDate() + 1);

    }

    return days;

}
export function availabilityWindows ( from: string, to: string ) {

    const days = availabilityDays(from, to);
    const windows: { from: string; to: string }[] = [];

    for ( let index = 0; index < days.length; index += 31 ) {

        const first = days[index];
        const last = days[Math.min(index + 30, days.length - 1)];

        if ( first && last ) windows.push({ from: first, to: nextDate(last) });

    }

    return windows;

}
export function availabilityState (
    days: readonly Day[], expected: readonly string[], quantity: number,
): "unknown" | "available" | "unavailable" {

    if ( !expected.length ) return "unknown";

    const indexed = new Map(days.map(( day ) => [day.date, day]));

    if ( expected.some(( date ) => !indexed.has(date) || indexed.get(date)?.open == null) ) return "unknown";

    return expected.every(( date ) => {

        const day = indexed.get(date);

        return day?.open === true && (day.units == null || day.units >= quantity);

    }) ? "available" : "unavailable";

}

export type BookingSlot = { starts_at: string; ends_at: string; open: boolean; units?: number | null };
type SlotDay = Day & { slots?: readonly BookingSlot[] };
type Slots = { slotted?: boolean; days: readonly SlotDay[] };

export function bookingSlots ( resource: Slots | null, date: string, quantity: number ) {

    const day = resource?.days.find(( entry ) => entry.date === date);
    const fits = ( units: number | null | undefined ) => units == null || units >= quantity;
    const options = (day?.slots ?? []).map(( slot ) => ({
        ...slot, available: day?.open === true && slot.open && fits(slot.units),
    }));

    return {
        known: !!day && typeof day.open === "boolean",
        options, slotted: resource?.slotted === true,
        open: !!day && day.open === true && (resource?.slotted ? options.some(( slot ) => slot.available) : fits(day.units)),
    };

}
export function slotTime ( value: string, locale: string ): string {

    const match = /[ T](\d{2}):(\d{2})/.exec(value);

    if ( !match ) return value;

    const time = new Date(Date.UTC(2000, 0, 1, Number(match[1]), Number(match[2])));

    return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
        hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC",
    }).format(time).replace(/[\u2009\u202f]/g, " ");

}
export function bookingPerks ( { from, today, hours, payLater, locale }: Perks, words: PerkWords ): string[] {

    const until = from && hours ? new Date(from.getTime() - hours * 3600000) : null;
    const cancel = !hours ? null : !until ? words("freeBefore", { hours })
        : until >= today ? words("freeUntil", { date: dayLabel(until, locale) }) : null;

    return [cancel, payLater ? words("payLaterToday") : null].filter(( perk ): perk is string => Boolean(perk));

}
