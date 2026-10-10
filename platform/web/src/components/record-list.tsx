import type { ComponentProps } from "react";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import BulkBar from "./bulk-bar";
import RecordCard from "./record-card";

type Props = {
    items: readonly (ComponentProps<typeof RecordCard> & { id: string | number })[]; label: string;
    bulk?: ComponentProps<typeof BulkBar> | null;
};

export default function RecordList ({ items, label, bulk }: Props) {

    return (

        <Stack gap={3}>

            {bulk ? <BulkBar {...bulk} /> : null}

            <Grid columns={1} gap={4} label={label}>{items.map(( item ) => <RecordCard key={item.id} {...item} />)}</Grid>

        </Stack>

    );

}
