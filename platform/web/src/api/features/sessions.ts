import { z } from "../../lib/providers/schema.ts";
import { del, feature, get, many, post } from "../core/dsl.ts";
import { ack, flag, id, list, text } from "../core/fields.ts";

const session = z.object({
    id: z.number(),
    name: text,
    agent: text,
    ip: text,
    is_me: flag,
    abilities: z.array(z.string()).nullish(),
    created_at: text,
    last_used_at: text,
    expires_at: text,
});

export default feature({ execution: "client", permissions: ["user"] }, {
    list: get("/tokens", list, many(session), { response: { data: "data.items" } }),
    revoke: del("/tokens/{sessionId}", { sessionId: id }, ack),
    revokeOthers: del("/tokens/others", {}, ack),
    view: get("/tokens/{sessionId}", { sessionId: id }, session),
    refresh: post("/tokens/refresh", {}, z.object({ token: z.string().min(1).max(4096) })),
    revokeCurrent: del("/tokens/current", {}, ack),
    revokeMany: del("/tokens", { ids: z.array(id).min(1).max(100) }, ack),
});
