"use client";

import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Emblem from "@/elements/emblem";
import Field from "@/elements/field";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import { useOrderHelp } from "@/hooks/use-order-help";
import Icon from "@/icons/icon";

type Props = {
    orderId: number;
    links: { messages: string; ticket: string };
    labels: {
        title: string; body: string; message: string; ticket: string; ticketTitle: string; ticketBody: string; subject: string;
        details: string; send: string; cancel: string; close: string; failed: string; opened: string;
    };
};

export default function OrderHelp ({ orderId, links, labels }: Props) {

    const help = useOrderHelp(orderId, links, { failed: labels.failed, opened: labels.opened });

    return (

        <Surface padding={6} radius="xl">

            <Stack gap={4}>

                <Stack direction="row" align="center" gap={3}>

                    <Emblem tone="teal" size="medium"><Icon name="headset" /></Emblem>

                    <Stack gap={0}>

                        <Heading level={2} size="title">{labels.title}</Heading>

                        <Text size="small" tone="muted">{labels.body}</Text>

                    </Stack>

                </Stack>

                <Stack gap={2}>

                    <Button variant="outlined" width="full" pending={help.messaging} onClick={() => { void help.message(); }}>

                        <Icon name="chat" />{labels.message}

                    </Button>

                    <Button variant="subtle" width="full" onClick={() => help.setOpen(true)}>

                        <Icon name="support" />{labels.ticket}

                    </Button>

                </Stack>

            </Stack>

            <Dialog
                open={help.open}
                onOpenChange={help.setOpen}
                title={labels.ticketTitle}
                description={labels.ticketBody}
                close={labels.close}
                footer={(

                    <>

                        <Button variant="ghost" onClick={() => help.setOpen(false)}>{labels.cancel}</Button>

                        <Button pending={help.submitting} disabled={!help.ready} onClick={() => { void help.submit(); }}>

                            <Icon name="check" />{labels.send}

                        </Button>

                    </>

                )}
            >

                <Stack gap={4}>

                    <Field
                        id={`order-${orderId}-subject`}
                        label={labels.subject}
                        value={help.title}
                        maxLength={200}
                        onChange={( event ) => help.setTitle(event.target.value)}
                    />

                    <Textarea
                        id={`order-${orderId}-details`}
                        label={labels.details}
                        value={help.content}
                        rows={5}
                        maxLength={10000}
                        onChange={( event ) => help.setContent(event.target.value)}
                    />

                </Stack>

            </Dialog>

        </Surface>

    );

}
