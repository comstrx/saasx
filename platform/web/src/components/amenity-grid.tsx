"use client";

import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Emblem from "@/elements/emblem";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useAmenityGrid } from "@/hooks/use-amenity-grid";
import Icon, { isIconName } from "@/icons/icon";
import Section from "./section";

type Amenity = { key: string; term: string; icon?: string };
type Group = { key: string; title: string; items: readonly Amenity[] };
type Props = {
    id?: string;
    title: string;
    items: readonly Amenity[];
    groups?: readonly Group[];
    limit?: number;
    more: string;
    close: string;
};

function Item ({ amenity }: { amenity: Amenity }) {

    const missing = amenity.icon === "ban";

    return (

        <Stack as="li" direction="row" align="center" gap={3}>

            <Emblem tone="neutral" size="small" look="flat">

                <Icon name={isIconName(amenity.icon) ? amenity.icon : "check"} tone={missing ? "muted" : "ink"} />

            </Emblem>

            <Text as="span" size="value" tone={missing ? "muted" : "ink"} dir="auto">{amenity.term}</Text>

        </Stack>

    );

}
export default function AmenityGrid ({ id, title, items, groups = [], limit = 10, more, close }: Props) {

    const dialog = useAmenityGrid();

    if ( !items.length ) return null;

    return (

        <Section id={id} title={title}>

            <Stack gap={5} align="start">

                <Grid as="ul" columns={3} mobileColumns={1} gap={4} label={title}>

                    {items.slice(0, limit).map(( amenity ) => <Item key={amenity.key} amenity={amenity} />)}

                </Grid>

                {items.length > limit ? <Button variant="outlined" onClick={dialog.show}>{more}</Button> : null}

            </Stack>

            <Dialog open={dialog.open} onOpenChange={dialog.setOpen} title={title} close={close} size="medium">

                <Stack gap={8}>

                    {(groups.length ? groups : [{ key: "all", title: "", items }]).map(( group ) => (

                        <Stack key={group.key} gap={4}>

                            {group.title ? <Heading level={3} size="title">{group.title}</Heading> : null}

                            <Grid as="ul" columns={2} mobileColumns={1} gap={4} label={group.title || title}>

                                {group.items.map(( amenity ) => <Item key={amenity.key} amenity={amenity} />)}

                            </Grid>

                        </Stack>

                    ))}

                </Stack>

            </Dialog>

        </Section>

    );

}
