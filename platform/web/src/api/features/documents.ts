import { z } from "../../lib/providers/schema.ts";
import { get, many } from "../core/dsl.ts";
import { id, text } from "../core/fields.ts";

export const attachment = z.object({ id: id.optional(), name: text, type: text, url: text, path: text, bytes: z.number().nullish() });

const entry = z.object({
    id,
    type: text,
    location: text,
    key: text,
    page: text,
    title: text,
    content: text,
    description: text,
    url: text,
    value: z.unknown().optional(),
    attachments: z.array(attachment).nullish(),
    updated_at: text,
});

export default {
    read: get("/content/{documentKey}", {
        documentKey: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/),
        limit: id.max(100).optional(),
    }, many(entry)),
};
