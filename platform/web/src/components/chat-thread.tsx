"use client";

import type { ComponentProps } from "react";
import Heading from "@/elements/heading";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import { initials } from "@/lib/std/text";
import BackLink from "./back-link";
import ChatComposer from "./chat-composer";
import ChatMessage, { type ChatEntry, type ChatEntryActions } from "./chat-message";
import ChatRoomTools from "./chat-room-tools";
import FormRetry from "./form-retry";
import SectionSkeleton from "./section-skeleton";
import StateNotice from "./state-notice";

type Flags = { muted: boolean; pinned: boolean; archived: boolean; blocked: boolean };
type Props = {
    title: string; image: string | null; online: boolean; messages: readonly ChatEntry[]; loading: boolean; failed: boolean; back: string;
    emojis: readonly string[]; flags: Flags; busy: boolean; onReload: () => void;
    labels: {
        back: string; online: string; retry: string; unavailable: string; emptyTitle: string; emptyBody: string; blocked: string;
        muted: string;
        message: ComponentProps<typeof ChatMessage>["labels"]; room: ComponentProps<typeof ChatRoomTools>["labels"];
    };
    composer: ComponentProps<typeof ChatComposer> | null;
    room: { onToggle: ( key: keyof Flags ) => void; onReport: () => void; onDelete: () => void } | null;
    actions: ChatEntryActions | null;
};

export default function ChatThread ( props: Props ) {

    const { labels } = props;

    return (

        <Stack gap={4}>

            <Stack visibility="mobile"><BackLink href={props.back} label={labels.back} /></Stack>

            <Stack direction="row" align="center" justify="between" gap={3}>

                <Stack direction="row" align="center" gap={3}>

                    <Portrait size="medium" src={props.image} alt="" initials={initials(props.title)} online={props.online} />

                    <Stack gap={1}>

                        <Heading level={2} size="title">{props.title}</Heading>

                        <Stack direction="row" gap={2} wrap>

                            {props.online ? <Status tone="positive">{labels.online}</Status> : null}

                            {props.flags.muted ? <Status icon={<Icon name="bell-slash" size="sm" />}>{labels.muted}</Status> : null}

                            {props.flags.blocked ? (

                                <Status tone="negative" icon={<Icon name="ban" size="sm" />}>{labels.blocked}</Status>

                            ) : null}

                        </Stack>

                    </Stack>

                </Stack>

                {props.room ? (

                    <ChatRoomTools
                        flags={props.flags} disabled={props.busy} labels={labels.room}
                        onToggle={props.room.onToggle} onReport={props.room.onReport} onDelete={props.room.onDelete}
                    />

                ) : null}

            </Stack>

            <Surface tone="track" elevation="none" padding={5} radius="lg">

                {props.failed ? (

                    <FormRetry id="chat-thread-failure" message={labels.unavailable} label={labels.retry} onRetry={props.onReload} />

                ) : props.loading ? <SectionSkeleton />
                    : !props.messages.length ? <StateNotice compact title={labels.emptyTitle} description={labels.emptyBody} />
                    : (

                        <Stack as="ul" gap={4}>

                            {props.messages.map(( message ) => (

                                <ChatMessage
                                    key={message.key} message={message} emojis={props.emojis} actions={props.actions}
                                    labels={labels.message}
                                />

                            ))}

                        </Stack>

                    )}

            </Surface>

            {props.flags.blocked ? <Text size="small" tone="muted" align="center">{labels.blocked}</Text>
                : props.composer ? <ChatComposer {...props.composer} /> : null}

        </Stack>

    );

}
