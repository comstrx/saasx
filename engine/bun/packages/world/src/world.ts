import { countries as everyCountry } from "./countries.ts";
import { currencies as everyCurrency } from "./currencies.ts";
import type { Country, Currency, Language } from "./kinds.ts";
import { languages as everyLanguage } from "./languages.ts";
import { type Catalog, catalog, digits } from "./search.ts";

export type Flags = { folder?: string | undefined; format?: "svg" | "webp" | "png" | undefined };
export type WorldOptions = {
    countries?: readonly string[] | undefined;
    currencies?: readonly string[] | undefined;
    languages?: readonly string[] | undefined;
    flags?: Flags | undefined;
};
export type World = {
    countries: Catalog<Country>;
    currencies: Catalog<Currency>;
    languages: Catalog<Language>;
    dialing: { search: ( query: string, limit?: number ) => Country[]; of: ( alpha2: string ) => string | undefined };
    currenciesOf: ( alpha2: string ) => Currency[];
    countriesOf: ( currency: string ) => Country[];
    flagOf: ( alpha2: string ) => string;
    flagEmoji: ( alpha2: string ) => string;
    flags: Required<Flags>;
};

const regionalIndicator = 0x1f1e6;

function chosen<T> ( items: readonly T[], codeOf: ( item: T ) => string, wanted: readonly string[] | undefined, what: string ): readonly T[] {

    if ( !wanted ) return items;

    const codes = wanted.map(( code ) => code.toUpperCase());
    const known = new Set(items.map(codeOf));
    const strangers = codes.filter(( code ) => !known.has(code));

    if ( strangers.length ) throw new Error(`Unknown ${what}: ${strangers.join(", ")}`);

    const order = new Map(codes.map(( code, index ) => [code, index]));

    return items.filter(( item ) => order.has(codeOf(item))).sort(( a, b ) => (order.get(codeOf(a)) ?? 0) - (order.get(codeOf(b)) ?? 0));

}
export function flagEmoji ( alpha2: string ): string {

    const code = alpha2.toUpperCase();

    if ( !/^[A-Z]{2}$/.test(code) ) return "";

    return String.fromCodePoint(...[...code].map(( letter ) => regionalIndicator + letter.charCodeAt(0) - 65));

}
export function defineWorld ( options: WorldOptions = {} ): World {

    const flags: Required<Flags> = { folder: options.flags?.folder ?? "images/flag", format: options.flags?.format ?? "svg" };
    const countryRows = chosen(everyCountry, ( c ) => c.alpha2, options.countries, "countries");
    const currencyRows = chosen(everyCurrency, ( c ) => c.code, options.currencies, "currencies");
    const languageRows = chosen(everyLanguage, ( l ) => l.code.toUpperCase(), options.languages, "languages");
    const countryByCode = new Map(countryRows.map(( c ) => [c.alpha2, c]));
    const countryName = ( alpha2: string ): string[] => {

        const country = countryByCode.get(alpha2);

        return country ? [country.name.en, country.name.ar, country.name.native] : [];

    };
    const countries = catalog(countryRows, ( c ) => c.alpha2, ( c ) => [c.alpha2, c.alpha3, c.numeric, ...c.dials, c.name.en, c.name.ar, c.name.native]);
    const currencies = catalog(currencyRows, ( c ) => c.code, ( c ) => [c.code, c.symbol, c.name.en, c.name.ar, c.name.native, ...c.countries.flatMap(countryName), ...c.countries], ( c ) => c.countries.length);
    const languages = catalog(languageRows, ( l ) => l.code, ( l ) => [l.code, l.name.en, l.name.ar, l.name.native]);

    return {
        countries,
        currencies,
        languages,
        dialing: {
            search: ( query, limit = 20 ) => {

                const needle = digits(query);

                if ( !needle ) return [];

                return countryRows.filter(( c ) => c.dials.some(( dial ) => digits(dial).startsWith(needle))).slice(0, limit);

            },
            of: ( alpha2 ) => countryByCode.get(alpha2.toUpperCase())?.dial,
        },
        currenciesOf: ( alpha2 ) => (countryByCode.get(alpha2.toUpperCase())?.currencies ?? []).flatMap(( code ) => currencies.get(code) ?? []),
        countriesOf: ( code ) => (currencies.get(code)?.countries ?? []).flatMap(( alpha2 ) => countries.get(alpha2) ?? []),
        flagOf: ( alpha2 ) => `${flags.folder}/${alpha2.toLowerCase()}.${flags.format}`,
        flagEmoji,
        flags,
    };

}
