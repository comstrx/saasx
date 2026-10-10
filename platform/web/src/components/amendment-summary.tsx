"use client";

import type { Data } from "@/api/features";
import Amount from "@/elements/amount";
import Divider from "@/elements/divider";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Text from "@/elements/text";
import { useLocale, useTimeZone, useTranslations } from "@/lib/providers/intl";
import { amendmentDetails } from "@/lib/std/amendment-details";
import { amendmentDate, amendmentStates } from "@/lib/std/amendments";
import { money } from "@/lib/std/format";
import type { Question } from "@/lib/std/intake";
import ChangeList from "./change-list";
import FactList from "./fact-list";

type Props = {
    proposal: Data<"orders", "amendments">; order?: Data<"orders", "view">; questions?: readonly Question[];
};

export default function AmendmentSummary ({ proposal, order, questions }: Props) {

    const t = useTranslations("amendments");
    const fields = useTranslations("amendments.fields");
    const statuses = useTranslations("amendments.states");
    const locale = useLocale();
    const timeZone = useTimeZone() ?? "UTC";
    const state = amendmentStates.find(( value ) => value === proposal.status);
    const labels = Object.fromEntries(([
        "starts_at", "ends_at", "quantity", "adults", "children", "infants", "pets", "applicants", "answers", "base_price",
        "name", "birth_date", "nationality", "residency", "yes", "no", "empty",
    ] as const).map(( key ) => [key, fields(key)]));
    const total = money(proposal.total, locale, "USD", true);
    const original = order ? money(order.amount, locale, order.currency ?? "USD", true) : undefined;
    const delta = money(proposal.delta, locale, "USD", true);
    const tax = money(proposal.tax_amount, locale, "USD", true);
    const source = typeof proposal.total === "object" && proposal.total ? proposal.total.currency ?? "USD" : "USD";
    const rows = amendmentDetails(proposal.changes ?? {}, order, labels, locale, timeZone, source, questions);
    const charges = [...(proposal.fees ?? []), ...(proposal.bands ?? [])].flatMap(( line, index ) => {

        const amount = typeof line.amount === "string" || typeof line.amount === "number" ? money(line.amount, locale, source, true) : null;

        if ( !amount ) return [];

        return [{
            key: String(index), amount,
            label: line.key === "change" ? t("changeFee") : typeof line.name === "string" && line.name ? line.name : t("fee"),
            onSite: line.timing === "on_site",
        }];

    });
    const currencyLabel = ( code: string ) => new Intl.DisplayNames([locale], { type: "currency" }).of(code) ?? code;
    const expiry = amendmentDate(proposal.expires_at, locale, timeZone);

    return (

        <Stack gap={5}>

            <Stack direction="row" align="center" justify="between" gap={3} wrap>

                <Text weight="semibold">
                    {t(proposal.side === "buyer" ? "byYou" : proposal.side === "vendor" ? "byVendor" : "proposal")}
                </Text>
                <Status tone={state === "applied" ? "positive" : state === "proposed" ? "attention" : "neutral"}>
                    {statuses(state ?? "unknown")}
                </Status>

            </Stack>

            <ChangeList rows={rows} beforeLabel={t("before")} afterLabel={t("after")} />
            {proposal.notes ? <Text size="small" dir="auto">{proposal.notes}</Text> : null}

            {total || delta ? <Stack gap={3}>

                <Divider />
                {([
                    { key: "originalTotal", amount: original }, { key: "newTotal", amount: total },
                    { key: "difference", amount: delta }, { key: "tax", amount: tax },
                ] as const)
                    .map(( line ) => line.amount ? <Stack key={line.key} direction="row" justify="between" gap={3} wrap>

                        <Text size="small" weight={line.key === "newTotal" ? "semibold" : "normal"}>{t(line.key)}</Text>
                        <Amount {...line.amount} size="small" currencyLabel={currencyLabel(line.amount.currency)} />

                    </Stack> : null)}

                {charges.map(( line ) => <Stack key={line.key} direction="row" justify="between" gap={3} wrap>

                    <Text size="small" tone="muted">{line.label}{line.onSite ? ` · ${t("onSite")}` : ""}</Text>
                    <Amount {...line.amount} size="small" currencyLabel={currencyLabel(line.amount.currency)} />

                </Stack>)}

                <Text size="label" tone="muted">{t("priceHint")}</Text>

            </Stack> : null}

            {expiry ? <FactList items={[{ key: "expiry", term: t("expiry"), detail: expiry }]} /> : null}

        </Stack>

    );

}
