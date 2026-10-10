import type { ReactNode } from "react";
import Amount from "@/elements/amount";
import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import type { Money } from "@/lib/std/format";

export type PriceLine = { key: string; label: string; amount: Money; detail?: string; discount?: boolean };
type Props = {
    title: string; lines: readonly PriceLine[]; total: PriceLine; currencyLabel: string;
    notice?: string; children?: ReactNode;
};

export default function PriceSummary ({ title, lines, total, currencyLabel, notice, children }: Props) {

    return (

        <Stack gap={4}>

            <Heading size="title">{title}</Heading>

            {lines.map(( line ) => (

                <Stack key={line.key} direction="row" align="start" justify="between" gap={3} wrap>

                    <Stack gap={1}>

                        <Text size="small" tone={line.discount ? "accent" : "muted"}>{line.label}</Text>
                        {line.detail ? <Text size="label" tone="muted">{line.detail}</Text> : null}

                    </Stack>

                    <Amount {...line.amount} size="small" currencyLabel={currencyLabel} />

                </Stack>

            ))}

            <Divider />

            <Stack direction="row" justify="between" align="center" gap={3} wrap>

                <Text weight="semibold">{total.label}</Text>
                <Amount {...total.amount} size="title" currencyLabel={currencyLabel} />

            </Stack>

            {notice ? <Text size="small" tone="muted">{notice}</Text> : null}
            {children}

        </Stack>

    );

}
