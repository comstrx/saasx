"use client";

import Button from "@/elements/button";
import Chip from "@/elements/chip";
import Command from "@/elements/command";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Pebble from "@/elements/pebble";
import SearchTrigger from "@/elements/search-trigger";
import Stack from "@/elements/stack";
import Tile from "@/elements/tile";
import { useGlobalSearch } from "@/hooks/use-global-search";
import Icon from "@/icons/icon";
import StateNotice from "./state-notice";

type Vertical = { href: string; label: string; art: string | null };
type Props = {
    search: string | null;
    paths: { poi: string | null; campaign: string | null };
    verticals: readonly Vertical[];
    labels: {
        open: string; title: string; placeholder: string; close: string; clear: string; recent: string; forget: string; explore: string;
        places: string; categories: string; items: string; empty: string; emptyBody: string; failed: string; navigate: string;
        choose: string; dismiss: string; searchFor: string; stories: string; hosts: string; deals: string; spots: string;
    };
};

const icons = {
    geo: "pin", category: "grid", catalog: "tag", poi: "map", article: "news", vendor: "store", campaign: "megaphone",
} as const;
const order = ["catalog", "geo", "category", "poi", "campaign", "article", "vendor"] as const;

export default function GlobalSearch ({ search, paths, verticals, labels }: Props) {

    const data = useGlobalSearch(search, paths);
    const titles = {
        geo: labels.places, category: labels.categories, catalog: labels.items, poi: labels.spots, article: labels.stories,
        vendor: labels.hosts, campaign: labels.deals,
    };
    const groups = order
        .map(( kind ) => ({
            value: kind,
            label: titles[kind],
            items: data.hits.filter(( hit ) => hit.kind === kind).slice(0, kind === "catalog" ? 6 : 4).map(( hit ) => ({
                value: hit.value,
                label: hit.label,
                detail: hit.detail,
                leading: <Icon name={icons[kind]} />,
            })),
        }))
        .filter(( group ) => group.items.length > 0);

    return (

        <>

            <SearchTrigger label={labels.open} placeholder={labels.open} shortcut="⌘K" onClick={() => data.change(true)} />

            <Pebble label={labels.open} shape="round" visibility="compact" onClick={() => data.change(true)}>

                <Icon name="search" />

            </Pebble>

            <Command
                open={data.open}
                onOpenChange={data.change}
                title={labels.title}
                placeholder={labels.placeholder}
                close={labels.close}
                clear={labels.clear}
                query={data.query}
                groups={groups}
                busy={data.busy}
                status={data.failed ? labels.failed : null}
                hints={{ navigate: labels.navigate, open: labels.choose, close: labels.dismiss }}
                onQueryChange={data.setQuery}
                onSelect={data.select}
                onSubmit={search ? data.submit : undefined}
                empty={(

                    <StateNotice
                        compact
                        plain
                        art="/assets/images/brand/search.webp"
                        title={labels.empty}
                        description={labels.emptyBody}
                        action={search && data.query.trim() ? (

                            <Button variant="outlined" size="small" rounded="full" onClick={() => data.submit(data.query)}>

                                <Icon name="search" />{labels.searchFor}

                            </Button>

                        ) : null}
                    />

                )}
                idle={(

                    <Stack gap={5} inset="medium">

                        {data.recent.length ? (

                            <Stack gap={2}>

                                <Stack direction="row" align="center" justify="between" gap={3}>

                                    <Heading level={2} size="label" tone="muted">{labels.recent}</Heading>

                                    <Button variant="link" size="small" onClick={data.forget}>{labels.forget}</Button>

                                </Stack>

                                <Stack direction="row" gap={2} wrap>

                                    {data.recent.map(( entry ) => (

                                        <Chip key={entry} onClick={() => data.reuse(entry)}><Icon name="clock" />{entry}</Chip>

                                    ))}

                                </Stack>

                            </Stack>

                        ) : null}

                        {verticals.length ? (

                            <Stack gap={2}>

                                <Heading level={2} size="label" tone="muted">{labels.explore}</Heading>

                                <Grid columns={5} mobileColumns={3} gap={2} label={labels.explore}>

                                    {verticals.map(( vertical ) => (

                                        <Tile
                                            key={vertical.href}
                                            look="art"
                                            size="small"
                                            title={vertical.label}
                                            art={vertical.art}
                                            onSelect={() => data.visit(vertical.href)}
                                        />

                                    ))}

                                </Grid>

                            </Stack>

                        ) : null}

                    </Stack>

                )}
            />

        </>

    );

}
