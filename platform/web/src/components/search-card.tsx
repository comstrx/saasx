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
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    card: ProductCardData;
    currencyLabel: string;
    kind: { label: string; icon: string | null } | null;
    summary: string | null;
    perks: readonly string[];
    details: string;
    actions?: ReactNode;
    priority?: boolean;
};

export default function SearchCard ({ card, currencyLabel, kind, summary, perks, details, actions, priority }: Props) {

    const meta = [card.place, ...card.facts.map(( fact ) => fact.text)].filter(Boolean).join(" · ");

    return (

        <Card
            layout="row"
            actions={actions}
            badges={card.price?.was && card.badge ? <Badge tone="ember"><Icon name="tag" weight="fill" />{card.badge}</Badge> : null}
            media={card.gallery.length > 1 ? (

                <Slides items={card.gallery} alt={card.alt} href={card.href} priority={priority} labels={card.slides} />

            ) : <Media src={card.image} variants={card.variants} alt={card.alt} zoom priority={priority} />}
            footer={

                <>

                    {card.rating ? <Stack grow><Rating {...card.rating} size="medium" /></Stack> : null}

                    {card.price ? (

                        <Stack gap={0}>

                            <Text as="span" size="label" tone="muted">{card.price.from}</Text>

                            <Stack direction="row" align="baseline" gap={2} wrap>

                                {card.price.was ? <Amount {...card.price.was} currencyLabel={currencyLabel} size="small" strike /> : null}

                                <Amount {...card.price.now} currencyLabel={currencyLabel} size="title" />

                            </Stack>

                            {card.price.unit ? <Text as="span" size="label" tone="muted">{card.price.unit}</Text> : null}

                        </Stack>

                    ) : null}

                    <Stack as="span" direction="row" align="center" gap={1}>

                        <Text as="span" size="small" weight="semibold" tone="accent">{details}</Text>

                        <Icon name="caret-end" size="sm" weight="bold" tone="accent" />

                    </Stack>

                </>

            }
        >

            <Stack gap={2}>

                {kind ? (

                    <Stack direction="row">

                        <Badge look="flat" tone="teal">

                            {isIconName(kind.icon) ? <Icon name={kind.icon} weight="fill" /> : null}

                            {kind.label}

                        </Badge>

                    </Stack>

                ) : null}

                <Heading level={3} size="title" clamp={2}>

                    {card.href ? <Link href={card.href} variant="card" dir="auto">{card.title}</Link> : card.title}

                </Heading>

                {meta ? (

                    <Stack direction="row" align="center" gap={1}>

                        <Icon name="pin" size="sm" tone="muted" />

                        <Text as="span" size="small" tone="muted" truncate dir="auto">{meta}</Text>

                    </Stack>

                ) : null}

                {summary ? <Text size="small" tone="muted" clamp={2} dir="auto">{summary}</Text> : null}

                {perks.length ? (

                    <Stack direction="row" gap={4} wrap>

                        {perks.map(( perk ) => (

                            <Stack key={perk} as="span" direction="row" align="center" gap={1}>

                                <Icon name="check" size="sm" weight="bold" tone="success" />

                                <Text as="span" size="small" tone="success" weight="medium">{perk}</Text>

                            </Stack>

                        ))}

                    </Stack>

                ) : null}

            </Stack>

        </Card>

    );

}
