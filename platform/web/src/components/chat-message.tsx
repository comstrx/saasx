"use client";

import Bubble from "@/elements/bubble";
import Link from "@/elements/link";
import Portrait from "@/elements/portrait";
import Icon, { type IconName, isIconName } from "@/icons/icon";
import ChatMessageTools from "./chat-message-tools";

type Note = { key: string; label: string; icon?: string; tone?: "accent" | "ember" | "muted"; quiet?: boolean; fill?: boolean };
export type ChatEntry = {
    id: number; key: string; mine: boolean; author: string; image: string | null; initials: string; text: string;
    files: readonly { key: string; name: string; url: string }[]; time: string | null; quote: { author: string; text: string } | null;
    reactions: readonly { emoji: string; count: number; mine: boolean }[]; reaction: string | null; starred: boolean; pinned: boolean;
    editable: boolean; notes: readonly Note[];
};
type Handle = ( message: ChatEntry ) => void;
export type ChatEntryActions = {
    onReact: ( message: ChatEntry, emoji: string ) => void; onCopy: Handle; onStar: Handle; onPin: Handle;
    onReply?: Handle; onEdit?: Handle; onForward?: Handle; onDelete?: Handle; onInfo?: Handle;
};
type Props = {
    message: ChatEntry; emojis: readonly string[]; actions: ChatEntryActions | null;
    labels: { tools: Parameters<typeof ChatMessageTools>[0]["labels"]; reactionCount: ( emoji: string, count: number ) => string };
};

function bind ( handle: Handle | undefined, message: ChatEntry ) {

    return handle ? () => handle(message) : undefined;

}
function glyph ( name: string ): IconName {

    return isIconName(name) ? name : "info";

}
export default function ChatMessage ({ message, emojis, actions, labels }: Props) {

    return (

        <Bubble
            side={message.mine ? "mine" : "theirs"}
            author={message.author}
            time={message.time}
            quote={message.quote}
            reactions={message.reactions}
            reactionLabel={( reaction ) => labels.reactionCount(reaction.emoji, reaction.count)}
            onReact={actions ? ( emoji ) => actions.onReact(message, emoji) : undefined}
            avatar={message.mine ? undefined : <Portrait size="xsmall" src={message.image} alt="" initials={message.initials} />}
            notes={message.notes.map(( note ) => ({
                key: note.key, label: note.label, quiet: note.quiet,
                icon: note.icon ? <Icon name={glyph(note.icon)} tone={note.tone} weight={note.fill ? "fill" : "regular"} /> : undefined,
            }))}
            menu={actions ? (

                <ChatMessageTools
                    emojis={emojis}
                    reaction={message.reaction}
                    starred={message.starred}
                    pinned={message.pinned}
                    mine={message.mine}
                    editable={message.editable}
                    labels={labels.tools}
                    onReact={( emoji ) => actions.onReact(message, emoji)}
                    onCopy={() => actions.onCopy(message)}
                    onStar={() => actions.onStar(message)}
                    onPin={() => actions.onPin(message)}
                    onReply={bind(actions.onReply, message)}
                    onEdit={bind(actions.onEdit, message)}
                    onForward={bind(actions.onForward, message)}
                    onDelete={bind(actions.onDelete, message)}
                    onInfo={bind(actions.onInfo, message)}
                />

            ) : null}
        >

            {message.text}

            {message.files.map(( file ) => (

                <Link key={file.key} href={file.url} variant="inline" target="_blank" rel="noopener noreferrer">

                    <Icon name="paperclip" size="sm" />{file.name}

                </Link>

            ))}

        </Bubble>

    );

}
