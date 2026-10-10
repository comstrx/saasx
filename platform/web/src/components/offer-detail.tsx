import type { ComponentProps } from "react";
import Countdown from "@/elements/countdown";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import BackLink from "./back-link";
import CouponCard from "./coupon-card";
import ProductGrid from "./product-grid";
import Section from "./section";
import StateNotice from "./state-notice";

type Props = {
    card: Omit<ComponentProps<typeof CouponCard>, "action" | "tone"> & { key: string; until: string | null };
    back: { href: string; label: string } | null;
    deals: ComponentProps<typeof ProductGrid>["items"];
    more: ComponentProps<typeof ProductGrid>["items"];
    labels: { deals: string; dealsBody: string; countdown: string; none: string; noneBody: string; more: string; moreBody: string };
    units: { days: string; hours: string; minutes: string };
};

export default function OfferDetail ({ card, back, deals, more, labels, units }: Props) {

    const { until, key: _key, ...voucher } = card;

    return (

        <Stack gap={12}>

            <Stack gap={5}>

                {back ? <BackLink href={back.href} label={back.label} /> : null}

                <CouponCard {...voucher} tone="ember" level={1} />

                {until ? <Stack direction="row" align="center" gap={3} wrap>

                    <Text size="small" tone="muted">{labels.countdown}</Text>

                    <Countdown until={until} labels={units} label={labels.countdown} />

                </Stack> : null}

            </Stack>

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

        </Stack>

    );

}
