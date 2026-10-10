import { z } from "../../lib/providers/schema.ts";
import { del, feature, get, many, post } from "../core/dsl.ts";
import { ack, bulk, count, flag, id, maybeObject, picture, selection, text } from "../core/fields.ts";
import { attachment } from "./documents.ts";

const alert = z.object({
    id,
    kind: text,
    type: text,
    channel: text,
    title: text,
    content: text,
    ...picture,
    attachments: z.array(attachment).nullish(),
    related_type: text,
    related_id: z.number().nullish(),
    related: maybeObject(z.object({ id: z.number(), name: text, title: text, image: text }).loose()),
    deleted: flag,
    read: flag,
    pinned: flag,
    send_at: text,
    created_at: text,
    order: z.object({ id }).nullish(),
    transaction: z.object({ id }).nullish(),
    ticket: z.object({ id }).nullish(),
    catalog: z.object({ id }).nullish(),
});
const stats = z.object({
    count: count,
    unread: count,
    pinned: count,
});
const notificationId = { notificationId: id };

export default feature({ execution: "client", permissions: ["user"] }, {
    list: get("/notifications", {
        page: id.optional(),
        limit: id.max(100).optional(),
        kind: z.string().max(100).optional(),
        read: z.boolean().optional(),
        pinned: z.boolean().optional(),
    }, many(alert), { request: { fields: { kind: "filters[kind]", read: "filters[read]", pinned: "filters[pinned]" } } }),
    stats: get("/notifications/stats", {}, stats),
    read: post("/notifications/{notificationId}/read", notificationId, ack),
    unread: post("/notifications/{notificationId}/unread", notificationId, ack),
    pin: post("/notifications/{notificationId}/pin", notificationId, ack),
    unpin: post("/notifications/{notificationId}/unpin", notificationId, ack),
    delete: del("/notifications/{notificationId}", notificationId, ack),
    view: get("/notifications/{notificationId}", notificationId, alert),
    restore: post("/notifications/{notificationId}/restore", notificationId, ack),
    readMany: post("/notifications/read", selection, bulk),
    unreadMany: post("/notifications/unread", selection, bulk),
    pinMany: post("/notifications/pin", selection, bulk),
    unpinMany: post("/notifications/unpin", selection, bulk),
    restoreMany: post("/notifications/restore", selection, bulk),
    deleteMany: del("/notifications", selection, bulk),
});
