import { media, picture } from "@/api/client";
import { oneOf } from "@/api/contracts";
import type { ChatFileRow, ChatSendBody, LineRow, RoomMark, RoomRow } from "@/api/endpoints/chat";
import type { UploadFile } from "@/std/file";
import type { Picture } from "@/std/picture";

export type MessageKind = "text" | "image" | "audio" | "video" | "file" | "catalog" | "location" | "system";

export type ChatAttachment = {
    id: number;
    name: string;
    kind: "image" | "audio" | "video" | "file";
    mime: string;
    size: string;
    url: string;
    poster: Picture | null;
};

export type ChatUpload = {
    uri: string;
    name: string;
    mime: string;
    size?: number | undefined;
};

export type MessagePreview = {
    id: number;
    kind: MessageKind;
    body: string;
    sender: string;
    mine: boolean;
};

type ChatReaction = {
    emoji: string;
    count: number;
    mine: boolean;
};

export type Message = {
    id: number;
    kind: MessageKind;
    body: string;
    mine: boolean;
    sender: string;
    senderImage: string | null;
    delivered: boolean;
    read: boolean;
    edited: boolean;
    forwarded: boolean;
    starred: boolean;
    pending: boolean;
    failed: boolean;
    at: string | null;
    reply: MessagePreview | null;
    order: number | null;
    attachments: readonly ChatAttachment[];
    reactions: readonly ChatReaction[];
};

export type Room = {
    id: number;
    kind: string;
    name: string;
    note: string;
    image: string | null;
    unread: number;
    lastAt: string | null;
    lastLine: string;
    lastKind: MessageKind;
    lastOrder: number | null;
    lastMine: boolean;
    lastRead: boolean;
    lastDelivered: boolean;
    pinned: boolean;
    muted: boolean;
    archived: boolean;
    blocked: boolean;
    online: boolean;
    lastSeenAt: string | null;
};

export type RoomFlag = RoomMark;

export type SendMessage = {
    body: string;
    kind?: MessageKind | undefined;
    replyId?: number | null | undefined;
    files?: readonly ChatUpload[] | undefined;
};

export const platform = ( room: Room ): boolean => room.kind === "platform" || room.kind === "support";

export const travelRoom = ( room: Room ): boolean => !platform(room);

export const roomTitle = ( room: Room, support: string ): string => platform(room) ? support : room.name;

export const messagePreview = ( message: Message ): MessagePreview => ({
    id: message.id,
    kind: message.kind,
    body: message.body,
    sender: message.sender,
    mine: message.mine,
});

export const attachmentKind = ( mime: string ): ChatAttachment["kind"] => {

    if ( mime.startsWith("image/") ) return "image";
    if ( mime.startsWith("audio/") ) return "audio";
    if ( mime.startsWith("video/") ) return "video";

    return "file";

};

export type ChatLink = {
    id: string;
    url: string;
    at: string | null;
};

