import Amount from "@/elements/amount";
import Art from "@/elements/art";
import Badge from "@/elements/badge";
import Columns from "@/elements/columns";
import Countdown from "@/elements/countdown";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Media from "@/elements/media";
import Reveal from "@/elements/reveal";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import type { ProductCardData } from "@/hooks/use-product-card";
import Icon from "@/icons/icon";

type Deal = {
    key: string; title: string; href: string | null; image: string | null; variants: ProductCardData["variants"];
    price: ProductCardData["price"]; off: string | null; currencyLabel: string;
};
type Props = {
    heading: string;
    title: string;
    description?: string;
    ends: string | null;
    art: string;
    until: string | null;
    deals: readonly Deal[];
    action?: { href: string; label: string };
    terms?: { href: string; label: string };
    countdown: { label: string; units: { days: string; hours: string; minutes: string }; start?: number };
    featured?: string;
};

export default function OfferBand ({ heading, title, description, ends, art, until, deals, action, terms, countdown, featured }: Props) {

    return (

        <Reveal>

            <Surface as="section" radius="hero" padding={10} aria-label={heading}>

                <Columns
                    ratio="5:7"
                    gap={8}
                    align="stretch"
                    start={

                        <Stack gap={5} align="start" justify="center" fill>

                            <Art src={art} size="large" motion="float" glow />

                            {ends ? <Badge tone="ember" size="large"><Icon name="clock" weight="fill" />{ends}</Badge> : null}

                            <Stack gap={2}>

                                <Heading level={2} size="h2">{title || heading}</Heading>

                                {description ? (

                                    <Text size="value" tone="muted" measure="short" wrap="pretty">{description}</Text>

                                ) : null}

                            </Stack>

                            {until ? (

                                <Countdown until={until} label={countdown.label} labels={countdown.units} start={countdown.start} />

                            ) : null}

                            {action || terms ? (

                                <Stack direction="row" align="center" gap={3} wrap>

                                    {action ? <Link href={action.href} variant="filled" size="large">{action.label}</Link> : null}

                                    {terms ? <Link href={terms.href} variant="ghost" size="medium">{terms.label}</Link> : null}

                                </Stack>

                            ) : null}

                        </Stack>

                    }
                    end={deals.length ? (

                        <Stack gap={3} fill justify="center">

                            {featured ? <Text size="label" tone="muted" weight="semibold">{featured}</Text> : null}

                            <Stack as="ul" gap={3}>

                                {deals.map(( deal ) => (

                                    <Surface key={deal.key} as="li" padding={3} radius="md" elevation="none" interactive>

                                        <Stack direction="row" align="center" gap={4}>

                                            <Media
                                                src={deal.image} variants={deal.variants} alt="" ratio="fill" radius="medium"
                                                width="spotlight"
                                            />

                                            <Stack gap={1} grow>

                                                <Heading level={3} size="title" clamp={2}>

                                                    {deal.href ? (

                                                        <Link href={deal.href} variant="card" dir="auto">{deal.title}</Link>

                                                    ) : deal.title}

                                                </Heading>

                                                {deal.price ? (

                                                    <Stack direction="row" align="baseline" gap={2} wrap>

                                                        <Amount {...deal.price.now} currencyLabel={deal.currencyLabel} size="title" />

                                                        {deal.price.was ? (

                                                            <Amount
                                                                {...deal.price.was} currencyLabel={deal.currencyLabel} size="small" strike
                                                            />

                                                        ) : null}

                                                        {deal.price.unit ? (

                                                            <Text as="span" size="small" tone="muted">{deal.price.unit}</Text>

                                                        ) : null}

                                                    </Stack>

                                                ) : null}

                                            </Stack>

                                            {deal.off ? <Stack fixed><Badge tone="ember">{deal.off}</Badge></Stack> : null}

                                        </Stack>

                                    </Surface>

                                ))}

                            </Stack>

                        </Stack>

                    ) : null}
                />

            </Surface>

        </Reveal>

    );

}
