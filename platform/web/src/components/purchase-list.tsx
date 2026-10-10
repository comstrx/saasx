import type { ComponentProps } from "react";
import Amount from "@/elements/amount";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import type { Money } from "@/lib/std/format";
import PurchaseItem from "./purchase-item";

type Item = ComponentProps<typeof PurchaseItem> & { id: number; amount?: Money | null };
type Props = { items: readonly Item[]; label: string; amountLabel: string; currencyName: ( code: string ) => string };

export default function PurchaseList ({ items, label, amountLabel, currencyName }: Props) {

    return (

        <Grid columns={1} gap={4} label={label}>

            {items.map(( item ) => <PurchaseItem key={item.id} {...item}>

                {item.amount ? <Stack gap={2}>

                    <Text size="small" tone="muted">{amountLabel}</Text>
                    <Amount {...item.amount} size="title" currencyLabel={currencyName(item.amount.currency)} />

                </Stack> : null}

            </PurchaseItem>)}

        </Grid>

    );

}
