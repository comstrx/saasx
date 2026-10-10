import type { ReactNode } from "react";
import Divider from "@/elements/divider";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Portrait from "@/elements/portrait";
import RichText from "@/elements/rich-text";
import Stack from "@/elements/stack";
import Stars from "@/elements/stars";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import { initials } from "@/lib/std/text";

type Props = {
    dividers?: boolean;
    layout?: "stack" | "pairs";
    items: readonly {
        id: number;
        name: string;
        image?: string | null;
        title?: string | null;
        content?: string | null;
        date: string | null;
        rating: string | null;
        stars?: number | null;
        status?: string; details?: ReactNode; actions?: ReactNode; discussion?: ReactNode;
    }[];
};

function Body ({ item }: { item: Props["items"][number] }) {

    return (

        <Stack gap={3}>

            <Stack direction="row" gap={3} align="center">

                <Portrait src={item.image} alt="" initials={initials(item.name)} size="small" />

                <Stack gap={0} grow>

                    <Text weight="semibold" size="small" dir="auto">{item.name}</Text>

                    {item.date || item.status ? (

                        <Text size="label" tone="muted">{[item.date, item.status].filter(Boolean).join(" · ")}</Text>

                    ) : null}

                </Stack>

                {item.stars ? <Stars value={item.stars} label={item.rating ?? String(item.stars)} size="small" /> : item.rating ? (

                    <Stack direction="row" align="center" gap={1}>

                        <Icon name="star" size="sm" weight="fill" />

                        <Text size="small" numeric>{item.rating}</Text>

                    </Stack>

                ) : null}

            </Stack>

            {item.title ? <Heading level={3} size="title" wrap="pretty">{item.title}</Heading> : null}

            {item.content ? <RichText value={item.content} /> : null}

            {item.details}

            {item.actions}

            {item.discussion}

        </Stack>

    );

}
export default function ReviewList ({ items, dividers = true, layout = "stack" }: Props) {

    if ( !dividers ) return (

        <Stack role="list" gap={5}>

            {items.map(( item, index ) => (

                <Stack key={item.id} role="listitem" as="div" gap={5}>

                    <Body item={item} />

                    {index < items.length - 1 ? <Divider /> : null}

                </Stack>

            ))}

        </Stack>

    );

    return (

        <Grid as="ul" columns={layout === "pairs" ? "pairs" : 1} gap={4} align="start">

            {items.map(( item ) => (

                <Surface key={item.id} as="li" padding={6} radius="lg">

                    <Body item={item} />

                </Surface>

            ))}

        </Grid>

    );

}
