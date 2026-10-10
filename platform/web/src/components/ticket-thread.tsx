"use client";

import Badge from "@/elements/badge";
import Bubble from "@/elements/bubble";
import Button from "@/elements/button";
import Form from "@/elements/form";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Menu from "@/elements/menu";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import Icon from "@/icons/icon";
import BackLink from "./back-link";
import FormFeedback from "./form-feedback";
import ReportDialog from "./report-dialog";

type Row = { key: string; mine: boolean; author: string; image: string | null; initials: string; text: string; time: string | null };
type Props = {
    back: { href: string; label: string };
    ticket: {
        id: number; title: string; status: { label: string; tone: "teal" | "ember" | "neutral" }; facts: readonly string[];
        order: { label: string; href: string } | null; open: boolean;
    };
    rows: readonly Row[];
    composer: {
        value: string; error?: string; failure: string | null; pending: boolean; id: ( key: string ) => string;
        onChange: ( value: string ) => void; onSubmit: () => void;
    };
    busy: boolean;
    labels: {
        reply: string; replyHint: string; send: string; actions: string; resolve: string; close: string; reopen: string; delete: string;
        closedTitle: string; closedBody: string; edit: string;
    };
    onChange: ( action: "close" | "resolve" | "reopen" ) => void;
    onDelete: () => void;
    onEdit: () => void;
};

export default function TicketThread ({ back, ticket, rows, composer, busy, labels, onChange, onDelete, onEdit }: Props) {

    return (

        <Stack gap={6}>

            <Stack gap={4}>

                <BackLink href={back.href} label={back.label} />

                <Stack direction="responsive" align="start" justify="between" gap={4}>

                    <Stack gap={2}>

                        <Stack direction="row" align="center" gap={3} wrap>

                            <Heading level={1} size="h2" wrap="balance">{ticket.title}</Heading>

                            <Badge tone={ticket.status.tone}>{ticket.status.label}</Badge>

                        </Stack>

                        <Stack direction="row" gap={4} wrap>

                            {ticket.facts.map(( fact ) => <Text key={fact} as="span" size="small" tone="muted">{fact}</Text>)}

                            {ticket.order ? <Link href={ticket.order.href} variant="inline">{ticket.order.label}</Link> : null}

                        </Stack>

                    </Stack>

                    <Stack direction="row" align="center" gap={2} fixed>

                        <ReportDialog feature="tickets" id={ticket.id} name={ticket.title} look="icon" />

                        <Menu
                            label={labels.actions} look="button" align="end" trigger={<><Icon name="dots" />{labels.actions}</>}
                            sections={[{
                                key: "ticket",
                                items: [
                                    ...(ticket.open ? [
                                        { key: "edit", label: labels.edit, icon: <Icon name="edit" />, disabled: busy, onSelect: onEdit },
                                        {
                                            key: "resolve", label: labels.resolve, icon: <Icon name="check-circle" />, disabled: busy,
                                            onSelect: () => onChange("resolve"),
                                        },
                                        {
                                            key: "close", label: labels.close, icon: <Icon name="x" />, disabled: busy,
                                            onSelect: () => onChange("close"),
                                        },
                                    ] : [
                                        {
                                            key: "reopen", label: labels.reopen, icon: <Icon name="reply" />, disabled: busy,
                                            onSelect: () => onChange("reopen"),
                                        },
                                    ]),
                                    {
                                        key: "delete", label: labels.delete, icon: <Icon name="trash" />, tone: "danger" as const,
                                        disabled: busy, onSelect: onDelete,
                                    },
                                ],
                            }]}
                        />

                    </Stack>

                </Stack>

            </Stack>

            <Surface padding={5} radius="lg">

                <Stack as="ul" gap={5}>

                    {rows.map(( row ) => (

                        <Bubble
                            key={row.key} side={row.mine ? "mine" : "theirs"} author={row.author} time={row.time}
                            avatar={<Portrait size="xsmall" src={row.image} alt="" initials={row.initials} />}
                        >

                            {row.text}

                        </Bubble>

                    ))}

                </Stack>

            </Surface>

            {ticket.open ? (

                <Surface padding={5} radius="lg">

                    <Form pending={composer.pending} noValidate onSubmit={( event ) => { event.preventDefault(); composer.onSubmit(); }}>

                        <Textarea
                            id={composer.id("content")} label={labels.reply} hint={labels.replyHint} rows={3} maxLength={10000} dir="auto"
                            value={composer.value} error={composer.error} disabled={composer.pending}
                            onChange={( event ) => composer.onChange(event.target.value)}
                        />

                        <FormFeedback id={composer.id("failure")} error={composer.failure} />

                        <Button type="submit" pending={composer.pending}><Icon name="share" />{labels.send}</Button>

                    </Form>

                </Surface>

            ) : (

                <Surface tone="track" elevation="none" padding={5} radius="lg">

                    <Stack direction="responsive" align="center" justify="between" gap={4}>

                        <Stack gap={1}>

                            <Text weight="semibold">{labels.closedTitle}</Text>

                            <Text size="small" tone="muted">{labels.closedBody}</Text>

                        </Stack>

                        <Button variant="outlined" disabled={busy} onClick={() => onChange("reopen")}>

                            <Icon name="reply" />{labels.reopen}

                        </Button>

                    </Stack>

                </Surface>

            )}

        </Stack>

    );

}
