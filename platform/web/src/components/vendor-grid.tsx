import type { ComponentProps } from "react";
import Grid from "@/elements/grid";
import Section from "./section";
import VendorCard from "./vendor-card";

type Props = { title: string; description?: string; items: readonly (ComponentProps<typeof VendorCard> & { key: string })[] };

export default function VendorGrid ({ title, description, items }: Props) {

    return (

        <Section title={title} description={description}>

            <Grid columns={items.length >= 4 ? 4 : items.length === 3 ? 3 : 2} gap={4} label={title}>

                {items.map(( { key, ...vendor } ) => <VendorCard key={key} {...vendor} />)}

            </Grid>

        </Section>

    );

}
