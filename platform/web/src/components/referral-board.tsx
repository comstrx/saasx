"use client";

import type { ComponentProps } from "react";
import Art from "@/elements/art";
import Badge from "@/elements/badge";
import Button from "@/elements/button";
import Check from "@/elements/check";
import Heading from "@/elements/heading";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import BulkBar from "./bulk-bar";
import Section from "./section";
import SectionSkeleton from "./section-skeleton";
import StateNotice from "./state-notice";

type Props = {
    art: string; code: string | null; link: string | null; copied: boolean; busy: boolean;
    shares: readonly { key: string; url: string; label: string }[];
    items: readonly {
        key: string; id: number; name: string; image: string | null; initials: string; date: string | null; active: boolean;
    }[];
    loading: boolean;
    labels: {
        title: string; body: string; code: string; copy: string; copied: string; share: string; friends: string; count: string;
        active: string; inactive: string; remove: string; emptyTitle: string; emptyBody: string; noCode: string;
    };
    onCopy: ( value?: string ) => void; onRemove: ( id: number ) => void; onOpen: ( id: number ) => void;
    selection?: { ids: readonly number[]; pick: ( id: number, value: boolean ) => void; label: ( title: string ) => string } | null;
    bulk?: ComponentProps<typeof BulkBar> | null;
};

export default function ReferralBoard ({
    art, code, link, copied, busy, shares, items, loading, labels, onCopy, onRemove, onOpen, selection, bulk,
}: Props) {

    return (

        <Stack gap={10}>

            <Surface padding={8} radius="hero" elevation="medium">

                <Stack direction="wide" align="center" gap={8}>

                    <Art src={art} size="large" glow />

                    <Stack gap={5} grow>

                        <Stack gap={2}>

                            <Heading level={2} size="h2">{labels.title}</Heading>

                            <Text tone="muted" wrap="pretty">{labels.body}</Text>

                        </Stack>

                        {code || link ? (

                            <Stack gap={3}>

                                <Surface tone="track" elevation="none" padding={3} radius="md">

                                    <Stack direction="row" align="center" justify="between" gap={3}>

                                        <Stack gap={0}>

                                            <Text size="label" tone="muted">{labels.code}</Text>

                                            <Text weight="bold" numeric dir="ltr" truncate>{code ?? link}</Text>

                                        </Stack>

                                        <Button variant={copied ? "subtle" : "filled"} rounded="full" onClick={() => onCopy()}>

                                            <Icon name={copied ? "check" : "copy"} />{copied ? labels.copied : labels.copy}

                                        </Button>

                                    </Stack>

                                </Surface>

                                {shares.length ? (

                                    <Stack direction="row" align="center" gap={2} wrap>

                                        <Text size="small" tone="muted">{labels.share}</Text>

                                        {shares.map(( share ) => (

                                            <Button
                                                key={share.key} variant="outlined" size="small" rounded="full"
                                                onClick={() => onCopy(share.url)}
                                            >

                                                <Icon name="copy" />{share.label}

                                            </Button>

                                        ))}

                                    </Stack>

                                ) : null}

                            </Stack>

                        ) : <Text size="small" tone="muted">{labels.noCode}</Text>}

                    </Stack>

                </Stack>

            </Surface>

            <Section title={labels.friends} description={labels.count}>

                {bulk ? <BulkBar {...bulk} /> : null}

                {loading ? <SectionSkeleton /> : items.length ? (

                    <Surface padding={2} radius="lg">

                        <Stack as="ul" gap={1}>

                            {items.map(( item ) => (

                                <Surface key={item.key} as="li" tone="clear" border={false} elevation="none" padding={3} radius="md">

                                    <Stack direction="row" align="center" gap={4}>

                                        {selection ? (

                                            <Check
                                                id={`referral-select-${item.id}`} label={selection.label(item.name)}
                                                labelVisible={false} checked={selection.ids.includes(item.id)}
                                                onChange={( value ) => selection.pick(item.id, value)}
                                            />

                                        ) : null}

                                        <Portrait size="small" src={item.image} alt="" initials={item.initials} />

                                        <Stack gap={0} grow>

                                            <Button variant="link" size="small" align="start" onClick={() => onOpen(item.id)}>

                                                {item.name}

                                            </Button>

                                            {item.date ? <Text size="label" tone="muted">{item.date}</Text> : null}

                                        </Stack>

                                        <Badge tone={item.active ? "teal" : "neutral"} look="flat">

                                            {item.active ? labels.active : labels.inactive}

                                        </Badge>

                                        <Button
                                            variant="ghost" size="small" rounded="full" icon aria-label={`${labels.remove}: ${item.name}`}
                                            disabled={busy} onClick={() => onRemove(item.id)}
                                        >

                                            <Icon name="trash" />

                                        </Button>

                                    </Stack>

                                </Surface>

                            ))}

                        </Stack>

                    </Surface>

                ) : <StateNotice compact title={labels.emptyTitle} description={labels.emptyBody} />}

            </Section>

        </Stack>

    );

}
