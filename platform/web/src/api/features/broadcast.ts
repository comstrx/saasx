import { z } from "../../lib/providers/schema.ts";
import { post } from "../core/dsl.ts";

const authorization = z.object({
    auth: z.string().min(1).max(1000),
    channel_data: z.string().max(50000).optional(),
    shared_secret: z.string().max(1000).optional(),
});

export default {
    authorize: post("/broadcasting/auth", {
        socket_id: z.string().regex(/^\d+\.\d+$/),
        channel_name: z.string().regex(/^(?:private-|presence-)[a-zA-Z0-9_.-]{1,180}$/),
    }, authorization, { execution: "client", connection: "broadcast", response: { data: "$", success: null } }),
};
