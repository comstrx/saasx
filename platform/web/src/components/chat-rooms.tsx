"use client";

import Button from "@/elements/button";
import Counter from "@/elements/counter";
import Field from "@/elements/field";
import InboxRow from "@/elements/inbox-row";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import ChipTabs from "./chip-tabs";
import FormRetry from "./form-retry";
import SectionSkeleton from "./section-skeleton";
import StateNotice from "./state-notice";

type Room = {
    key: string; href: string; title: string; image: string | null; initials: string; preview: string | null; time: string | null;
    unread: number; current: boolean; flags: { pinned: boolean; muted: boolean };
};
type Found = { key: string; href: string; title: string; text: string; time: string | null };
type Props = {
    tabs: readonly { value: string; label: string; href: string; count: number }[]; tab: string;
    rooms: readonly Room[]; filter: string; loading: boolean; failed: boolean; contacting: boolean; art: string;
    found: { active: boolean; loading: boolean; items: readonly Found[] };
    labels: {
        tabs: string; search: string; support: string; compose: string; retry: string; unavailable: string; emptyTitle: string;
        emptyBody: string; results: string; noResults: string; pinned: string; muted: string;
    };
    onFilter: ( value: string ) => void; onSupport: () => void; onCompose: () => void; onReload: () => void;
};

export default function ChatRooms ( props: Props ) {

    const { labels } = props;

    return (

        <Stack gap={4}>

            <Stack direction="row" gap={2} align="center">

                <Stack grow>

                    <Field
                        id="chat-filter" label={labels.search} labelHidden type="search" value={props.filter} placeholder={labels.search}
                        start={<Icon name="search" tone="muted" />} onChange={( event ) => props.onFilter(event.target.value)}
                    />

                </Stack>

                <Button variant="subtle" rounded="full" icon aria-label={labels.compose} onClick={props.onCompose}>

                    <Icon name="note-pencil" />

                </Button>

                <Button
                    variant="subtle" rounded="full" icon aria-label={labels.support} pending={props.contacting} onClick={props.onSupport}
                >

                    <Icon name="support" />

                </Button>

            </Stack>

            <ChipTabs
                label={labels.tabs}
                current={props.tab}
                tabs={props.tabs.map(( tab ) => ({ ...tab, meta: tab.count ? <Counter value={tab.count} /> : null }))}
            />

            {props.found.active ? (

                <Stack gap={2}>

                    <Text size="label" tone="muted">{labels.results}</Text>

                    {props.found.loading ? <SectionSkeleton /> : props.found.items.length ? (

                        <Stack as="ul" gap={1}>

                            {props.found.items.map(( item ) => (

                                <InboxRow
                                    key={item.key} title={item.title} body={item.text} time={item.time} href={item.href}
                                    icon={<Icon name="chat" />}
                                />

                            ))}

                        </Stack>

                    ) : <Text size="small" tone="muted">{labels.noResults}</Text>}

                </Stack>

            ) : null}

            {props.failed ? <FormRetry id="chat-rooms-failure" message={labels.unavailable} label={labels.retry} onRetry={props.onReload} />
                : props.loading ? <SectionSkeleton />
                : !props.rooms.length ? <StateNotice compact art={props.art} title={labels.emptyTitle} description={labels.emptyBody} />
                : (

                    <Stack as="ul" gap={1}>

                        {props.rooms.map(( room ) => (

                            <InboxRow
                                key={room.key} title={room.title} body={room.preview} time={room.time} href={room.href}
                                unread={room.unread > 0} framed={false}
                                icon={<Portrait size="small" src={room.image} alt="" initials={room.initials} />}
                                marker={(

                                    <>

                                        {room.flags.pinned ? <Icon name="push-pin" size="sm" tone="muted" label={labels.pinned} /> : null}

                                        {room.flags.muted ? <Icon name="bell-slash" size="sm" tone="muted" label={labels.muted} /> : null}

                                        {room.unread ? <Counter value={room.unread} /> : null}

                                    </>

                                )}
                            />

                        ))}

                    </Stack>

                )}

        </Stack>

    );

}
