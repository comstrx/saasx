import { type Cash, cash } from "@/api/contracts";
import type { OpenDaysRow } from "@/api/endpoints/catalogs";
import { addIsoDays } from "@/std/date-range";

type OpenDay = {
    iso: string;
    open: boolean;
    units: number | null;
    price: Cash | null;
};

export type Availability = {
    known: boolean;
    currency: string;
    days: ReadonlyMap<string, OpenDay>;
};

export const availabilityHorizon = 31;

export const emptyAvailability: Availability = { known: false, currency: "", days: new Map() };

const availabilityOf = ( days: readonly OpenDay[], currency = "" ): Availability => ({
    known: days.length > 0,
    currency,
    days: new Map(days.map(( day ) => [ day.iso, day ] )),
});

export const availabilityFrom = ( data: OpenDaysRow ): Availability =>
    availabilityOf(data.days.map(( row ): OpenDay => ({
        iso: row.date,
        open: row.open ?? true,
        units: row.units ?? null,
        price: cash(row.price, data.currency ?? ""),
    })), data.currency ?? "");

const bookable = ( day: OpenDay ): boolean => day.open && day.units !== 0;

export const closedOn = ( availability: Availability, iso: string ): boolean => {

    if ( !availability.known ) return false;

    const day = availability.days.get(iso);

    return day ? !bookable(day) : false;

};

export const priceOn = ( availability: Availability, iso: string ): Cash | null => availability.days.get(iso)?.price ?? null;

export const spanOpen = ( availability: Availability, start: string | null, end: string | null ): boolean => {

    if ( !availability.known || !start ) return true;

    const until = end && end > start ? end : addIsoDays(start, 1);

    for ( const [ iso, day ] of availability.days ) {

        if ( iso >= start && iso < until && !bookable(day) ) return false;

    }

    return true;

};

type DayState = "open" | "closed" | "full";

type ComingDay = {
    iso: string;
    state: DayState;
    price: number;
};

const dayStateOf = ( day: OpenDay ): DayState => {

    if ( !day.open ) return "closed";

    return day.units === 0 ? "full" : "open";

};

export const comingDays = ( availability: Availability ): readonly ComingDay[] =>
    [ ...availability.days.values() ]
        .sort(( first, second ) => first.iso.localeCompare(second.iso) )
        .map(( day ) => ({ iso: day.iso, state: dayStateOf(day), price: day.price?.amount ?? 0 }) );
