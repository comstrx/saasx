import type { ComponentProps } from "react";
import Chip from "@/elements/chip";
import Faceted from "@/elements/faceted";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import EmptyResults from "./empty-results";
import FacetPanel from "./facet-panel";
import FacetSheet from "./facet-sheet";
import Pager from "./pager";
import SearchList from "./search-list";
import SearchMap from "./search-map";
import SectionTabs from "./section-tabs";
import SortMenu from "./sort-menu";
import ViewSwitch from "./view-switch";

type Panel = Omit<ComponentProps<typeof FacetPanel>, "heading"> & { label: string };
type Props = {
    view: "list" | "grid" | "map";
    items: ComponentProps<typeof SearchMap>["items"];
    map: ComponentProps<typeof SearchMap>["map"] | null;
    tabs: ComponentProps<typeof SectionTabs> | null;
    side: Panel;
    toolbar: {
        title: string;
        note: string;
        applied: string;
        chips: readonly { key: string; label: string; remove: string; href: string }[];
        filters: { label: string; count: number; show: string; close: string };
        sortLabel: string;
        sorts: ComponentProps<typeof SortMenu>["choices"];
        views: ComponentProps<typeof ViewSwitch>;
    };
    labels: { details: string; list: string; map: string; unmapped: string };
    empty: ComponentProps<typeof EmptyResults>;
    clear: { href: string; label: string } | null;
    pager: ComponentProps<typeof Pager>;
};

export default function FacetedResults ({ view, items, map, tabs, side, toolbar, labels, empty, clear, pager }: Props) {

    const { label, ...panel } = side;

    return (

        <Stack gap={6}>

            {tabs ? <SectionTabs {...tabs} /> : null}

            <Faceted
                label={label}
                side={<Surface padding={6} radius="lg"><FacetPanel {...panel} /></Surface>}
            >

                <Stack gap={4}>

                    <Stack direction="wide" justify="between" gap={4}>

                        <Stack gap={1}>

                            <Heading level={2} size="h3" wrap="balance">{toolbar.title}</Heading>

                            <Stack direction="row" align="center" gap={1}>

                                <Icon name="tag" size="sm" tone="success" />

                                <Text as="span" size="small" tone="muted">{toolbar.note}</Text>

                            </Stack>

                        </Stack>

                        <Stack direction="row" align="center" gap={2} wrap>

                            <FacetSheet panel={panel} labels={toolbar.filters} />

                            <SortMenu label={toolbar.sortLabel} choices={toolbar.sorts} />

                            <ViewSwitch {...toolbar.views} />

                        </Stack>

                    </Stack>

                    {toolbar.chips.length ? (

                        <Stack direction="row" align="center" gap={2} wrap role="group" aria-label={toolbar.applied}>

                            {toolbar.chips.map(( chip ) => (

                                <Chip key={chip.key} href={chip.href} pressed label={chip.remove} scroll={false}>

                                    {chip.label}

                                    <Icon name="x" size="sm" weight="bold" />

                                </Chip>

                            ))}

                            {clear ? <Link href={clear.href} variant="text" scroll={false}>{clear.label}</Link> : null}

                        </Stack>

                    ) : null}

                </Stack>

                {items.length && view === "map" && map ? <SearchMap items={items} map={map} labels={labels} /> : items.length ? (

                    <SearchList items={items} view={view === "map" ? "grid" : view} label={labels.list} details={labels.details} />

                ) : (

                    <EmptyResults {...empty} clear={clear} />

                )}

                {items.length && (pager.previous || pager.next) ? <Pager {...pager} /> : null}

            </Faceted>

        </Stack>

    );

}
