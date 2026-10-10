"use client";

import { type AvailabilityInput, useAvailability } from "@/hooks/use-availability";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { amountOf, money } from "@/lib/std/format";

export type StayQuoteData = ReturnType<typeof useStayQuote>;

export function useStayQuote ( input: AvailabilityInput, currency: string, enabled = true ) {

    const t = useTranslations("booking");
    const search = useTranslations("search");
    const common = useTranslations("common");
    const locale = useLocale();
    const availability = useAvailability(input, enabled);
    const nights = (availability.data?.days ?? []).filter(( day ) => day.date >= input.from && day.date < input.to)
        .map(( day ) => amountOf(day.sale_price ?? day.price, currency)).filter(( price ) => price !== undefined);
    const ready = availability.state === "available" && nights.length > 0 && nights.every(( night ) => night.amount > 0);
    const unit = nights[0]?.currency ?? currency;
    const sum = nights.reduce(( total, night ) => total + night.amount, 0) * input.quantity;
    const flat = nights.every(( night ) => night.amount === nights[0]?.amount);
    const each = flat ? nights[0]?.amount ?? 0 : sum / Math.max(1, nights.length * input.quantity);
    const nightly = money({ amount: each, currency: unit }, locale, unit);
    const failed = availability.state === "failed" || availability.state === "unknown";

    return {
        state: availability.state,
        message: availability.state === "loading" ? t("pricing") : t(`availability.${availability.state}`),
        retry: failed ? { label: common("retry"), run: availability.reload } : null,
        quote: ready && nightly ? {
            nightly,
            average: !flat,
            nights: t("times", { nights: search("nights", { count: nights.length }) }),
            length: search("nights", { count: nights.length }),
            taxes: t("taxesIncluded"),
            total: money({ amount: sum, currency: unit }, locale, unit),
            totalLabel: t("totalTaxes"),
        } : null,
    };

}
