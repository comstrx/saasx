import { applicantErrors, applicantRows } from "./applicants.ts";
import { calendarDate } from "./search.ts";

export type BookingValues = Record<string, string> & {
    quantity: string; starts_at: string; ends_at: string; adults: string; children: string;
    infants: string; tier: string; coupon_code: string; applicant_details: string; slot: string;
};
export type BookingRules = {
    dated: boolean; range: boolean; party: boolean; fixed: string;
    named?: boolean; insured?: boolean; namedRequired?: boolean; scheduled?: boolean;
    minimum: number; maximum: number; minStay: number; maxStay: number | null;
};

type ProductRules = {
    capabilities?: readonly string[] | null; starts_at?: string | null;
    min_quantity?: number | null; max_quantity?: number | null; min_stay?: number | null; max_stay?: number | null;
    rules?: readonly { key?: string | null }[] | null;
};

export function bookingRules ( product: ProductRules ): BookingRules {

    const abilities = new Set(product.capabilities ?? []);
    const insured = abilities.has("underwritten");
    const named = insured || abilities.has("processable");

    return {
        dated: ["has_availability", "lodging", "underwritten", "appointable", "schedulable", "perishable"]
            .some(( name ) => abilities.has(name)),
        range: abilities.has("lodging") || insured,
        party: abilities.has("bookable") || abilities.has("lodging"),
        fixed: abilities.has("perishable") ? product.starts_at ?? "" : "",
        minimum: Math.max(1, product.min_quantity ?? 1),
        maximum: Math.min(insured ? 100 : 1000, product.max_quantity || 1000),
        minStay: product.min_stay ?? 1, maxStay: product.max_stay ?? null,
        insured, named, namedRequired: insured || named && !!product.rules?.some(( rule ) => rule.key === "min_age"),
        scheduled: abilities.has("appointable"),
    };

}
export function bookingValues ( query: string, rules: BookingRules ): BookingValues {

    const params = new URLSearchParams(query);
    const integer = ( key: string, fallback: number, minimum: number, maximum: number ) => {

        const value = Number(params.get(key));

        return String(Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : fallback);

    };
    const date = ( key: string ) => {

        const value = params.get(key) ?? "";

        return calendarDate(value) ? value : "";

    };

    return {
        quantity: integer("quantity", rules.minimum, rules.minimum, rules.maximum),
        starts_at: rules.fixed.slice(0, 10) || date("from"), ends_at: date("to"),
        adults: integer("adults", 2, 1, 100), children: integer("children", 0, 0, 100),
        infants: integer("infants", 0, 0, 100), tier: "", coupon_code: "", applicant_details: "no", slot: params.get("slot") ?? "",
    };

}
export function namesApplicants ( values: BookingValues, rules: BookingRules ): boolean {

    return !!rules.named && (!!rules.namedRequired || values.applicant_details === "yes");

}
type BookingFault = "invalidNumber" | "chooseDate" | "pastDate" | "futureCoverage" | "chooseEnd" | "stayLength"
    | "applicantNameRequired" | "birthDateRequired" | "birthDateFuture" | "invalidCountry";

export function bookingErrors ( values: BookingValues, rules: BookingRules, today: string ): Record<string, BookingFault> {

    const errors: Record<string, BookingFault> = {};
    const integer = ( key: keyof BookingValues, minimum: number, maximum: number ) => {

        const value = Number(values[key]);

        if ( !values[key] || !Number.isSafeInteger(value) || value < minimum || value > maximum ) errors[key] = "invalidNumber";

    };

    integer("quantity", rules.minimum, rules.maximum);

    if ( rules.party ) {

        integer("adults", 1, 100);
        integer("children", 0, 100);
        integer("infants", 0, 100);

    }

    if ( rules.dated && !calendarDate(values.starts_at) ) errors.starts_at = "chooseDate";
    if ( rules.dated && values.starts_at && values.starts_at < today ) errors.starts_at = "pastDate";
    if ( rules.insured && values.starts_at && values.starts_at <= today ) errors.starts_at = "futureCoverage";
    if ( rules.range && (!calendarDate(values.ends_at) || values.ends_at <= values.starts_at) ) errors.ends_at = "chooseEnd";

    if ( rules.range && values.starts_at && values.ends_at > values.starts_at ) {

        const nights = (Date.parse(values.ends_at) - Date.parse(values.starts_at)) / 86400000;

        if ( nights < rules.minStay || rules.maxStay && nights > rules.maxStay ) errors.ends_at = "stayLength";

    }
    if ( namesApplicants(values, rules) ) {

        if ( Number(values.quantity) > 100 ) errors.quantity = "invalidNumber";

        Object.assign(errors, applicantErrors(applicantRows(values, true), today));

    }

    return errors;

}
export function bookingInput ( values: BookingValues, rules: BookingRules ) {

    const applicants = applicantRows(values, namesApplicants(values, rules)).map(( row ) => ({ ...row, name: row.name.trim() }));

    return {
        quantity: applicants.length || Number(values.quantity),
        ...(applicants.length ? { applicants } : {}),
        ...(rules.dated && values.starts_at ? { starts_at: rules.scheduled && values.slot ? values.slot : values.starts_at } : {}),
        ...(rules.range && values.ends_at ? { ends_at: values.ends_at } : {}),
        ...(rules.party ? { adults: Number(values.adults), children: Number(values.children), infants: Number(values.infants) } : {}),
        ...(values.tier ? { tier: values.tier } : {}),
        ...(values.coupon_code.trim() ? { coupon_code: values.coupon_code.trim() } : {}),
    };

}
export function bookingQuery ( current: string, values: BookingValues, rules: BookingRules ): string {

    const query = new URLSearchParams(current);

    query.set("quantity", values.quantity);

    if ( rules.dated ) query.set("from", values.starts_at);
    if ( rules.range ) query.set("to", values.ends_at);

    if ( rules.scheduled && values.slot ) query.set("slot", values.slot);
    else query.delete("slot");
    if ( rules.party ) {

        query.set("adults", values.adults);
        query.set("children", values.children);
        query.set("infants", values.infants);

    }

    return query.toString();

}
