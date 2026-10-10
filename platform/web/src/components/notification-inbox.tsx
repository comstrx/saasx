"use client";

import Button from "@/elements/button";
import Counter from "@/elements/counter";
import Heading from "@/elements/heading";
import InboxRow from "@/elements/inbox-row";
import Link from "@/elements/link";
import Menu from "@/elements/menu";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Icon, { isIconName } from "@/icons/icon";
import BulkBar from "./bulk-bar";
import FormRetry from "./form-retry";
import MoreButton from "./more-button";
import SectionSkeleton from "./section-skeleton";
import StateNotice from "./state-notice";

type Item = {
    id: number; title: string; body: string | null; read: boolean; pinned: boolean; when: string | null; icon: string; href: string | null;
};
type Props = {
    tabs: readonly { value: string; label: string; count: number; href: string }[];
    show: string;
    groups: readonly { key: string; title: string; items: readonly Item[] }[];
    loading: boolean; failed: boolean; busy: number | "all" | null; unread: number; art: string;
    labels: {
        tabs: string; readAll: string; read: string; unread: string; pin: string; unpin: string; delete: string;
        actions: string; pinned: string; more: string; retry: string; unavailable: string; emptyTitle: string; emptyBody: string;
        working: string;
    };
    more: (() => void) | null;
    selection: {
        ids: readonly number[]; pick: ( id: number, value: boolean ) => void; clear: () => void;
        run: ( kind: "read" | "unread" | "pin" | "unpin" | "delete" ) => void;
        labels: {
            select: ( title: string ) => string; count: string; clear: string; read: string; unread: string; pin: string; delete: string;
        };
    };
    onReload: () => void; onReadAll: () => void; onRead: ( id: number, read: boolean ) => void;
    onPin: ( id: number, pinned: boolean ) => void; onRemove: ( id: number ) => void; onOpen: ( id: number ) => void;
};

export default function NotificationInbox ( props: Props ) {

    const { labels, selection } = props;
    const bulk = [
        { key: "read", label: selection.labels.read, icon: "check-circle" as const, onSelect: () => selection.run("read") },
        { key: "unread", label: selection.labels.unread, icon: "mail" as const, onSelect: () => selection.run("unread") },
        { key: "pin", label: selection.labels.pin, icon: "push-pin" as const, onSelect: () => selection.run("pin") },
        { key: "delete", label: selection.labels.delete, icon: "trash" as const, danger: true, onSelect: () => selection.run("delete") },
    ];

    return (

        <Stack gap={6}>

            <Stack direction="responsive" align="center" justify="between" gap={3}>

                <Stack direction="row" gap={2} wrap aria-label={labels.tabs} role="group">

                    {props.tabs.map(( tab ) => (

                        <Link key={tab.value} href={tab.href} variant="chip" active={tab.value === props.show} replace scroll={false}>

                            {tab.label}

                            {tab.count ? <Counter value={tab.count} tone={tab.value === "unread" ? "ember" : "quiet"} /> : null}

                        </Link>

                    ))}

                </Stack>

                {props.selection.ids.length ? (

                    <BulkBar
                        count={props.selection.labels.count}
                        clear={props.selection.labels.clear}
                        busy={props.busy === "all"}
                        onClear={props.selection.clear}
                        actions={bulk}
                    />

                ) : props.unread ? (

                    <Button variant="ghost" size="small" pending={props.busy === "all"} onClick={props.onReadAll}>

                        <Icon name="check-circle" />{labels.readAll}

                    </Button>

                ) : null}

            </Stack>

            {props.failed ? (

                <FormRetry id="notifications-failure" message={labels.unavailable} label={labels.retry} onRetry={props.onReload} />

            )
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
                                                key={item.id}
                                                title={item.title}
                                                body={item.body}
                                                time={item.when}
                                                href={item.href}
                                                onOpen={item.href ? undefined : () => props.onOpen(item.id)}
                                                unread={!item.read}
                                                busy={props.busy === item.id ? labels.working : null}
                                                select={{
                                                    id: `notification-select-${item.id}`, label: props.selection.labels.select(item.title),
                                                    checked: props.selection.ids.includes(item.id),
                                                    onChange: ( value ) => props.selection.pick(item.id, value),
                                                }}
                                                icon={isIconName(item.icon) ? <Icon name={item.icon} /> : null}
                                                marker={item.pinned ? (

                                                    <Icon name="push-pin" size="sm" tone="accent" label={labels.pinned} />

                                                ) : null}
                                                actions={(

                                                    <Menu
                                                        label={labels.actions}
                                                        look="ghost"
                                                        align="end"
                                                        trigger={<Icon name="dots" />}
                                                        sections={[{
                                                            key: "item",
                                                            items: [
                                                                {
                                                                    key: "read", label: item.read ? labels.unread : labels.read,
                                                                    icon: <Icon name={item.read ? "mail" : "check"} />,
                                                                    disabled: props.busy === item.id,
                                                                    onSelect: () => props.onRead(item.id, item.read),
                                                                },
                                                                {
                                                                    key: "pin", label: item.pinned ? labels.unpin : labels.pin,
                                                                    icon: <Icon name="push-pin" />, disabled: props.busy === item.id,
                                                                    onSelect: () => props.onPin(item.id, item.pinned),
                                                                },
                                                                {
                                                                    key: "delete", label: labels.delete, tone: "danger",
                                                                    icon: <Icon name="trash" />, disabled: props.busy === item.id,
                                                                    onSelect: () => props.onRemove(item.id),
                                                                },
                                                            ],
                                                        }]}
                                                    />

                                                )}
                                            />

                                        ))}

                                    </Stack>

                                </Stack>

                            ))}

                        </Stack>

                    </Surface>

                )}

            <MoreButton label={labels.more} onClick={props.more} />

        </Stack>

    );

}
