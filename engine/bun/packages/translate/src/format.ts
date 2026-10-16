export type Numerals = "latn" | "arab";
export type DateStyle = "day" | "month" | "full" | "time";
export type MoneyParts = { amount: string; currency: string; text: string };

const isolateStart = "⁨";
const isolateEnd = "⁩";
const capacity = 256;
const numbers = new Map<string, Intl.NumberFormat>();
const dates = new Map<string, Intl.DateTimeFormat>();
const plurals = new Map<string, Intl.PluralRules>();

function tag ( locale: string, numerals: Numerals ): string {

    return `${locale}-u-nu-${numerals}`;

}
function kept<T> ( cache: Map<string, T>, key: string, make: () => T ): T {

    const found = cache.get(key);

    if ( found ) return found;
    if ( cache.size >= capacity ) cache.clear();

    const made = make();

    cache.set(key, made);

    return made;

}
function numberFormat ( locale: string, numerals: Numerals, options: Intl.NumberFormatOptions ): Intl.NumberFormat {

    const name = tag(locale, numerals);

    return kept(numbers, `${name}|${JSON.stringify(options)}`, () => new Intl.NumberFormat(name, options));

}
function dateFormat ( locale: string, key: string, options: () => Intl.DateTimeFormatOptions ): Intl.DateTimeFormat {

    const name = tag(locale, "latn");

    return kept(dates, `${name}|${key}`, () => new Intl.DateTimeFormat(name, options()));

}
function dateOptions ( style: DateStyle, sameYear: boolean, timeZone: string | undefined ): Intl.DateTimeFormatOptions {

    const base: Intl.DateTimeFormatOptions = timeZone ? { timeZone } : {};

    if ( style === "month" ) return { ...base, month: "long", year: "numeric" };
    if ( style === "full" ) return { ...base, weekday: "long", day: "numeric", month: "long", year: "numeric" };
    if ( style === "time" ) return { ...base, hour: "numeric", minute: "2-digit", hour12: true };

    return { ...base, day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) };

}
export function formatNumber (
    locale: string,
    value: number,
    options: Intl.NumberFormatOptions = {},
    numerals: Numerals = "latn",
): string {

    return numberFormat(locale, numerals, options).format(value);

}
export function formatPercent ( locale: string, ratio: number, digits = 0, numerals: Numerals = "latn" ): string {

    return formatNumber(locale, ratio, { style: "percent", maximumFractionDigits: digits }, numerals);

}
export function formatMoney ( locale: string, amount: number, currency: string, numerals: Numerals = "latn" ): MoneyParts {

    const name = tag(locale, numerals);
    const style: Intl.NumberFormatOptions = { style: "currency", currency, currencyDisplay: "narrowSymbol" };
    const parts = kept(numbers, `${name}|money|${currency}`, () => new Intl.NumberFormat(name, style)).formatToParts(amount);
    const symbol = parts.find(( part ) => part.type === "currency")?.value ?? currency;
    const text = parts
        .map(( part ) => (part.type === "currency" ? `${isolateStart}${part.value}${isolateEnd}` : part.value))
        .join("");

    return {
        amount: parts
            .filter(( part ) => part.type !== "currency" && part.type !== "literal")
            .map(( part ) => part.value)
            .join(""),
        currency: symbol,
        text,
    };

}
export function formatDate (
    locale: string,
    value: Date | string | number,
    style: DateStyle = "day",
    timeZone?: string,
): string {

    const date = value instanceof Date ? value : new Date(value);
    const sameYear = date.getFullYear() === new Date().getFullYear();
    const key = `${style}|${timeZone ?? ""}|${sameYear && style === "day" ? "near" : "far"}`;

    return dateFormat(locale, key, () => dateOptions(style, sameYear, timeZone)).format(date);

}
export function formatRange ( locale: string, from: Date, to: Date, timeZone?: string ): string {

    const options = (): Intl.DateTimeFormatOptions => ({ day: "numeric", month: "short", ...(timeZone ? { timeZone } : {}) });

    return dateFormat(locale, `range|${timeZone ?? ""}`, options).formatRange(from, to);

}
export function plural ( locale: string, count: number, forms: Partial<Record<Intl.LDMLPluralRule, string>> ): string {

    const category = kept(plurals, locale, () => new Intl.PluralRules(locale)).select(count);
    const form = forms[category] ?? forms.other ?? "";

    return form.replaceAll("{n}", formatNumber(locale, count));

}
export function isolate ( text: string ): string {

    return `${isolateStart}${text}${isolateEnd}`;

}
