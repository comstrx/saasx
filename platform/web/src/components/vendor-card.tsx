import Badge from "@/elements/badge";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Portrait from "@/elements/portrait";
import Rating from "@/elements/rating";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = {
    name: string;
    initials: string;
    image: string | null;
    href: string | null;
    verified: string | null;
    city: string | null;
    listings: string;
    since: string | null;
    rating: { value: string; count: string; label: string } | null;
};

export default function VendorCard ({ name, initials, image, href, verified, city, listings, since, rating }: Props) {

    return (

        <Surface as="li" padding={6} radius="lg" interactive={Boolean(href)}>

            <Stack gap={5}>

                <Stack direction="row" align="center" gap={4}>

                    <Portrait src={image} alt={name} initials={initials} size="large" />

                    <Stack gap={1}>

                        <Heading level={3} size="title">

                            {href ? <Link href={href} variant="card" dir="auto">{name}</Link> : name}

                        </Heading>

                        {city ? <Text size="small" tone="muted">{city}</Text> : null}

                        {verified ? (

                            <Stack direction="row">

                                <Badge tone="teal"><Icon name="seal" weight="fill" />{verified}</Badge>

                            </Stack>

                        ) : null}

                    </Stack>

                </Stack>

                <Stack direction="row" align="center" justify="between" gap={3} wrap>

                    {rating ? <Rating {...rating} /> : <Text as="span" size="small" tone="muted">{listings}</Text>}

                    {rating ? <Text as="span" size="small" tone="muted">{listings}</Text> : null}

                    {since ? <Text as="span" size="label" tone="muted">{since}</Text> : null}

                </Stack>

            </Stack>

        </Surface>

    );

}
