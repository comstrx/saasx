import { applicantRows } from "./applicants.ts";
import { bookingErrors, bookingInput, bookingRules, bookingValues, namesApplicants } from "./checkout.ts";
import { intake, type Question } from "./intake.ts";

type Product = Parameters<typeof bookingRules>[0] & {
    id: number; questions?: readonly Question[] | null; prices?: readonly { tier?: string | null }[] | null;
};
type Values = Readonly<Record<string, string>>;

export function extraKey ( id: number, key: string ): string {

    return `addons.${id}.${key}`;

}
export function selectedExtras ( values: Values ): number[] {

    return Object.entries(values).flatMap(( [key, value] ) => {

        const match = /^addons\.(\d+)\.selected$/.exec(key);
        const id = Number(match?.[1]);

        return value === "yes" && Number.isSafeInteger(id) && id > 0 ? [id] : [];

    }).slice(0, 100);

}
export function extraState ( product: Product, all: Values, today: string ) {

    const rules = bookingRules(product);
    const values: ReturnType<typeof bookingValues> = { ...bookingValues("", rules),
        starts_at: rules.fixed.slice(0, 10) || all.starts_at || "", ends_at: all.ends_at || "",
        adults: all.adults || "1", children: all.children || "0", infants: all.infants || "0",
    };
    const prefix = extraKey(product.id, "");

    for ( const [key, value] of Object.entries(all) ) {

        if ( key.startsWith(prefix) ) values[key.slice(prefix.length)] = value;

    }

    const enabled = namesApplicants(values, rules);
    const applicants = applicantRows(values, enabled);
    const questions = intake(product.questions ?? [], values, {
        applicants: applicants.length, adults: rules.party ? Number(values.adults) : 1,
    });
    const input = { catalog_id: product.id, ...bookingInput(values, rules),
        ...(questions.groups.length ? { answers: questions.answers } : {}),
    };
    const stamp = JSON.stringify([values.starts_at, values.quantity, values.slot]);

    return {
        rules, values, applicants, applicantsEnabled: enabled, questions, input, stamp,
        errors: bookingErrors(values, rules, today),
        tiers: [...new Set((product.prices ?? []).flatMap(( price ) => price.tier ? [price.tier] : []))],
    };

}
