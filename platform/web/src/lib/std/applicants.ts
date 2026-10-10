import { calendarDate } from "./search.ts";

export type Applicant = { name: string; birth_date: string; nationality?: string; residency?: string };
type Values = Record<string, string>;
type Fault = "applicantNameRequired" | "birthDateRequired" | "birthDateFuture" | "invalidCountry";

export function applicantRows ( values: Values, enabled: boolean ): Applicant[] {

    const quantity = Number(values.quantity);
    const count = enabled && Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 100 ? quantity : 0;

    return Array.from({ length: count }, ( _, index ) => {

        const field = ( key: string ) => (values[`applicants.${index}.${key}`] ?? "");

        return {
            name: field("name"), birth_date: field("birth_date"),
            ...(field("nationality") ? { nationality: field("nationality") } : {}),
            ...(field("residency") ? { residency: field("residency") } : {}),
        };

    });

}
export function applicantErrors ( rows: readonly Applicant[], today: string ): Record<string, Fault> {

    const errors: Record<string, Fault> = {};

    rows.forEach(( row, index ) => {

        const prefix = `applicants.${index}.`;

        if ( row.name.trim().length < 2 || row.name.length > 200 ) errors[`${prefix}name`] = "applicantNameRequired";

        if ( !calendarDate(row.birth_date) ) errors[`${prefix}birth_date`] = "birthDateRequired";
        else if ( row.birth_date > today ) errors[`${prefix}birth_date`] = "birthDateFuture";
        for ( const key of ["nationality", "residency"] as const ) {

            if ( row[key] && !/^[A-Z]{2}$/.test(row[key]) ) errors[prefix + key] = "invalidCountry";

        }

    });

    return errors;

}
