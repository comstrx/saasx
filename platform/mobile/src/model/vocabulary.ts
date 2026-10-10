import type { CurrencyRow, LocaleRow } from "@/api/endpoints/vocabulary";
import { currencyByCode, symbolOf } from "@/model/currency";
import { languageByCode } from "@/model/language";

export type ServedLocale = {
    code: string;
    name: string;
    native: string;
    rtl: boolean;
};

export type ServedCurrency = {
    code: string;
    name: string;
    native: string;
    symbol: string;
    digits: number;
};

export const localeOf = ( row: LocaleRow ): ServedLocale => ({
    code: row.code,
    name: row.name ?? row.code,
    native: row.native ?? row.name ?? row.code,
    rtl: Boolean(row.rtl),
});

export const currenciesOf = ( rows: readonly CurrencyRow[] ): readonly ServedCurrency[] =>
    rows
        .filter(( row ) => row.allow_display !== false )
        .map(( row ): ServedCurrency => ({
            code: row.code,
            name: row.name ?? row.code,
            native: row.native ?? row.name ?? row.code,
            symbol: row.symbol ?? "",
            digits: row.exponent ?? currencyByCode.get(row.code)?.digits ?? 2,
        }));

export const localeLabel = ( locale: ServedLocale ): string =>
    languageByCode.get(locale.code)?.native ?? locale.native ?? locale.name ?? locale.code;

export const localeHint = ( locale: ServedLocale, arabic: boolean ): string => {

    const known = languageByCode.get(locale.code);

    if ( known ) return arabic ? known.ar : known.en;

    return arabic ? locale.native : locale.name;

};

export const currencyLabel = ( currency: ServedCurrency, arabic: boolean ): string => {

    const known = currencyByCode.get(currency.code);

    if ( known ) return arabic ? known.ar : known.en;

    return ( arabic ? currency.native : currency.name ) || currency.code;

};

export const currencySymbol = ( currency: ServedCurrency, arabic: boolean ): string =>
    symbolOf(currency.code, arabic, currency.symbol);

export const currencyHint = ( currency: ServedCurrency, arabic: boolean ): string => {

    const symbol = currencySymbol(currency, arabic);

    return symbol === currency.code ? currency.code : `${ currency.code } · ${ symbol }`;

};
