import type { Requirements } from "@/model/contract";

export type Need = "dates" | "guests" | "applicants";

const needOf: Readonly<Record<string, Need>> = {
    starts_at: "dates",
    ends_at: "dates",
    adults: "guests",
    children: "guests",
    infants: "guests",
    pets: "guests",
    applicants: "applicants",
};

const collects: Readonly<Record<string, readonly Need[]>> = {
    has_availability: [ "dates", "guests" ],
    schedulable: [ "dates" ],
    processable: [ "applicants" ],
    underwritten: [ "applicants", "dates" ],
};

const rank: readonly Need[] = [ "applicants", "dates", "guests" ];

export const needsFrom = ( requirements: Requirements, capabilities: readonly string[] ): readonly Need[] => {

    const found = new Set<Need>();

    for ( const capability of capabilities ) {

        for ( const [ name, rule ] of Object.entries(requirements[capability] ?? {}) ) {

            const need = needOf[name.split(".")[0] ?? ""];

            if ( !need ) continue;
            if ( rule.required || ( rule.when && capabilities.includes(rule.when) ) ) found.add(need);

        }

        for ( const need of collects[capability] ?? [] ) found.add(need);

    }

    return rank.filter(( need ) => found.has(need) );

};

export const rangedFrom = ( requirements: Requirements, capabilities: readonly string[] ): boolean =>
    capabilities.some(( capability ) => requirements[capability]?.ends_at?.required === true );
