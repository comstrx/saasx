import type { Applicant } from "./applicants.ts";
import { type BookingRules, type BookingValues, bookingValues } from "./checkout.ts";

type Facts = {
    quantity?: number; starts_at?: string; ends_at?: string;
    adults?: number; children?: number; infants?: number | null; pets?: boolean; tier?: string; applicants?: Applicant[];
};
type Held = {
    quantity?: string | number | null; starts_at?: string | null; ends_at?: string | null;
    adults?: number | null; children?: number | null; infants?: number | null; tier?: string | null;
    applicants?: readonly {
        name?: string | null; birth_date?: string | null; nationality?: string | null; residency?: string | null;
    }[] | null;
};

export function cartFacts ( input: Facts ): Facts {

    const { quantity, starts_at, ends_at, adults, children, infants, pets, tier, applicants } = input;

    return { quantity, starts_at, ends_at, adults, children, infants, pets, tier, applicants };

}
export function cartPatch ( input: Facts ) {

    return {
        quantity: input.quantity,
        starts_at: input.starts_at ?? null, ends_at: input.ends_at ?? null,
        adults: input.adults ?? null, children: input.children ?? null, infants: input.infants ?? null,
        pets: input.pets ?? null, tier: input.tier ?? null, applicants: input.applicants ?? null,
    };

}
export function cartValues ( item: Held, rules: BookingRules ): BookingValues {

    const values = bookingValues("", rules);

    for ( const key of ["quantity", "adults", "children", "infants"] as const ) {

        if ( item[key] != null ) values[key] = String(item[key]);

    }

    values.starts_at = item.starts_at?.slice(0, 10) ?? values.starts_at;
    values.ends_at = item.ends_at?.slice(0, 10) ?? "";
    values.slot = rules.scheduled ? item.starts_at ?? "" : "";
    values.tier = item.tier ?? "";
    values.applicant_details = item.applicants?.length ? "yes" : "no";

    item.applicants?.forEach(( person, index ) => {

        for ( const key of ["name", "birth_date", "nationality", "residency"] as const ) {

            values[`applicants.${index}.${key}`] = person[key] ?? "";

        }

    });

    return values;

}
