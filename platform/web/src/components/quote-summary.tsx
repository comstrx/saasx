"use client";

import type { Data } from "@/api/features";
import Amount from "@/elements/amount";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { usePriceSummary } from "@/hooks/use-price-summary";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { money } from "@/lib/std/format";
import PriceSummary from "./price-summary";

type Props = { quote: Data<"orders", "preview">; id: string };

export default function QuoteSummary ({ quote, id }: Props) {

    const summary = usePriceSummary(quote);
    const t = useTranslations("checkout");
    const locale = useLocale();
    const fees = [
        { key: "root", label: t("onSite"), value: quote.fees_on_site, currency: quote.currency },
        ...(quote.lines ?? []).map(( line ) => ({
            key: `extra-${line.catalog_id}`, label: t("onSiteFor", { name: line.name || t("extra") }),
            value: line.fees_on_site, currency: line.currency ?? quote.currency,
        })),
    ].flatMap(( row ) => {

        const amount = money(row.value, locale, row.currency ?? "USD", true);

        return amount && Number(row.value) > 0 ? [{ ...row, amount }] : [];

    });
    const hold = money(quote.family_hold ?? quote.deposit_hold, locale, quote.currency ?? "USD", true);

    return (

        <Stack gap={4} id={id} tabIndex={-1}>

            {summary ? <PriceSummary {...summary} /> : <Text tone="danger" role="alert">{t("missingPrice")}</Text>}

            {summary ? fees.map(( row ) => (

                <Stack key={row.key} direction="row" gap={2} wrap>

                    <Text size="small" tone="muted">{row.label}</Text>
                    <Amount {...row.amount} size="small" currencyLabel={summary.currencyLabel} />

                </Stack>

            )) : null}

            {summary && hold && Number(quote.family_hold ?? quote.deposit_hold) > 0 ? (

                <Stack gap={2}>

                    <Stack direction="row" gap={2} wrap>

                        <Text size="small" tone="muted">{t("hold")}</Text>
                        <Amount {...hold} size="small" currencyLabel={summary.currencyLabel} />

                    </Stack>

                    <Text size="small" tone="muted">{t("holdHint")}</Text>

                </Stack>

            ) : null}

        </Stack>

    );

}
