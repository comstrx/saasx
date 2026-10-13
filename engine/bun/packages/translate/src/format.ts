export type Numerals = "latn" | "arab";
export type DateStyle = "day" | "month" | "full" | "time";
export type MoneyParts = { amount: string; currency: string; text: string };

const isolateStart = "⁨";
const isolateEnd = "⁩";

function tag(locale: string, numerals: Numerals): string {
    return `${locale}-u-nu-${numerals}`;
}
/**
 * Numbers with the numeral system pinned, because ICU defaults differ by region (`ar-SA` vs `ar-AE`).
 */
export function formatNumber(
    locale: string,
    value: number,
    options: Intl.NumberFormatOptions = {},
    numerals: Numerals = "latn",
): string {
    return new Intl.NumberFormat(tag(locale, numerals), options).format(value);
}
export function formatPercent(locale: string, ratio: number, digits = 0, numerals: Numerals = "latn"): string {
    return formatNumber(locale, ratio, { style: "percent", maximumFractionDigits: digits }, numerals);
}
/**
 * Money as parts: the currency token is isolated (FSI…PDI) so Latin symbols do not flip inside Arabic runs.
 */
export function formatMoney(locale: string, amount: number, currency: string, numerals: Numerals = "latn"): MoneyParts {
    const parts = new Intl.NumberFormat(tag(locale, numerals), {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
    }).formatToParts(amount);
    const symbol = parts.find((part) => part.type === "currency")?.value ?? currency;
    const text = parts
        .map((part) => (part.type === "currency" ? `${isolateStart}${part.value}${isolateEnd}` : part.value))
        .join("");

    return {
        amount: parts
            .filter((part) => part.type !== "currency" && part.type !== "literal")
            .map((part) => part.value)
            .join(""),
        currency: symbol,
        text,
    };
}
/**
 * Dates with month names, never numeric `dateStyle` forms: `12 Nov 2026` / `12 نوفمبر 2026`.
 */
export function formatDate(
    locale: string,
    value: Date | string | number,
    style: DateStyle = "day",
    timeZone?: string,
): string {
    const date = value instanceof Date ? value : new Date(value);
    const sameYear = date.getFullYear() === new Date().getFullYear();
    const base: Intl.DateTimeFormatOptions = timeZone ? { timeZone } : {};
    const options: Record<DateStyle, Intl.DateTimeFormatOptions> = {
        day: { ...base, day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) },
        month: { ...base, month: "long", year: "numeric" },
        full: { ...base, weekday: "long", day: "numeric", month: "long", year: "numeric" },
        time: { ...base, hour: "numeric", minute: "2-digit", hour12: true },
    };

    return new Intl.DateTimeFormat(tag(locale, "latn"), options[style]).format(date);
}
export function formatRange(locale: string, from: Date, to: Date, timeZone?: string): string {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", ...(timeZone ? { timeZone } : {}) };

    return new Intl.DateTimeFormat(tag(locale, "latn"), options).formatRange(from, to);
}
/**
 * One plural form by CLDR category: `{ one: "{n} item", other: "{n} items" }`.
 */
export function plural(locale: string, count: number, forms: Partial<Record<Intl.LDMLPluralRule, string>>): string {
    const category = new Intl.PluralRules(locale).select(count);
    const form = forms[category] ?? forms.other ?? "";

    return form.replaceAll("{n}", formatNumber(locale, count));
}
/**
 * Wraps text of unknown direction so it cannot reorder its surroundings in titles and labels.
 */
export function isolate(text: string): string {
    return `${isolateStart}${text}${isolateEnd}`;
}
