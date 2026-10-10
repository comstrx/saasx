import { money, percent } from "./format.ts";

type Amount = Parameters<typeof money>[0];

export const perkKeys = ["discount", "cashback", "points", "free_cancellation", "priority_support", "upgrade"] as const;

const conditionKeys = [
    "orders_count", "spend_amount", "points_earned", "reviews_count", "referrals_count", "subscriptions_count",
] as const;

export function conditionName ( key: string | null | undefined, named: ( known: (typeof conditionKeys)[number] ) => string ): string {

    const found = conditionKeys.find(( item ) => item === key);

    return found ? named(found) : humanize(key);

}
export function perkKey ( key: string | null | undefined ): (typeof perkKeys)[number] | undefined {

    return perkKeys.find(( item ) => item === key);

}
export function humanize ( key: string | null | undefined ): string {

    return (key ?? "").replaceAll("_", " ");

}
export function amountText ( value: Amount, locale: string ): string | null {

    const found = money(value, locale, "USD", true);

    return found ? found.before ? `${found.currency} ${found.number}` : `${found.number} ${found.currency}` : null;

}
export function perkValue ( perk: { rate_ppm?: string | number | null; value?: Amount }, locale: string ): string {

    return perk.rate_ppm ? percent(Number(perk.rate_ppm) / 10000, locale) ?? "" : amountText(perk.value, locale) ?? "";

}
