"use client";

import type { Data } from "@/api/features";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { money } from "@/lib/std/format";

type Quote = Data<"orders", "preview">;

export function usePriceSummary ( quote: Quote ) {

    const t = useTranslations("checkout");
    const locale = useLocale();
    const currency = quote.currency ?? "";
    const currencies = new Intl.DisplayNames([locale], { type: "currency" });
    const labels = {
        base: "price.base", offer: "price.offer", coupon: "price.coupon", level: "price.level", tax: "price.tax",
        cleaning: "price.cleaning", service: "price.service", delivery: "price.delivery", booking: "price.booking", resort: "price.resort",
    } as const;
    const lines = (quote.breakdown ?? []).flatMap(( row, index ) => {

        if ( row.tone === "hold" || row.tone === "on_site" ) return [];

        const value = row.tone === "discount" && row.amount != null ? `-${String(row.amount).replace(/^-/, "")}` : row.amount;
        const amount = money(value, locale, currency, true);

        return amount ? [{
            key: `${row.key}-${index}`, label: t(Object.hasOwn(labels, row.key) ? labels[row.key as keyof typeof labels] : "price.fee"),
            amount, discount: row.tone === "discount", detail: row.tone === "discount" ? t("discount") : undefined,
        }] : [];

    });
    const extras = (quote.lines ?? []).flatMap(( row, index ) => {

        const amount = money(row.total_price, locale, currency, true);

        return amount ? [{ key: `addon-${index}`, label: row.name || t("extra"), amount }] : [];

    });
    const total = money(quote.family_total ?? quote.total_price, locale, currency, true);

    return total && currency ? {
        title: t("priceTitle"), lines: [...lines, ...extras], total: { key: "total", label: t("total"), amount: total },
        currencyLabel: currencies.of(currency) ?? currency, notice: t("bindingCurrency", { currency }),
    } : null;

}
