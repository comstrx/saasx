"use client";

import type { ReactNode } from "react";
import Card from "@/elements/card";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Media from "@/elements/media";
import Pebble from "@/elements/pebble";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = {
    title: string; kind: string; date?: string; image?: string | null; href?: string | null;
    selection?: ReactNode; unavailable?: string; remove?: { label: string; onClick: () => void }; disabled?: boolean;
};

export default function SavedItem ( props: Props ) {

    return (

        <Card
            media={<Media src={props.image ?? null} alt="" ratio="card" />}
            actions={props.remove ? (

                <Pebble label={props.remove.label} shape="round" disabled={props.disabled} onClick={props.remove.onClick}>

                    <Icon name="trash" size="md" />

                </Pebble>

            ) : undefined}
            footer={props.date || props.selection ? (

                <Stack direction="row" align="center" justify={props.date ? "between" : "end"} gap={3}>

                    {props.date ? <Text size="small" tone="muted">{props.date}</Text> : null}

                    {props.selection}

                </Stack>

            ) : undefined}
        >

            <Text size="label" tone="muted">{props.kind}</Text>

            <Heading level={3} size="title" clamp={2}>

                {props.href ? <Link href={props.href} variant="card" dir="auto">{props.title}</Link>
                    : <Text as="span" dir="auto" size="title" weight="semibold">{props.title}</Text>}

            </Heading>

            {props.unavailable ? <Text size="small" tone="muted">{props.unavailable}</Text> : null}

        </Card>

    );

}
