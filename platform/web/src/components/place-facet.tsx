"use client";

import Autocomplete from "@/elements/autocomplete";
import Chip from "@/elements/chip";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import { usePlaceFacet } from "@/hooks/use-place-facet";
import Icon from "@/icons/icon";

type Props = {
    title: string; placeholder: string; empty: string; searching: string; clear: string;
    chosen: { label: string; href: string } | null;
};

export default function PlaceFacet ({ title, placeholder, empty, searching, clear, chosen }: Props) {

    const place = usePlaceFacet();

    return (

        <Stack gap={3}>

            <Heading level={3} size="label" tone="muted">{title}</Heading>

            {chosen ? (

                <Stack direction="row" wrap>

                    <Chip href={chosen.href} pressed label={clear} scroll={false}>

                        <Icon name="pin" size="sm" weight="fill" />

                        {chosen.label}

                        <Icon name="x" size="sm" weight="bold" />

                    </Chip>

                </Stack>

            ) : null}

            <Autocomplete
                id={`${place.id}-place`}
                look="field"
                labelVisible={false}
                label={title}
                placeholder={placeholder}
                clear={clear}
                query={place.term}
                value={null}
                options={place.places.map(( row ) => ({
                    value: row.id, label: row.label, detail: row.detail, leading: <Icon name="pin" size="md" tone="muted" />,
                }))}
                busy={place.searching || place.pending}
                status={place.searching ? searching : place.empty ? empty : null}
                onQueryChange={place.setTerm}
                onSelect={place.choose}
            />

        </Stack>

    );

}
