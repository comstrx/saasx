import type { ReactNode } from "react";
import Amount from "@/elements/amount";
import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Immersive from "@/elements/immersive";
import Pebble from "@/elements/pebble";
import Rating from "@/elements/rating";
import Slides from "@/elements/slides";
import Stack from "@/elements/stack";
import Tag from "@/elements/tag";
import Text from "@/elements/text";
import Tile from "@/elements/tile";
import Icon, { isIconName } from "@/icons/icon";
import type { Money } from "@/lib/std/format";
import ProductFavorite from "./product-favorite";
import ShareButton from "./share-button";

type Picture = { src: string; alt: string; variants?: Record<string, string | null> | readonly never[] | null };
type Props = {
    back: { href: string; label: string };
    title: string;
    place?: string | null;
    rating: { value: string; label: string } | null;
    reviews?: string | null;
    word?: string | null;
    perks: readonly string[];
    amenities: readonly { key: string; term: string; icon?: string }[];
    room?: { name: string; brief: string; price: Money; currencyLabel: string; unit: string; href: string } | null;
    labels: { previous: string; next: string };
    pictures: readonly Picture[];
    favorite: { productId: number; name: string; signIn: string | null };
    share: { label: string; copied: string; failed: string };
    children: ReactNode;
};

export default function DetailHero ({
    back, title, place, rating, reviews, word, perks, amenities, room, labels, pictures, favorite, share, children,
}: Props) {

    return (

        <>

            <Immersive
                media={

                    <Slides
                        look="bleed"
                        items={pictures}
                        alt={title}
                        labels={labels}
                        counter
                        overlay={

                            <>

                                <Pebble href={back.href} label={back.label} shape="round" tone="snow" tooltip={false}>

                                    <Icon name="caret-start" weight="bold" />

                                </Pebble>

                                <Stack direction="row" align="center" gap={2}>

                                    <ShareButton title={favorite.name} labels={share} tone="snow" />

                                    <ProductFavorite {...favorite} compact tone="snow" />

                                </Stack>

                            </>

                        }
                    />

                }
            >

                <Stack gap={1}>

                    <Heading level={1} size="h2">{title}</Heading>

                    {place ? <Text size="small" tone="muted" dir="auto">{place}</Text> : null}

                </Stack>

                <Divider />

                {rating ? (

                    <>

                        <Stack direction="row" align="center" gap={3} wrap>

                            <Stack direction="row" align="center" gap={2}>

                                <Rating value={rating.value} label={rating.label} size="large" />

                                {reviews ? <Text as="span" size="small" tone="muted">{reviews}</Text> : null}

                            </Stack>

                            {word ? (

                                <>

                                    <Divider direction="vertical" />

                                    <Stack direction="row" align="center" gap={1}>

                                        <Icon name="seal" size="md" weight="fill" tone="accent" />

                                        <Text as="span" size="small" weight="semibold">{word}</Text>

                                    </Stack>

                                </>

                            ) : null}

                        </Stack>

                        <Divider />

                    </>

                ) : null}

                {perks.length ? (

                    <Stack as="ul" gap={2}>

                        {perks.map(( perk ) => (

                            <Stack as="li" key={perk} direction="row" align="center" gap={2}>

                                <Icon name="check" size="sm" weight="bold" tone="accent" />

                                <Text as="span" size="small" weight="medium" tone="accent">{perk}</Text>

                            </Stack>

                        ))}

                    </Stack>

                ) : null}

                {amenities.length ? (

                    <Stack as="ul" direction="row" gap={2} wrap>

                        {amenities.slice(0, 6).map(( amenity ) => (

                            <Tag key={amenity.key} as="li" icon={isIconName(amenity.icon) ? <Icon name={amenity.icon} /> : null}>

                                {amenity.term}

                            </Tag>

                        ))}

                    </Stack>

                ) : null}

                {room ? (

                    <Tile
                        as="div"
                        look="chosen"
                        size="large"
                        href={room.href}
                        title={room.name}
                        description={room.brief}
                        meta={

                            <>

                                <Amount {...room.price} currencyLabel={room.currencyLabel} size="title" />

                                {room.unit ? <Text as="span" size="label" tone="muted">{room.unit}</Text> : null}

                            </>

                        }
                    />

                ) : null}

            </Immersive>

            <Stack visibility="tablet" gap={10}>{children}</Stack>

        </>

    );

}
