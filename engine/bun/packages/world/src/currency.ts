import { type Catalog, catalog } from "engine/string";
import rows from "../data/currencies.json" with { type: "json" };
import { chosen, everyCountry } from "./country.ts";

export type Currency = {
    code: string;
    numeric: string | null;
    digits: number;
    symbol: { en: string; ar: string; narrow: string; native: string };
    countries: readonly string[];
    name: { en: string; ar: string; native: string };
};
export type Currencies = Catalog<Currency> & { of: ( country: string ) => Currency[] };

const names = new Map(everyCountry.map(( country ) => [country.code, [country.name.en, country.name.ar, country.name.native]]));

export const everyCurrency = rows as Currency[];

export function defineCurrencies ( codes?: readonly string[] ): Currencies {

    const all = chosen(everyCurrency, ( currency ) => currency.code, codes, "currencies");
    const fields = ( currency: Currency ): string[] => [
        currency.code,
        currency.numeric ?? "",
        ...Object.values(currency.symbol),
        ...Object.values(currency.name),
        ...currency.countries.flatMap(( code ) => names.get(code) ?? []),
    ];
    const found = catalog(all, ( currency ) => currency.code, fields, ( currency ) => currency.countries.length);

    return { ...found, of: ( country ) => all.filter(( currency ) => currency.countries.includes(country.toUpperCase())) };

}

export const currencies: Currencies = defineCurrencies();
