import type { ComponentProps } from "react";
import Badge from "@/elements/badge";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import CouponCard from "./coupon-card";
import ProductGrid from "./product-grid";
import Section from "./section";
import StateNotice from "./state-notice";

type Voucher = Omit<ComponentProps<typeof CouponCard>, "action" | "tone"> & { key: string; href: string | null };
type Props = {
    offers: readonly Voucher[];
    campaigns: readonly { key: string; href: string | null; title: string; body: string; offers: readonly string[] }[];
    deals: ComponentProps<typeof ProductGrid>["items"];
    labels: {
        live: string; liveBody: string; campaigns: string; deals: string; dealsBody: string; view: string;
        empty: { title: string; body: string };
    };
    art: string;
};

export default function OfferBoard ({ offers, campaigns, deals, labels, art }: Props) {

    if ( !offers.length && !deals.length ) return <StateNotice art={art} title={labels.empty.title} description={labels.empty.body} />;

    return (

        <Stack gap={12}>

            {offers.length ? (

                <Section title={labels.live} description={labels.liveBody}>

                    <Grid as="div" columns={2} gap={4} label={labels.live}>

                        {offers.map(( { key, href, ...offer } ) => (

                            <CouponCard
                                key={key} {...offer} tone="ember"
                                action={href ? (

                                    <Link href={href} variant="subtle" size="small">{labels.view}<Icon name="arrow-end" /></Link>

                                ) : undefined}
                            />

                        ))}

                    </Grid>

                </Section>

            ) : null}

            {campaigns.length ? (

                <Section title={labels.campaigns}>

                    <Grid columns={3} gap={4} label={labels.campaigns}>

                        {campaigns.map(( campaign ) => (

                            <Surface key={campaign.key} as="li" padding={6} radius="lg" interactive={Boolean(campaign.href)}>

                                <Stack gap={3}>

                                    <Stack direction="row" gap={2} align="center">

                                        <Icon name="megaphone" tone="accent" />

                                        <Heading level={3} size="title">

                                            {campaign.href ? (

                                                <Link href={campaign.href} variant="card">{campaign.title}</Link>

                                            ) : campaign.title}

                                        </Heading>

                                    </Stack>

                                    {campaign.body ? <Text size="small" tone="muted" wrap="pretty">{campaign.body}</Text> : null}

                                    {campaign.offers.length ? (

                                        <Stack direction="row" gap={2} wrap>

                                            {campaign.offers.map(( name ) => <Badge key={name} tone="ember" look="flat">{name}</Badge>)}

                                        </Stack>

                                    ) : null}

                                </Stack>

                            </Surface>

                        ))}

                    </Grid>

                </Section>

            ) : null}

            {deals.length ? (

                <Section title={labels.deals} description={labels.dealsBody}>

                    <ProductGrid items={deals} label={labels.deals} />

                </Section>

            ) : null}

        </Stack>

    );

}
