import { z } from "../../lib/providers/schema.ts";
import { del, feature, get, many, post } from "../core/dsl.ts";
import { ack, list, person, text } from "../core/fields.ts";
import { password } from "./auth.ts";

const credential = z.object({
    id: z.number(),
    key: text,
    secret: text,
    permissions: z.array(z.string()).nullish(),
    expires_at: text,
    last_used_at: text,
    created_at: text,
    user: person.nullish(),
});
const token = { token: z.string().min(1).max(200) };
const access = { expires_at: z.iso.datetime({ offset: true }).optional(), active: z.boolean().optional() };

export default feature({ execution: "client", permissions: ["user"] }, {
    list: get("/credentials", list, many(credential)),
    current: get("/credentials/current", {}, credential),
    view: get("/credentials/{token}", token, credential),
    create: post("/credentials", access, credential),
    reset: post("/credentials/reset", access, credential),
    reveal: post("/credentials/{token}/reveal", { ...token, password }, credential),
    delete: del("/credentials/{token}", token, ack),
});
