import { z } from "../../lib/providers/schema.ts";
import { feature, get, many, put, trash } from "../core/dsl.ts";
import { flag, id, list, text } from "../core/fields.ts";

const log = z.object({
    id: z.number(),
    event: text,
    origin: text,
    action: text,
    method: text,
    idempotency_key: text,
    ip: text,
    agent: text,
    entity: text,
    element_id: z.number().nullish(),
    changes: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]).nullish(),
    name: text,
    created_at: text,
});

const complaint = z.object({
    id: z.number(),
    reason: text,
    title: text,
    content: text,
    name: text,
    ip: text,
    agent: text,
    status: text,
    deleted: flag,
    created_at: text,
});
const reportId = { reportId: id };

export const reports = feature({ execution: "client", permissions: ["user"] }, {
    list: get("/reports", list, many(complaint)),
    view: get("/reports/{reportId}", reportId, complaint),
    update: put("/reports/{reportId}", {
        ...reportId,
        reason: z.string().max(200).optional(),
        title: z.string().max(200).optional(),
        content: z.string().min(1).max(5000).optional(),
    }, complaint),
    ...trash("/reports", reportId),
});

export default feature({ execution: "client" }, {
    list: get("/logs", list, many(log)),
    view: get("/logs/{logId}", { logId: id }, log),
});
