import type { ReactNode } from "react";
import Badge from "@/elements/badge";
import Breadcrumbs from "@/elements/breadcrumbs";
import Rating from "@/elements/rating";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import PageHeader from "./page-header";

type Props = {
    title: string;
    trail: { label: string; items: readonly { label: string; href?: string }[] };
    description?: string | null;
    art: string;
    kind?: string | null;
    rating?: { value: string; count: string; label: string } | null;
    location?: string | null;
    facts?: readonly string[];
    children?: ReactNode;
};

export default function EntityHero ({ title, trail, description, art, kind, rating, location, facts = [], children }: Props) {

    return (

        <PageHeader
            heading
            title={title}
            description={description ?? undefined}
            art={art}
            kicker={<Breadcrumbs label={trail.label} items={trail.items} />}
            meta={

                <Stack gap={5}>

                    <Stack direction="row" align="center" gap={4} wrap>

                        {kind ? <Badge tone="ivory" size="large">{kind}</Badge> : null}

                        {rating ? <Rating {...rating} size="medium" /> : null}

                        {location ? (

                            <Stack direction="row" align="center" gap={1}>

                                <Icon name="pin" size="sm" tone="accent" />

                                <Text as="span" size="small" dir="auto">{location}</Text>

                            </Stack>

                        ) : null}

                        {facts.map(( fact ) => <Text key={fact} as="span" size="small" tone="muted">{fact}</Text>)}

                    </Stack>

                    {children}

                </Stack>

            }
        />

    );

}
