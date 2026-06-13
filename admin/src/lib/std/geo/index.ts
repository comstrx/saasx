import data from "./data.json";

export type Country = {
    iso2: string;
    name: string;
    native: string;
    dial: string;
    currency: string;
    languages: string[];
    flag: string;
};

export const countries = data as Country[];

const byIso = new Map(countries.map((c) => [c.iso2, c]));

export function country ( iso2: string ): Country | undefined {

    return byIso.get(iso2.toUpperCase());

}
export function dial ( iso2: string ): string | undefined {

    return byIso.get(iso2.toUpperCase())?.dial;

}
export function only ( codes: string[] ): Country[] {

    const set = new Set(codes.map((c) => c.toUpperCase()));

    return countries.filter((c) => set.has(c.iso2));

}
export function search ( term: string ): Country[] {

    const q = term.trim().toLowerCase();

    if ( !q ) return countries;

    return countries.filter((c) => c.name.toLowerCase().includes(q) || c.native.toLowerCase().includes(q) || c.dial.includes(q));

}
