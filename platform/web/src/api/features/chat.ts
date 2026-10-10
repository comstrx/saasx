import { z } from "../../lib/providers/schema.ts";
import { del, feature, get, many, post } from "../core/dsl.ts";
import { ack, count, flag, id, maybeObject, person, ref, text, uploadFile } from "../core/fields.ts";

const kind = z.enum(["text", "image", "audio", "video", "file"]).default("text");
const page = { page: id.optional(), limit: id.max(100).optional(), search: z.string().max(200).optional() };
const attachment = z.object({
    id,
    name: text,
    type: text,
    kind: text,
    size: text,
    url: text,
    path: text,
});
const preview = z.object({ id, type: text, content: text, sender: maybeObject(person) });
const presence = z.object({ online: flag, last_seen_at: text });
const client = { execution: "client" } as const;

const action = z.object({
    reaction: text,
    starred: flag,
    pinned: flag,
    user: maybeObject(person),
});

const message = z.object({
    ...preview.shape,
    created_at: text,
    edited: flag,
    edited_at: text,
    is_forwarded: flag,
    is_delivered: flag,
    is_read: flag,
    replied: maybeObject(preview),
    attachments: z.array(attachment).nullish(),
    settings: maybeObject(action),
    actions: z.array(action).nullish(),
    reference_type: text,
    reference: maybeObject(z.object({ id })),
    room: maybeObject(z.object({ id })),
});

const room = z.object({
    id,
    type: text,
    name: text,
    description: text,
    image: text,
    unread_count: count,
    undelivered_count: count,
    last_used_at: text,
    last_message: maybeObject(message),
    members: z.array(z.object({ user: maybeObject(person), presence: maybeObject(presence) })).nullish(),
    settings: maybeObject(z.object({
        muted: flag,
        pinned: flag,
        archived: flag,
        blocked: flag,
    })),
});

function stream<const K extends z.ZodRawShape> ( base: string, key: K ) {

    const single = `${base}/{messageId}`;
    const one = { ...key, messageId: id };

    return feature({ ...client, permissions: ["user"], touches: ["chat"] }, {
        list: get(base, { ...key, ...page }, many(message)),
        view: get(single, one, message),
        send: post(`${base}/send`, {
            ...key,
            content: z.string().max(5000).default(""),
            type: kind,
            replied_id: id.optional(),
            files: z.array(uploadFile).max(8).optional(),
        }, message, { encoding: "multipart" }),
        edit: post(`${single}/edit`, { ...one, content: z.string().min(1).max(5000), type: kind }, message),
        forward: post(`${single}/forward`, { ...one, targetRoomId: id }, message, { request: { fields: { targetRoomId: "room" } } }),
        read: post(`${base}/read`, key, ack),
        delivered: post(`${base}/delivered`, key, ack),
        react: post(`${single}/reaction`, { ...one, reaction: z.string().min(1).max(32) }, ack),
        unreact: post(`${single}/unreaction`, one, ack),
        star: post(`${single}/star`, one, ack),
        unstar: post(`${single}/unstar`, one, ack),
        pin: post(`${single}/pin`, one, ack),
        unpin: post(`${single}/unpin`, one, ack),
        delete: del(single, one, ack),
        restore: post(`${single}/restore`, one, ack),
        destroy: del(`${single}/destroy`, one, ack),
    });

}

const roomId = { roomId: id };
const rooms = "/chat/rooms/{roomId}";

export const messages = stream(`${rooms}/messages`, roomId);
export const supportMessages = stream("/chat/support/messages", {});
export const announcementMessages = stream("/chat/announcements/{roomId}/messages", roomId);

export const announcements = feature(client, {
    list: get("/chat/announcements", page, many(room)),
    view: get("/chat/announcements/{roomId}", roomId, room),
    create: post("/chat/announcements", {
        name: z.string().min(1).max(200),
        audience: z.union([z.string().max(200), z.array(z.string().max(60)).max(20)]).optional(),
    }, room),
    read: post("/chat/announcements/{roomId}/read", roomId, ack),
});

export const observe = feature(client, {
    rooms: get("/chat/observe/rooms", page, many(room)),
    messages: get("/chat/observe/rooms/{roomId}/messages", { ...roomId, ...page }, many(message)),
    deleteMessage: del("/chat/observe/rooms/{roomId}/messages/{messageId}", { ...roomId, messageId: id }, ack),
    delete: del("/chat/observe/rooms/{roomId}", roomId, ack),
    archive: post("/chat/observe/rooms/{roomId}/archive", roomId, ack),
    unarchive: post("/chat/observe/rooms/{roomId}/unarchive", roomId, ack),
});

export default feature({ ...client, permissions: ["user"], touches: ["messages", "notifications"] }, {
    rooms: get("/chat/rooms", page, many(room)),
    room: get(rooms, roomId, room),
    support: get("/chat/support", {}, room),
    inbox: get("/chat/support/inbox", page, many(room)),
    team: get("/chat/team", {}, room),
    platform: get("/chat/platform", {}, room),
    contacts: get("/chat/contacts", page, many(person.extend({ role: text }))),
    search: get("/chat/search", page, many(message)),
    open: post("/chat/rooms/new/{userId}", { userId: id }, room),
    context: post("/chat/rooms/context/{userId}", { userId: id }, room),
    forProduct: post("/catalogs/{productId}/chat", { productId: ref }, room),
    forOrder: post("/orders/{orderId}/chat", { orderId: id }, room),
    typing: post(`${rooms}/typing`, roomId, ack),
    pin: post(`${rooms}/pin`, roomId, ack),
    unpin: post(`${rooms}/unpin`, roomId, ack),
    mute: post(`${rooms}/mute`, roomId, ack),
    unmute: post(`${rooms}/unmute`, roomId, ack),
    archive: post(`${rooms}/archive`, roomId, ack),
    unarchive: post(`${rooms}/unarchive`, roomId, ack),
    block: post(`${rooms}/block`, roomId, ack),
    unblock: post(`${rooms}/unblock`, roomId, ack),
    delete: del(rooms, roomId, ack),
    destroy: del(`${rooms}/destroy`, roomId, ack),
    report: post(`${rooms}/report`, { ...roomId, reason: z.string().min(2).max(200), content: z.string().min(2).max(5000) }, ack),
    presence: post("/chat/presence/ping", {}, presence),
    visibility: post("/chat/presence/visibility", { hidden: z.boolean() }, presence),
});
