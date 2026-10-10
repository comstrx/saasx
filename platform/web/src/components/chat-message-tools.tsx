"use client";

import type { ReactNode } from "react";
import Button from "@/elements/button";
import Menu from "@/elements/menu";
import Popover from "@/elements/popover";
import Stack from "@/elements/stack";
import Icon from "@/icons/icon";

type Labels = {
    react: string; reactWith: ( emoji: string ) => string; actions: string; reply: string; copy: string; edit: string;
    forward: string; star: string; unstar: string; pin: string; unpin: string; delete: string; info: string;
};
type Handler = (() => void) | undefined;
type Props = {
    emojis: readonly string[]; reaction: string | null; starred: boolean; pinned: boolean; mine: boolean; editable: boolean;
    labels: Labels;
    onReact: ( emoji: string ) => void; onCopy: () => void; onStar: () => void; onPin: () => void;
    onReply?: Handler; onEdit?: Handler; onForward?: Handler; onDelete?: Handler; onInfo?: Handler;
};

function entry ( key: string, label: string, icon: ReactNode, onSelect: Handler ) {

    return onSelect ? [{ key, label, icon, onSelect }] : [];

}
export default function ChatMessageTools ( props: Props ) {

    const { labels } = props;
    const talk = [
        ...entry("reply", labels.reply, <Icon name="reply" />, props.onReply),
        ...entry("copy", labels.copy, <Icon name="copy" />, props.onCopy),
        ...entry("forward", labels.forward, <Icon name="forward" />, props.onForward),
        ...entry("edit", labels.edit, <Icon name="edit" />, props.editable ? props.onEdit : undefined),
        ...entry("info", labels.info, <Icon name="info" />, props.onInfo),
    ];
    const keep = [
        {
            key: "star", label: props.starred ? labels.unstar : labels.star,
            icon: <Icon name="star" weight={props.starred ? "fill" : "regular"} />, onSelect: props.onStar,
        },
        { key: "pin", label: props.pinned ? labels.unpin : labels.pin, icon: <Icon name="push-pin" />, onSelect: props.onPin },
    ];
    const danger = props.onDelete ? [
        { key: "delete", label: labels.delete, icon: <Icon name="trash" />, tone: "danger" as const, onSelect: props.onDelete },
    ] : [];

    return (

        <Stack direction="row" align="center" gap={0}>

            <Popover label={labels.react} look="ghost" width="auto" padding="tight" side="top" trigger={<Icon name="smiley" />}>

                <Stack direction="row" gap={1}>

                    {props.emojis.map(( emoji ) => (

                        <Button
                            key={emoji}
                            variant={props.reaction === emoji ? "subtle" : "ghost"}
                            size="small"
                            rounded="full"
                            icon
                            aria-label={labels.reactWith(emoji)}
                            aria-pressed={props.reaction === emoji}
                            onClick={() => props.onReact(emoji)}
                        >

                            {emoji}

                        </Button>

                    ))}

                </Stack>

            </Popover>

            <Menu
                label={labels.actions}
                look="ghost"
                align={props.mine ? "end" : "start"}
                trigger={<Icon name="dots" />}
                sections={[
                    { key: "talk", items: talk },
                    { key: "keep", items: keep },
                    ...(props.mine && danger.length ? [{ key: "danger", items: danger }] : []),
                ]}
            />

        </Stack>

    );

}
