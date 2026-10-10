import type { ComponentProps } from "react";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import TileMap from "@/elements/tile-map";
import Icon from "@/icons/icon";
import type { Money } from "@/lib/std/format";
import SearchList from "./search-list";

type Item = ComponentProps<typeof SearchList>["items"][number] & { point: { latitude: number; longitude: number } | null };
type Props = {
    items: readonly Item[];
    map: { tiles: string; credit: string };
    labels: { map: string; unmapped: string; list: string; details: string };
};

function price ( value: Money ): string {

    return value.before ? `${value.currency} ${value.number}` : `${value.number} ${value.currency}`;

}
export default function SearchMap ({ items, map, labels }: Props) {

    const placed = items.flatMap(( item ) => (item.point ? [{
        key: item.card.key,
        latitude: item.point.latitude,
        longitude: item.point.longitude,
        label: item.card.price ? price(item.card.price.now) : item.card.rating?.value ?? "•",
        title: item.card.title,
        href: item.card.href,
        image: item.card.image,
        meta: item.card.place,
    }] : []));
    const missing = items.length - placed.length;

    return (

        <Stack gap={5}>

            {placed.length ? <TileMap label={labels.map} credit={map.credit} tiles={map.tiles} points={placed} /> : null}

            {missing ? (

                <Stack direction="row" align="center" gap={2}>

                    <Icon name="pin-line" size="sm" tone="muted" />

                    <Text as="span" size="small" tone="muted">{labels.unmapped}</Text>

                </Stack>

            ) : null}

            <SearchList items={items} view="grid" label={labels.list} details={labels.details} />

        </Stack>

    );

}
