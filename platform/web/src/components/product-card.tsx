import type { ReactNode } from "react";
import Amount from "@/elements/amount";
import Badge from "@/elements/badge";
import Card from "@/elements/card";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Media from "@/elements/media";
import Rating from "@/elements/rating";
import Slides from "@/elements/slides";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import type { ProductCardData } from "@/hooks/use-product-card";
import Icon from "@/icons/icon";

type Props = { card: ProductCardData; currencyLabel: string; actions?: ReactNode; priority?: boolean };

function badge ( card: ProductCardData ) {

    if ( card.price?.was && card.badge ) return <Badge tone="ember"><Icon name="tag" weight="fill" />{card.badge}</Badge>;
    if ( card.tag ) return <Badge tone="teal"><Icon name="sparkle" weight="fill" />{card.tag}</Badge>;

    return null;

}
export default function ProductCard ({ card, currencyLabel, actions, priority }: Props) {

    const meta = [card.place, ...card.facts.map(( fact ) => fact.text)].filter(Boolean).join(" · ");

    return (

        <Card
            actions={actions}
            badges={badge(card)}
            media={card.gallery.length > 1 ? (

                <Slides items={card.gallery} alt={card.alt} href={card.href} priority={priority} labels={card.slides} />

            ) : <Media src={card.image} variants={card.variants} alt={card.alt} zoom priority={priority} />}
            footer={

                <Stack gap={1}>

                    {card.price ? (

                        <Stack direction="row" align="baseline" gap={2} wrap>

                            {card.price.was ? <Amount {...card.price.was} currencyLabel={currencyLabel} size="small" strike /> : null}

                            <Amount {...card.price.now} currencyLabel={currencyLabel} size="title" />

                            {card.price.unit ? <Text as="span" size="small" tone="muted">{card.price.unit}</Text> : null}

                        </Stack>

                    ) : null}

                    {card.perk ? (

                        <Stack direction="row" align="center" gap={1}>

                            <Icon name="check" size="sm" weight="bold" tone="success" />

                            <Text as="span" size="small" tone="success" weight="medium">{card.perk}</Text>

                        </Stack>

                    ) : null}

                </Stack>

            }
        >

            <Stack direction="row" align="center" justify="between" gap={3}>

                <Heading level={3} size="title" clamp={1}>

                    {card.href ? <Link href={card.href} variant="card" dir="auto">{card.title}</Link> : card.title}

                </Heading>

                {card.rating ? <Rating {...card.rating} size="medium" /> : null}

            </Stack>

            {meta ? <Text size="small" tone="muted" truncate dir="auto">{meta}</Text> : null}

        </Card>

    );

}
