import type { ComponentProps } from "react";
import Chip from "@/elements/chip";
import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Icon, { isIconName } from "@/icons/icon";
import FacetGroup from "./facet-group";
import PlaceFacet from "./place-facet";
import PriceFacet from "./price-facet";

type Group = Omit<ComponentProps<typeof FacetGroup>, "state"> & { key: string };
type Props = {
    title: string;
    state: string;
    clear: { href: string; label: string } | null;
    groups: readonly Group[];
    place: ComponentProps<typeof PlaceFacet> | null;
    price: (Omit<ComponentProps<typeof PriceFacet>, "title"> & { title: string }) | null;
    matches: { title: string; items: readonly { key: string; href: string; label: string; icon: string }[] } | null;
    heading?: boolean;
};

export default function FacetPanel ({ title, state, clear, groups, place, price, matches, heading = true }: Props) {

    const parts = [
        matches ? (

            <Stack key="matches" gap={3}>

                <Heading level={3} size="label" tone="muted">{matches.title}</Heading>

                <Stack direction="row" gap={2} wrap>

                    {matches.items.map(( item ) => (

                        <Chip key={item.key} href={item.href}>

                            {isIconName(item.icon) ? <Icon name={item.icon} size="sm" /> : null}

                            {item.label}

                        </Chip>

                    ))}

                </Stack>

            </Stack>

        ) : null,
        place ? <PlaceFacet key="place" {...place} /> : null,
        price ? <PriceFacet key={`price-${price.from}-${price.to}`} {...price} /> : null,
        ...groups.map(( { key, ...group } ) => <FacetGroup key={key} {...group} state={state} />),
    ].filter(Boolean);

    return (

        <Stack gap={5}>

            {heading ? (

                <Stack direction="row" align="center" justify="between" gap={3}>

                    <Stack direction="row" align="center" gap={2}>

                        <Icon name="sliders" size="md" tone="accent" />

                        <Heading level={2} size="title">{title}</Heading>

                    </Stack>

                    {clear ? <Link href={clear.href} variant="text" scroll={false}>{clear.label}</Link> : null}

                </Stack>

            ) : null}

            {parts.map(( part, index ) => (

                <Stack key={part?.key ?? index} gap={5}>

                    {index ? <Divider /> : null}

                    {part}

                </Stack>

            ))}

        </Stack>

    );

}
