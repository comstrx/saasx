import { type Catalog, catalog } from "engine/string";
import rows from "../data/countries.json" with { type: "json" };
import regionRows from "../data/regions.json" with { type: "json" };

export type Region = { code: string; name: { en: string; ar: string } };
export type Country = {
    code: string;
    alpha3: string;
    numeric: string;
    key: string | null;
    areas: readonly string[];
    primary: boolean;
    region: Region | null;
    subregion: Region | null;
    currencies: readonly string[];
    languages: readonly string[];
    name: { en: string; ar: string; native: string };
};
export type Countries = Catalog<Country> & {
    inRegion: ( region: string ) => Country[];
    spending: ( currency: string ) => Country[];
    speaking: ( language: string ) => Country[];
};

type Row = Omit<Country, "region" | "subregion"> & { region: string | null; subregion: string | null };

const regions = new Map((regionRows as Region[]).map(( region ) => [region.code, region]));

export const everyCountry: readonly Country[] = (rows as Row[]).map(( row ) => ({
    ...row,
    region: regions.get(row.region ?? "") ?? null,
    subregion: regions.get(row.subregion ?? "") ?? null,
}));

export function chosen<T> (
    items: readonly T[],
    codeOf: ( item: T ) => string,
    wanted: readonly string[] | undefined,
    what: string,
): readonly T[] {

    if ( !wanted ) return items;

    const byCode = new Map(items.map(( item ) => [codeOf(item).toLowerCase(), item]));
    const strangers = wanted.filter(( code ) => !byCode.has(code.toLowerCase()));

    if ( strangers.length ) throw new Error(`Unknown ${what}: ${strangers.join(", ")}`);

    return wanted.map(( code ) => byCode.get(code.toLowerCase()) as T);

}
export function dialings ( key: string | null, areas: readonly string[] = [] ): string[] {

    if ( !key ) return [];

    const bare = key.slice(1);

    return [key, bare, `00${bare}`, ...areas.flatMap(( area ) => [`${key}${area}`, `${bare}${area}`, `${key} ${area}`])];

}
export function defineCountries ( codes?: readonly string[] ): Countries {

    const all = chosen(everyCountry, ( country ) => country.code, codes, "countries");
    const fields = ( country: Country ): string[] => [
        country.code,
        country.alpha3,
        country.numeric,
        ...dialings(country.key, country.areas),
        country.name.en,
        country.name.ar,
        country.name.native,
    ];
    const found = catalog(all, ( country ) => country.code, fields);

    return {
        ...found,
        inRegion: ( region ) => all.filter(( country ) => country.region?.code === region || country.subregion?.code === region),
        spending: ( currency ) => all.filter(( country ) => country.currencies.includes(currency.toUpperCase())),
        speaking: ( language ) => all.filter(( country ) => country.languages.includes(language.toLowerCase())),
    };

}

export const countries: Countries = defineCountries();
