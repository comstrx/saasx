import type { ComponentProps } from "react";
import Grid from "@/elements/grid";
import CouponCard from "./coupon-card";
import Section from "./section";

type Props = { title: string; description?: string; items: readonly (ComponentProps<typeof CouponCard> & { key: string })[] };

export default function CouponList ({ title, description, items }: Props) {

    if ( !items.length ) return null;

    return (

        <Section title={title} description={description}>

            <Grid as="div" columns={2} gap={4} label={title}>

                {items.map(( { key, ...coupon } ) => <CouponCard key={key} {...coupon} />)}

            </Grid>

        </Section>

    );

}
