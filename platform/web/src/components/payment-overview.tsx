"use client";

import type { ReactNode } from "react";
import Amount from "@/elements/amount";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useLocale } from "@/lib/providers/intl";
import type { Money } from "@/lib/std/format";

type Props = {
    title: string; note?: string; children?: ReactNode;
    rows: readonly { label: string; amount: Money }[];
};

export default function PaymentOverview ({ title, note, rows, children }: Props) {

    const locale = useLocale();
    const names = new Intl.DisplayNames([locale], { type: "currency" });

    return (

        <Surface elevation="low">

            <Stack gap={5}>

                <Heading size="title">{title}</Heading>

                {rows.map(( row ) => <Stack
                    key={[row.label, row.amount.currency].join(".")} direction="row" justify="between" align="center" gap={3} wrap
                >

                    <Text size="small" tone="muted">{row.label}</Text>
                    <Amount {...row.amount} size="title" currencyLabel={names.of(row.amount.currency) ?? row.amount.currency} />

                </Stack>)}

                {note ? <Text size="small" tone="muted">{note}</Text> : null}
                {children}

            </Stack>

        </Surface>

    );

}
