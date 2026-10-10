import type { ComponentProps } from "react";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Score from "@/elements/score";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import TileMap from "@/elements/tile-map";
import Icon from "@/icons/icon";

type Pin = ComponentProps<typeof TileMap>["points"][number];
type Props = {
    score: { value: string; word: string; detail: string; label: string } | null;
    empty: string;
    reviews?: { href: string; label: string } | null;
    place?: {
        title: string; address: string | null; map: { href: string; label: string } | null;
        view?: Pick<ComponentProps<typeof TileMap>, "tiles" | "credit"> & { point: Pin } | null;
    } | null;
};

export default function ScorePanel ({ score, empty, reviews, place }: Props) {

    return (

        <Stack gap={4}>

            <Surface padding={5} radius="lg">

                <Stack gap={3}>

                    {score ? <Score {...score} size="large" /> : <Text size="small" tone="muted">{empty}</Text>}

                    {reviews ? <Link href={reviews.href} variant="text">{reviews.label}</Link> : null}

                </Stack>

            </Surface>

            {place ? (

                <Surface padding={5} radius="lg" tone="track" elevation="none">

                    <Stack gap={3}>

                        <Stack direction="row" align="center" gap={2}>

                            <Icon name="map" size="md" tone="accent" />

                            <Heading level={2} size="label">{place.title}</Heading>

                        </Stack>

                        {place.view ? (

                            <TileMap
                                label={place.title} tiles={place.view.tiles} credit={place.view.credit} points={[place.view.point]}
                                size="inset"
                                link={place.map ? { ...place.map, glyph: <Icon name="external" /> } : null}
                            />

                        ) : null}

                        {place.address ? <Text size="small" tone="muted" dir="auto">{place.address}</Text> : null}

                        {place.map && !place.view ? (

                            <Link href={place.map.href} variant="outlined" size="small" target="_blank" rel="noopener">

                                {place.map.label}

                            </Link>

                        ) : null}

                    </Stack>

                </Surface>

            ) : null}

        </Stack>

    );

}
