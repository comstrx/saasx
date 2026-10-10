import type { ComponentProps } from "react";
import Accordion from "@/elements/accordion";
import Heading from "@/elements/heading";
import RichText from "@/elements/rich-text";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Icon from "@/icons/icon";
import BackLink from "./back-link";
import CouponCard from "./coupon-card";
import ProductGrid from "./product-grid";
import Section from "./section";
import StateNotice from "./state-notice";
import VoucherGrid from "./voucher-grid";

type Props = {
    title: string; body: string | null; back: { href: string; label: string } | null;
    offers: readonly (Omit<ComponentProps<typeof CouponCard>, "tone" | "action"> & { key: string })[];
    faqs: readonly { key: string; title: string; body: string }[];
    deals: ComponentProps<typeof ProductGrid>["items"];
    more: ComponentProps<typeof ProductGrid>["items"];
    labels: {
        offers: string; faqs: string; deals: string; dealsBody: string; none: string; noneBody: string; more: string; moreBody: string;
    };
};

export default function CampaignDetail ({ title, body, back, offers, faqs, deals, more, labels }: Props) {

    return (

        <Stack gap={12}>

            <Stack gap={5}>

                {back ? <BackLink href={back.href} label={back.label} /> : null}

                <Surface padding={8} radius="hero" elevation="medium">

                    <Stack direction="row" gap={5} align="start">

                        <Icon name="megaphone" size="xl" tone="accent" />

                        <Stack gap={3}>

                            <Heading level={1} size="h1" wrap="balance">{title}</Heading>

                            {body ? <RichText value={body} /> : null}

                        </Stack>

                    </Stack>

                </Surface>

            </Stack>

            {offers.length ? (

                <Section title={labels.offers}>

                    <VoucherGrid label={labels.offers}>

                        {offers.map(( { key, ...offer } ) => <CouponCard key={key} {...offer} tone="ember" />)}

                    </VoucherGrid>

                </Section>

            ) : null}

            <Section title={labels.deals} description={labels.dealsBody}>

                {deals.length ? <ProductGrid items={deals} label={labels.deals} /> : (

                    <StateNotice compact art="/assets/images/brand/gift.webp" title={labels.none} description={labels.noneBody} />

                )}

            </Section>

            {more.length ? (

                <Section title={labels.more} description={labels.moreBody}>

                    <ProductGrid items={more} label={labels.more} />

                </Section>

            ) : null}

            {faqs.length ? (

                <Section title={labels.faqs}>

                    <Accordion
                        look="cards" items={faqs.map(( faq ) => ({ key: faq.key, title: faq.title, body: <RichText value={faq.body} /> }))}
                    />

                </Section>

            ) : null}

        </Stack>

    );

}
