"use client";

import type { ComponentProps } from "react";
import Badge from "@/elements/badge";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Heading from "@/elements/heading";
import InboxRow from "@/elements/inbox-row";
import Menu from "@/elements/menu";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Textarea from "@/elements/textarea";
import type { ActivityTarget } from "@/hooks/use-activity-details";
import Icon, { isIconName } from "@/icons/icon";
import ActivityDetails from "./activity-details";
import BulkBar from "./bulk-bar";
import ChipTabs from "./chip-tabs";
import FormRetry from "./form-retry";
import MoreButton from "./more-button";
import SectionSkeleton from "./section-skeleton";
import StateNotice from "./state-notice";

type Entry = {
    key: string; title: string; body: string | null; time: string | null; icon: string;
    edit?: { kind: "comment" | "report"; id: number; content: string }; status?: string | null; open?: ActivityTarget;
};
type Props = {
    tabs: readonly { value: string; label: string; href: string }[]; view: string;
    groups: readonly { key: string; title: string; items: readonly Entry[] }[];
    loading: boolean; failed: boolean; busy: boolean; more: (() => void) | null; art: string;
    editing: { kind: "comment" | "report"; id: number; content: string } | null;
    labels: {
        tabs: string; retry: string; unavailable: string; emptyTitle: string; emptyBody: string; more: string;
        actions: string; edit: string; remove: string; save: string; cancel: string; editTitle: string; content: string; close: string;
    };
    onEdit: ( value: { kind: "comment" | "report"; id: number; content: string } | null ) => void;
    onSave: () => void; onRemove: ( kind: "comment" | "report", id: number ) => void; onReload: () => void;
    opened: ActivityTarget | null; onOpen: ( target: ActivityTarget | null ) => void;
    selection?: { ids: readonly number[]; pick: ( id: number, value: boolean ) => void; label: ( title: string ) => string } | null;
    bulk?: ComponentProps<typeof BulkBar> | null;
};

export default function ActivityBoard ( props: Props ) {

    const { labels } = props;

    return (

        <Stack gap={6}>

            <ChipTabs label={labels.tabs} current={props.view} tabs={props.tabs} />

            {props.bulk ? <BulkBar {...props.bulk} /> : null}

            {props.failed ? <FormRetry id="activity-failure" message={labels.unavailable} label={labels.retry} onRetry={props.onReload} />
                : props.loading ? <SectionSkeleton />
                : !props.groups.length ? <StateNotice art={props.art} title={labels.emptyTitle} description={labels.emptyBody} />
                : (

                    <Surface padding={2} radius="lg">

                        <Stack gap={4}>

                            {props.groups.map(( group ) => (

                                <Stack key={group.key} gap={1}>

                                    <Heading level={2} size="label" tone="muted">{group.title}</Heading>

                                    <Stack as="ul" gap={1}>

                                        {group.items.map(( item ) => (

                                            <InboxRow
                                                key={item.key} title={item.title} body={item.body} time={item.time}
                                                icon={isIconName(item.icon) ? <Icon name={item.icon} /> : null}
                                                marker={item.status ? <Badge look="flat">{item.status}</Badge> : null}
                                                onOpen={item.open ? () => props.onOpen(item.open ?? null) : undefined}
                                    select={props.selection && item.edit ? {
                                        id: `activity-select-${item.key}`, label: props.selection.label(item.title),
                                        checked: props.selection.ids.includes(item.edit.id),
                                        onChange: ( value ) => {

                                            if ( item.edit && props.selection ) props.selection.pick(item.edit.id, value);

                                        },
                                    } : null}
                                                actions={item.edit ? (

                                                    <Menu
                                                        label={labels.actions} look="ghost" align="end" trigger={<Icon name="dots" />}
                                                        sections={[{
                                                            key: "entry",
                                                            items: [
                                                                {
                                                                    key: "edit", label: labels.edit, icon: <Icon name="edit" />,
                                                                    disabled: props.busy,
                                                                    onSelect: () => props.onEdit(item.edit ?? null),
                                                                },
                                                                {
                                                                    key: "remove", label: labels.remove, icon: <Icon name="trash" />,
                                                                    tone: "danger" as const, disabled: props.busy,
                                                                    onSelect: () => {

                                                                        if ( item.edit ) props.onRemove(item.edit.kind, item.edit.id);

                                                                    },
                                                                },
                                                            ],
                                                        }]}
                                                    />

                                                ) : undefined}
                                            />

                                        ))}

                                    </Stack>

                                </Stack>

                            ))}

                        </Stack>

                    </Surface>

                )}

            <MoreButton label={labels.more} onClick={props.more} />

            <ActivityDetails target={props.opened} onClose={() => props.onOpen(null)} />

            <Dialog
                open={props.editing != null} onOpenChange={( open ) => { if ( !open ) props.onEdit(null); }} title={labels.editTitle}
                close={labels.close} dismissible={!props.busy}
            >

                <Stack gap={4}>

                    <Textarea
                        id="activity-edit" label={labels.content} rows={4} maxLength={5000} dir="auto" value={props.editing?.content ?? ""}
                        disabled={props.busy}
                        onChange={( event ) => props.onEdit(props.editing ? { ...props.editing, content: event.target.value } : null)}
                    />

                    <Stack direction="row" gap={2} justify="end">

                        <Button variant="ghost" disabled={props.busy} onClick={() => props.onEdit(null)}>{labels.cancel}</Button>

                        <Button pending={props.busy} onClick={props.onSave}>{labels.save}</Button>

                    </Stack>

                </Stack>

            </Dialog>

        </Stack>

    );

}
