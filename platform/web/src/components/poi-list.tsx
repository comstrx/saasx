import type { ComponentProps } from "react";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import TileMap from "@/elements/tile-map";
import Icon, { isIconName } from "@/icons/icon";
import Section from "./section";

type Place = { key: string; name: string; kind: string; icon: string; distance?: string | null };
type Props = {
    id?: string; title: string; description?: string; items: readonly Place[];
    map?: Omit<ComponentProps<typeof TileMap>, "size" | "link"> | null;
};

export default function PoiList ({ id, title, description, items, map }: Props) {

    if ( !items.length ) return null;

    return (

        <Section id={id} title={title} description={description}>

            {map && map.points.length > 1 ? <TileMap {...map} size="section" /> : null}

            <Grid as="ul" columns={2} mobileColumns={1} gap={3} label={title}>

                {items.map(( place ) => (

                    <Stack as="li" key={place.key} direction="row" align="center" justify="between" gap={3}>

                        <Stack direction="row" align="center" gap={3}>

                            {isIconName(place.icon) ? <Icon name={place.icon} size="md" tone="muted" /> : null}

                            <Stack gap={0}>

                                <Text as="span" size="small" weight="medium" dir="auto" clamp={1}>{place.name}</Text>

                                {place.kind ? <Text as="span" size="label" tone="muted">{place.kind}</Text> : null}

                            </Stack>

                        </Stack>

                        {place.distance ? <Text as="span" size="label" tone="muted" numeric>{place.distance}</Text> : null}

                    </Stack>

                ))}

            </Grid>

        </Section>

    );

}
