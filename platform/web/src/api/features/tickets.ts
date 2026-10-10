import { z } from "../../lib/providers/schema.ts";
import { del, engage, feature, get, many, post, put } from "../core/dsl.ts";
import { ack, body, bulk, flag, id, maybeObject, page, person, text } from "../core/fields.ts";
import { attachment } from "./documents.ts";
import { reply } from "./reviews.ts";

const ticket = z.object({
    id,
    title: text,
    content: text,
    status: text,
    state: text,
    classification: text,
    name: text,
    email: text,
    phone: text,
    attachments: z.array(attachment).nullish(),
    assignee_id: z.number().nullish(),
    assignee: maybeObject(person),
    deleted: flag,
    created_at: text,
    updated_at: text,
    resolved_at: text,
    closed_at: text,
    reopened_at: text,
    user: maybeObject(person),
    order: maybeObject(z.object({ id, reference: text, status: text })),
    replies: z.array(reply).nullish(),
});
const draft = { title: z.string().min(2).max(200), content: z.string().min(5).max(10000) };
const ticketId = { ticketId: id };

export default feature({ execution: "client", permissions: ["user"], touches: ["notifications"] }, {
    view: get("/tickets/{ticketId}", ticketId, ticket),
    create: post("/tickets", draft, ticket),
    update: put("/tickets/{ticketId}", { ...draft, ...ticketId }, ticket),
    delete: del("/tickets/{ticketId}", ticketId, ack),
    list: get("/tickets", {
        page: id.optional(),
        limit: id.max(100).optional(),
        status: z.enum(["pending", "resolved", "closed"]).optional(),
    }, many(ticket), { request: { fields: { status: "filters[status]" } } }),
    reply: post("/tickets/{ticketId}/reply", { ...ticketId, content: body }, reply),
    close: post("/tickets/{ticketId}/close", ticketId, ack),
    resolve: post("/tickets/{ticketId}/resolve", ticketId, ack),
    reopen: post("/tickets/{ticketId}/reopen", ticketId, ack),
    forOrder: post("/orders/{orderId}/ticket", { ...draft, orderId: id }, ticket),
    replies: get("/tickets/{ticketId}/replies", { ...ticketId, ...page }, many(reply)),
    ...engage("/tickets/{ticketId}", ticketId, ["report"]),
    restore: post("/tickets/{ticketId}/restore", ticketId, ack),
    removeMany: del("/tickets", { ids: z.array(id).min(1).max(100) }, bulk),
    restoreMany: post("/tickets/restore", { ids: z.array(id).min(1).max(100) }, bulk),
});