const web = /https?:\/\/[^\s<>"')\]]+/gi;

export const viewable = ( item: ChatAttachment ): boolean => item.kind === "image" || item.kind === "video";

export const linkHost = ( url: string ): string => url.replace(/^[a-z]+:\/\//i, "").replace(/^www\./i, "").split(/[/?#]/, 1)[0] || url;

export const attachmentsOf = ( messages: readonly Message[] ): readonly ChatAttachment[] =>
    messages.flatMap(( message ) => message.attachments );

export const linksOf = ( messages: readonly Message[] ): readonly ChatLink[] => {

    const found: ChatLink[] = [];

    for ( const message of messages ) {

        for ( const url of message.body.match(web) ?? [] ) {

            found.push({ id: `${ message.id }-${ url }`, url, at: message.at });

        }

    }

    return found;

};

export const starredOf = ( messages: readonly Message[] ): readonly Message[] =>
    messages.filter(( message ) => message.starred );

export const kindGlyph = ( kind: ChatAttachment["kind"] ): "image" | "video" | "microphone" | "file" => {

    if ( kind === "image" ) return "image";
    if ( kind === "video" ) return "video";
    if ( kind === "audio" ) return "microphone";

    return "file";

};

const messageKinds: readonly MessageKind[] = [ "text", "image", "audio", "video", "file", "catalog", "location", "system" ];

const messageKind = ( value: string | null | undefined ): MessageKind => messageKinds.find(( kind ) => kind === value ) ?? "text";

const fileUrl = ( entry: ChatFileRow ): string => {

    if ( entry.url?.startsWith("http") ) return entry.url;

    return media(entry.path ?? entry.url) ?? "";

};

const posterOf = ( entry: ChatFileRow ): Picture | null => {

    const ladder = oneOf(entry.variants);
    const largest = Object.entries(ladder ?? {}).sort(( first, second ) => Number(second[0]) - Number(first[0]) )[0]?.[1];

    return picture(largest, ladder ?? undefined);

};

const fileOf = ( entry: ChatFileRow ): ChatAttachment => {

    const raw = entry.type ?? "file";
    const kind = raw === "image" || raw === "audio" || raw === "video" ? raw : attachmentKind(raw);

    return {
        id: entry.id,
        name: entry.name ?? "",
        kind,
        mime: raw.includes("/") ? raw : `${ kind }/*`,
        size: entry.size ?? "",
        url: fileUrl(entry),
        poster: posterOf(entry),
    };

};

const reactionsOf = ( entry: LineRow ): readonly ChatReaction[] => {

    const mine = oneOf(entry.settings)?.reaction;
    const all = [ ...( entry.actions ?? [] ).map(( item ) => item.reaction ), mine ].filter(( item ): item is string => Boolean(item) );
    const tally = new Map<string, number>();

    for ( const emoji of all ) tally.set(emoji, ( tally.get(emoji) ?? 0 ) + 1);

    return Array.from(tally, ([ emoji, count ]) => ({ emoji, count, mine: emoji === mine }));

};

const repliedOf = ( entry: LineRow, me: number ): MessagePreview | null => {

    const quoted = oneOf(entry.replied);

    if ( !quoted ) return null;

    return {
        id: quoted.id,
        kind: messageKind(quoted.type),
        body: quoted.content ?? "",
        sender: quoted.sender?.name ?? "",
        mine: quoted.sender?.id === me,
    };

};

const referencedOrder = ( entry: LineRow | null | undefined ): number | null =>
    entry?.reference_type === "order" ? oneOf(entry.reference)?.id ?? null : null;

export const messageOf = ( entry: LineRow, me: number ): Message => ({
    id: entry.id,
    kind: messageKind(entry.type),
    body: entry.content ?? "",
    mine: entry.sender?.id === me,
    sender: entry.sender?.name ?? "",
    senderImage: media(entry.sender?.image),
    delivered: Boolean(entry.is_delivered),
    read: Boolean(entry.is_read),
    edited: Boolean(entry.edited),
    forwarded: Boolean(entry.is_forwarded),
    starred: Boolean(oneOf(entry.settings)?.starred),
    pending: false,
    failed: false,
    at: entry.created_at ?? null,
    reply: repliedOf(entry, me),
    order: referencedOrder(entry),
    attachments: ( entry.attachments ?? [] ).map(fileOf),
    reactions: reactionsOf(entry),
});

export const threadOf = ( rows: readonly LineRow[], me: number ): readonly Message[] =>
    rows.map(( entry ) => messageOf(entry, me) ).sort(( first, second ) => ( first.at ?? "" ).localeCompare(second.at ?? "") );

export const mergeThread = ( older: readonly Message[], live: readonly Message[] ): readonly Message[] => {

    const held = new Set(live.map(( message ) => message.id ));

    return [ ...older.filter(( message ) => !held.has(message.id) ), ...live ]
        .sort(( first, second ) => ( first.at ?? "" ).localeCompare(second.at ?? "") );

};

export const roomOf = ( entry: RoomRow, me = 0 ): Room => {

    const other = ( entry.members ?? [] )[0];
    const person = other?.user;
    const last = oneOf(entry.last_message);
    const marks = oneOf(entry.settings);

    return {
        id: entry.id,
        kind: entry.type ?? "private",
        name: entry.name ?? person?.name ?? "",
        note: entry.description ?? "",
        image: media(entry.image ?? person?.image),
        unread: entry.unread_count ?? 0,
        lastAt: entry.last_used_at ?? last?.created_at ?? null,
        lastLine: last?.content ?? "",
        lastKind: messageKind(last?.type),
        lastOrder: referencedOrder(last),
        lastMine: Boolean(last && last.sender?.id === me),
        lastRead: Boolean(last?.is_read),
        lastDelivered: Boolean(last?.is_delivered),
        pinned: Boolean(marks?.pinned),
        muted: Boolean(marks?.muted),
        archived: Boolean(marks?.archived),
        blocked: Boolean(marks?.blocked),
        online: Boolean(other?.presence?.online),
        lastSeenAt: other?.presence?.last_seen_at ?? null,
    };

};

export const sendKind = ( input: SendMessage ): MessageKind => input.kind ?? attachmentKind(input.files?.[0]?.mime ?? "");

export const outgoing = ( input: SendMessage ): { body: ChatSendBody; files: readonly UploadFile[] } => ({
    body: { content: input.body, type: sendKind(input), replied_id: input.replyId },
    files: ( input.files ?? [] ).map(( item ) => ({ uri: item.uri, name: item.name, type: item.mime }) ),
});
