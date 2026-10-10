import type { ReactNode } from "react";
import Badge from "@/elements/badge";
import Breadcrumbs from "@/elements/breadcrumbs";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Rating from "@/elements/rating";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    title: string;
    trail: { label: string; items: readonly { label: string; href?: string }[] };
    kind?: string | null;
    stars?: number;
    rating: { value: string; count: string; label: string } | null;
    reviews?: { href: string; label: string } | null;
    location?: string | null;
    facts?: readonly string[];
    badges?: readonly { key: string; label: string; icon?: string }[];
    actions?: ReactNode;
    reserve?: { href: string; label: string } | null;
};

export default function DetailHeader ({
    title, trail, kind, stars = 0, rating, reviews, location, facts = [], badges = [], actions, reserve,
}: Props) {

    return (

        <Stack gap={4}>

            <Breadcrumbs label={trail.label} items={trail.items} />

            <Stack direction="wide" align="wide" justify="between" gap={5}>

                <Stack gap={3}>

                    {kind || stars || badges.length ? (

                        <Stack direction="row" align="center" gap={2} wrap>

                            {kind ? <Badge tone="ivory">{kind}</Badge> : null}

                            {badges.map(( badge ) => (

                                <Badge key={badge.key} tone="teal">

                                    {isIconName(badge.icon) ? <Icon name={badge.icon} weight="fill" /> : null}

                                    {badge.label}

                                </Badge>

                            ))}

                            {stars ? (

                                <Stack direction="row" gap={0} align="center" aria-hidden="true">

                                    {Array.from({ length: stars }, ( _, index ) => `star-${index}`).map(( key ) => (

                                        <Icon key={key} name="star" size="sm" weight="fill" tone="ember" />

                                    ))}

                                </Stack>

                            ) : null}

                        </Stack>

                    ) : null}

                    <Heading level={1} size="h1">{title}</Heading>

                    <Stack direction="row" align="center" gap={4} wrap>

                        {rating ? <Rating {...rating} /> : null}

                        {reviews ? <Link href={reviews.href} variant="inline">{reviews.label}</Link> : null}

                        {location ? (

                            <Stack direction="row" align="center" gap={1}>

                                <Icon name="pin" size="sm" tone="accent" />

                                <Text as="span" size="small" dir="auto">{location}</Text>

                            </Stack>

                        ) : null}

                        {facts.map(( fact ) => <Text key={fact} as="span" size="small" tone="muted">{fact}</Text>)}

                    </Stack>

                </Stack>

                <Stack direction="row" align="center" gap={2} fixed>

                    {actions}

                    {reserve ? <Link href={reserve.href} variant="filled" size="medium">{reserve.label}</Link> : null}

                </Stack>

            </Stack>

        </Stack>

    );

}
