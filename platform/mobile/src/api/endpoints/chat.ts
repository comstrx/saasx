import { z } from "zod";
import { ApiError, call, page, upload } from "@/api/client";
import { maybeObject, variants } from "@/api/contracts";
import type { UploadFile } from "@/std/file";

const user = z.object({
    id: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
});

const attachment = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    kind: z.string().nullable().optional(),
    size: z.string().nullable().optional(),
    path: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    variants,
});

const action = z.object({
    reaction: z.string().nullable().optional(),
    starred: z.boolean().nullable().optional(),
    user: user.nullable().optional(),
});

const preview = z.object({
    id: z.number(),
    type: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    sender: user.nullable().optional(),
});

const line = z.object({
    id: z.number(),
    type: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    edited: z.boolean().nullable().optional(),
    is_forwarded: z.boolean().nullable().optional(),
    is_delivered: z.boolean().nullable().optional(),
    is_read: z.boolean().nullable().optional(),
    created_at: z.string().nullable().optional(),
    sender: user.nullable().optional(),
    replied: maybeObject(preview),
    attachments: z.array(attachment).nullable().optional(),
    settings: maybeObject(action),
    actions: z.array(action).nullable().optional(),
    reference_type: z.string().nullable().optional(),
    reference: maybeObject(z.object({ id: z.number() })),
});

const lines = z.array(line);

const member = z.object({
    user: user.nullable().optional(),
    presence: z.object({
        online: z.boolean().nullable().optional(),
        last_seen_at: z.string().nullable().optional(),
    }).nullable().optional(),
});

const room = z.object({
    id: z.number(),
    type: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    unread_count: z.number().nullable().optional(),
    last_used_at: z.string().nullable().optional(),
    last_message: maybeObject(line),
    members: z.array(member).nullable().optional(),
    settings: maybeObject(z.object({
        muted: z.boolean().nullable().optional(),
        pinned: z.boolean().nullable().optional(),
        archived: z.boolean().nullable().optional(),
        blocked: z.boolean().nullable().optional(),
    })),
});

const rooms = z.array(room);

export type ChatFileRow = z.infer<typeof attachment>;

export type LineRow = z.infer<typeof line>;

export type RoomRow = z.infer<typeof room>;

export type RoomMark = "pinned" | "muted" | "archived" | "blocked";

export type ChatSubject = "catalogs" | "orders";

export type ChatSendBody = {
    content: string;
    type: string;
    replied_id?: number | null | undefined;
};

const marks: Record<RoomMark, readonly [ string, string ]> = {
    pinned: [ "pin", "unpin" ],
    muted: [ "mute", "unmute" ],
    archived: [ "archive", "unarchive" ],
    blocked: [ "block", "unblock" ],
};

export const chat = {

    rooms: (): Promise<readonly RoomRow[]> => call({ path: "chat/rooms?limit=100", schema: rooms }),

    flag: ( id: number, mark: RoomMark, on: boolean, attempt: string ) =>
        call({
            path: `chat/rooms/${ id }/${ marks[mark][on ? 0 : 1] }`,
            method: "POST",
            idempotencyKey: attempt,
        }),

    removeRoom: ( id: number, attempt: string ) =>
        call({ path: `chat/rooms/${ id }`, method: "DELETE", idempotencyKey: attempt }),

    reportRoom: ( id: number, reason: string, note: string, attempt: string ) =>
        call({
            path: `chat/rooms/${ id }/report`,
            method: "POST",
            body: { reason, title: reason, content: note || reason },
            idempotencyKey: attempt,
        }),

    room: ( id: number ): Promise<RoomRow> => call({ path: `chat/rooms/${ id }`, schema: room }),

    messages: ( id: number, at = 1, limit = 20 ) =>
        page({ path: `chat/rooms/${ id }/messages?limit=${ limit }`, schema: lines }, at),

    send: async ( id: number, body: ChatSendBody, files: readonly UploadFile[], attempt: string ): Promise<LineRow> => {

        const path = `chat/rooms/${ id }/messages/send`;

        const entry = files.length
            ? await upload({ path, fields: body, files, schema: line, idempotencyKey: attempt })
            : await call({ path, method: "POST", body, schema: line, idempotencyKey: attempt });

        if ( files.length && !entry.attachments?.length ) throw new ApiError(200, "server", "", null);

        return entry;

    },

    edit: ( id: number, message: number, content: string, attempt: string ): Promise<LineRow> =>
        call({
            path: `chat/rooms/${ id }/messages/${ message }/edit`,
            method: "POST",
            body: { content },
            schema: line,
            idempotencyKey: attempt,
        }),

    forward: ( id: number, message: number, target: number, attempt: string ): Promise<LineRow> =>
        call({
            path: `chat/rooms/${ id }/messages/${ message }/forward`,
            method: "POST",
            body: { room: target },
            schema: line,
            idempotencyKey: attempt,
        }),

    read: ( id: number, attempt: string ) =>
        call({ path: `chat/rooms/${ id }/messages/read`, method: "POST", idempotencyKey: attempt }),

    delivered: ( id: number, attempt: string ) =>
        call({ path: `chat/rooms/${ id }/messages/delivered`, method: "POST", idempotencyKey: attempt }),

    typing: ( id: number ) =>
        call({ path: `chat/rooms/${ id }/typing`, method: "POST" }),

    react: ( id: number, message: number, reaction: string, attempt: string ) =>
        call({
            path: `chat/rooms/${ id }/messages/${ message }/reaction`,
            method: "POST",
            body: { reaction },
            idempotencyKey: attempt,
        }),

    unreact: ( id: number, message: number, attempt: string ) =>
        call({
            path: `chat/rooms/${ id }/messages/${ message }/unreaction`,
            method: "POST",
            idempotencyKey: attempt,
        }),

    star: ( id: number, message: number, starred: boolean, attempt: string ) =>
        call({
            path: `chat/rooms/${ id }/messages/${ message }/${ starred ? "star" : "unstar" }`,
            method: "POST",
            idempotencyKey: attempt,
        }),

    remove: ( id: number, message: number, attempt: string ) =>
        call({
            path: `chat/rooms/${ id }/messages/${ message }`,
            method: "DELETE",
            idempotencyKey: attempt,
        }),

    open: async ( subject: ChatSubject, id: number, attempt: string ): Promise<number> => {

        const data = await call({ path: `${ subject }/${ id }/chat`, method: "POST", schema: room, idempotencyKey: attempt });

        return data.id;

    },

    support: async (): Promise<number> => ( await call({ path: "chat/support", schema: room }) ).id,

};
