type Amount = { amount?: string | number | null; currency?: string | null; display?: Amount | null };
type Price = Amount | string | number | null | undefined;

export type Money = { number: string; currency: string; before: boolean; glyph: boolean };

const glyphs = new Set(["SAR"]);

export function hasGlyph ( currency: string ): boolean {

    return glyphs.has(currency);

}

const numeral = new Set<string>(["integer", "group", "decimal", "fraction", "minusSign"]);
const dated: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };

function numbering ( locale: string ): string {

    return `${locale}-u-nu-latn`;

}
function value ( price: Price, fallback: string ): { amount: number; currency: string } | undefined {

    if ( price === null || price === undefined ) return undefined;
    if ( typeof price !== "object" ) return Number.isFinite(Number(price)) ? { amount: Number(price), currency: fallback } : undefined;

    const chosen = price.display?.amount != null ? price.display : price;
    if ( chosen.amount == null ) return undefined;

    const amount = Number(chosen.amount);

    return Number.isFinite(amount) ? { amount, currency: chosen.currency ?? price.currency ?? fallback } : undefined;

}
export function amountOf ( price: Price, fallback = "USD" ): { amount: number; currency: string } | undefined {

    return value(price, fallback);

}
export function money ( price: Price, locale: string, fallback = "USD", exact = false ): Money | undefined {

    const found = value(price, fallback);

    if ( !found ) return undefined;

    const whole = Number.isInteger(found.amount) || found.amount >= 1000;
    const parts = new Intl.NumberFormat(numbering(locale), {
        style: "currency",
        currency: found.currency,
        currencyDisplay: "code",
        ...(exact ? {} : { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 }),
    }).formatToParts(found.amount);
    const digits = parts.filter(( part ) => numeral.has(part.type)).map(( part ) => part.value).join("");
    const first = parts.findIndex(( part ) => part.type === "currency") < parts.findIndex(( part ) => part.type === "integer");

    return { number: digits, currency: found.currency, before: first, glyph: glyphs.has(found.currency) };

}
export function count ( amount: number, locale: string ): string {

    const options: Intl.NumberFormatOptions = amount >= 10000 ? { notation: "compact", maximumFractionDigits: 1 } : {};

    return new Intl.NumberFormat(numbering(locale), options).format(amount);

}
export function decimal ( amount: number | string | null | undefined, locale: string, digits = 1 ): string | undefined {

    const number = Number(amount);

    if ( !Number.isFinite(number) || number <= 0 ) return undefined;

    return new Intl.NumberFormat(numbering(locale), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(number);

}
export function distance ( meters: number, locale: string ): string {

    const far = meters >= 1000;
    const unit = far ? "kilometer" : "meter";
    const value = far ? meters / 1000 : Math.max(10, Math.round(meters / 10) * 10);

    return new Intl.NumberFormat(numbering(locale), { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: far ? 1 : 0 })
        .format(value);

}
export function percent ( rate: number | string | null | undefined, locale: string ): string | undefined {

    const number = Number(rate);

    if ( !Number.isFinite(number) || number <= 0 ) return undefined;

    return new Intl.NumberFormat(numbering(locale), { style: "percent", maximumFractionDigits: 0 }).format(number / 100);

}
export function day ( date: Date | string, locale: string, options: Intl.DateTimeFormatOptions = dated ): string {

    const formatter = new Intl.DateTimeFormat(numbering(locale), options);

    return formatter.format(typeof date === "string" ? new Date(date) : date).replace(/[\u2009\u202f]/g, " ");

}
export function days ( from: Date, to: Date, locale: string ): string {

    const formatter = new Intl.DateTimeFormat(numbering(locale), { day: "numeric", month: "short" });

    return formatter.formatRange(from, to).replace(/[\u2009\u202f]/g, " ");

}
export function instant ( value: string ): number {

    return Date.parse(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?$/.test(value) ? `${value.replace(" ", "T")}Z` : value);

}
export function ago ( value: string, locale: string, now: number ): string {

    const seconds = Math.round((instant(value) - now) / 1000);
    const size = Math.abs(seconds);
    const relative = new Intl.RelativeTimeFormat(numbering(locale), { numeric: "auto" });

    if ( size < 60 ) return relative.format(0, "second");
    if ( size < 3600 ) return relative.format(Math.round(seconds / 60), "minute");
    if ( size < 86400 ) return relative.format(Math.round(seconds / 3600), "hour");
    if ( size < 604800 ) return relative.format(Math.round(seconds / 86400), "day");

    return day(new Date(instant(value)), locale, { day: "numeric", month: "short" });

}
export function dayBucket ( value: string, now: number ): "today" | "yesterday" | "earlier" {

    const start = new Date(now);

    start.setHours(0, 0, 0, 0);

    const time = instant(value);

    return time >= start.getTime() ? "today" : time >= start.getTime() - 86400000 ? "yesterday" : "earlier";

}
