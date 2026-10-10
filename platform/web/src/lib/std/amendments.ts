import { type BookingRules, type BookingValues, bookingInput, bookingValues } from "./checkout.ts";
import { day, instant } from "./format.ts";
import { type Answer, type Answers, intakeKey, type Question } from "./intake.ts";
import { isRecord } from "./object.ts";

type Order = {
    quantity?: number | null; adults?: number | null; children?: number | null; infants?: number | null;
    pets?: boolean | number | null; starts_at?: string | null; ends_at?: string | null;
    applicants?: readonly {
        name?: string | null; birth_date?: string | null; nationality?: string | null; residency?: string | null;
    }[] | null;
    answers?: readonly Record<string, unknown>[] | null;
};
export const amendmentStates = ["proposed", "applied", "declined", "expired"] as const;
export const amendmentFields = [
    "starts_at", "ends_at", "quantity", "adults", "children", "infants", "pets", "applicants", "answers", "base_price",
];

export function savedAnswers ( order: Order ): Answers {

    const rows = order.answers;

    const scalar = ( value: unknown ): value is string | number | boolean | null =>
        value === null || typeof value === "string" || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value);
    const grouped = new Map<string, { index: number; scope: unknown; value: Answer }[]>();

    for ( const row of rows ?? [] ) {

        if ( typeof row.key !== "string" || typeof row.index !== "number" || !Number.isSafeInteger(row.index) || row.index < 0 ) continue;

        const value = row.value;

        if ( !scalar(value) && !(Array.isArray(value) && value.every(scalar)) ) continue;

        const group = grouped.get(row.key) ?? [];

        group.push({ index: row.index, scope: row.scope, value });
        grouped.set(row.key, group);

    }

    return Object.fromEntries([...grouped].map(( [key, rows] ) => {

        const scope = rows[0]?.scope;
        const seats = scope === "guest" ? order.adults ?? 1
            : scope === "applicant" || scope === "traveller" ? order.applicants?.length || 1 : 1;
        const length = Math.max(seats, ...rows.map(( row ) => row.index + 1));
        const values: Answer[] = Array.from({ length: Math.min(100, length) }, () => null);

        for ( const row of rows ) {

            if ( row.index < values.length ) values[row.index] = row.value;

        }

        return [key, values.length === 1 ? values[0] ?? null : values];

    }));

}
export function amendmentValues ( order: Order, rules: BookingRules, book: readonly Question[] ): BookingValues {

    const values = {
        ...bookingValues("", rules), quantity: String(order.quantity ?? rules.minimum),
        starts_at: order.starts_at?.slice(0, 10) ?? "", ends_at: order.ends_at?.slice(0, 10) ?? "",
        adults: String(order.adults ?? 1), children: String(order.children ?? 0), infants: String(order.infants ?? 0),
        pets: order.pets ? "true" : "false", slot: rules.scheduled ? order.starts_at ?? "" : "",
        applicant_details: order.applicants?.length ? "yes" : "no", notes: "",
    };
    const result: BookingValues = values;

    for ( const [index, row] of (order.applicants ?? []).entries() ) {

        for ( const key of ["name", "birth_date", "nationality", "residency"] as const ) {

            result[`applicants.${index}.${key}`] = row[key] ?? "";

        }

    }
    for ( const row of order.answers ?? [] ) {

        if ( typeof row.key !== "string" || typeof row.index !== "number" ) continue;

        const question = book.find(( question ) => question.key === row.key);
        const key = intakeKey(row.key, row.index);

        if ( question?.type === "location" && Array.isArray(row.value) ) {

            result[`${key}.latitude`] = row.value[0] == null ? "" : String(row.value[0]);
            result[`${key}.longitude`] = row.value[1] == null ? "" : String(row.value[1]);

        }
        else result[key] = Array.isArray(row.value) ? JSON.stringify(row.value) : row.value == null ? "" : String(row.value);

    }

    return result;

}
export function amendmentInput (
    initial: BookingValues, values: BookingValues, rules: BookingRules,
    answers: Answers, baseline: Answers, book: readonly Question[], saved: Order,
) {

    const select = ( values: BookingValues ) => {

        const { tier: _, coupon_code: __, ...input } = bookingInput(values, rules);

        return { ...input, pets: values.pets === "true" };

    };
    const before = select(initial);
    const after = select(values);
    const changes = Object.fromEntries(Object.entries(after).filter(( [key, value] ) =>
        JSON.stringify(value) !== JSON.stringify(before[key as keyof typeof before])
    ));
    const questionsChanged = JSON.stringify(answers) !== JSON.stringify(baseline);
    const retained = Object.fromEntries(Object.entries(savedAnswers(saved)).filter(( [key] ) => !book.some(( row ) => row.key === key)));

    return {
        ...changes, ...(questionsChanged ? { answers: { ...retained, ...answers } } : {}),
        ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
    };

}
export function amendmentDate ( value: unknown, locale: string, timeZone = "UTC" ): string {

    if ( typeof value !== "string" || !Number.isFinite(instant(value)) ) return "";

    return day(new Date(instant(value)), locale, {
        day: "numeric", month: "short", year: "numeric", ...(value.length > 10 ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
        timeZone, ...(value.length > 10 ? { timeZoneName: "short" as const } : {}),
    });

}
export function changeText ( value: unknown ): string {

    if ( value == null || value === "" ) return "";
    if ( typeof value === "string" || typeof value === "number" || typeof value === "boolean" ) return String(value);
    if ( Array.isArray(value) ) return value.map(changeText).filter(Boolean).join(" · ");
    if ( isRecord(value) ) return changeText(value.value ?? value.name);

    return "";

}
export function reviewableChanges ( changes: Record<string, unknown> | null | undefined ): boolean {

    if ( !changes || !Object.keys(changes).length ) return false;

    return Object.entries(changes).every(( [key, value] ) => {

        if ( !amendmentFields.includes(key) ) return false;
        if ( key === "starts_at" || key === "ends_at" ) return typeof value === "string" && Number.isFinite(instant(value));
        if ( key === "pets" ) return typeof value === "boolean";
        if ( key === "base_price" ) return (typeof value === "string" || typeof value === "number") && Number.isFinite(Number(value));

        if ( key === "applicants" ) return Array.isArray(value) && value.length > 0 && value.every(( row ) =>
            isRecord(row) && typeof row.name === "string" && typeof row.birth_date === "string"
        );
        if ( key === "answers" ) return Array.isArray(value) && value.every(( row ) =>
            isRecord(row) && typeof row.key === "string" && typeof row.index === "number" && "value" in row
        );

        return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

    });

}
export function amendmentCountConflict ( order: Order, values: BookingValues, rules: BookingRules, book: readonly Question[] ): boolean {

    const input = bookingInput(values, rules);
    const applicantCount = input.applicants?.length ?? order.applicants?.length ?? 0;
    const scopes = [...book.map(( row ) => row.scope), ...(order.answers ?? []).map(( row ) => row.scope)];

    return scopes.some(( scope ) => scope === "guest" ? (input.adults ?? order.adults ?? 1) !== (order.adults ?? 1)
        : (scope === "applicant" || scope === "traveller") && applicantCount !== (order.applicants?.length ?? 0));

}
