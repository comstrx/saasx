"use client";

import Badge from "@/elements/badge";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Form from "@/elements/form";
import InboxRow from "@/elements/inbox-row";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import BulkBar from "./bulk-bar";
import ChipTabs from "./chip-tabs";
import FormFeedback from "./form-feedback";
import FormRetry from "./form-retry";
import MessageFields from "./message-fields";
import SectionSkeleton from "./section-skeleton";
import StateNotice from "./state-notice";

type Item = {
    id: number; key: string; title: string; body: string | null; href: string; when: string | null; order: string | null; replies: number;
    status: { label: string; tone: "teal" | "ember" | "neutral" };
};
type Props = {
    tabs: readonly { value: string; label: string; href: string }[]; status: string; items: readonly Item[];
    loading: boolean; failed: boolean; art: string; more: (() => void) | null;
    composer: {
        open: boolean; pending: boolean; error: string | null; values: { title: string; content: string }; errors: Record<string, string>;
        id: ( key: string ) => string; onChange: ( patch: Partial<{ title: string; content: string }> ) => void;
        onOpenChange: ( open: boolean ) => void; onSubmit: () => void;
    };
    selection: {
        ids: readonly number[]; pending: boolean; toggle: ( id: number, value: boolean ) => void; clear: () => void; remove: () => void;
        labels: { select: ( title: string ) => string; count: string; remove: string; clear: string };
    };
    labels: {
        tabs: string; create: string; createTitle: string; createHint: string; subject: string; message: string; send: string;
        close: string; retry: string; unavailable: string; emptyTitle: string; emptyBody: string; more: string; order: string;
    };
    onReload: () => void;
};

export default function TicketList ({ tabs, status, items, loading, failed, art, more, composer, selection, labels, onReload }: Props) {

    return (

        <Stack gap={6}>

            <Stack direction="responsive" align="center" justify="between" gap={3}>

                <ChipTabs label={labels.tabs} current={status} tabs={tabs} />

                {selection.ids.length ? (

                    <BulkBar
                        count={selection.labels.count} clear={selection.labels.clear} busy={selection.pending} onClear={selection.clear}
                        actions={[
                            { key: "remove", label: selection.labels.remove, icon: "trash", danger: true, onSelect: selection.remove },
                        ]}
                    />

                ) : (

                    <Button rounded="full" onClick={() => composer.onOpenChange(true)}><Icon name="plus" />{labels.create}</Button>

                )}

            </Stack>

            {failed ? <FormRetry id="tickets-failure" message={labels.unavailable} label={labels.retry} onRetry={onReload} />
                : loading ? <SectionSkeleton />
                : !items.length ? (

                    <StateNotice
                        art={art} title={labels.emptyTitle} description={labels.emptyBody}
                        action={<Button onClick={() => composer.onOpenChange(true)}><Icon name="plus" />{labels.create}</Button>}
                    />

                ) : (

                    <Surface padding={2} radius="lg">

                        <Stack as="ul" gap={1}>

                            {items.map(( item ) => (

                                <InboxRow
                                    key={item.key} title={item.title} body={item.body} time={item.when} href={item.href}
                                    icon={<Icon name="support" />}
                                    select={items.length > 1 ? {
                                        id: `ticket-select-${item.id}`, label: selection.labels.select(item.title),
                                        checked: selection.ids.includes(item.id), onChange: ( value ) => selection.toggle(item.id, value),
                                    } : null}
                                    marker={<Badge tone={item.status.tone} look="flat">{item.status.label}</Badge>}
                                    actions={item.order ? (

                                        <Text as="span" size="label" tone="muted">{`${labels.order} ${item.order}`}</Text>

                                    ) : undefined}
                                />

                            ))}

                        </Stack>

                    </Surface>

                )}

            {more ? <Stack direction="row" justify="center"><Button variant="outlined" onClick={more}>{labels.more}</Button></Stack> : null}

            <Dialog
                open={composer.open} onOpenChange={composer.onOpenChange} title={labels.createTitle} description={labels.createHint}
                close={labels.close} dismissible={!composer.pending}
            >

                <Form pending={composer.pending} noValidate onSubmit={( event ) => { event.preventDefault(); composer.onSubmit(); }}>

                    <MessageFields
                        title={labels.subject} content={labels.message} values={composer.values} errors={composer.errors}
                        id={composer.id} disabled={composer.pending} onChange={composer.onChange}
                    />

                    <FormFeedback id={composer.id("failure")} error={composer.error} />

                    <Button type="submit" width="full" pending={composer.pending}><Icon name="share" />{labels.send}</Button>

                </Form>

            </Dialog>

        </Stack>

    );

}
