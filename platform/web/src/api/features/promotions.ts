import { z } from "../../lib/providers/schema.ts";
import { del, feature, get, many, post, put } from "../core/dsl.ts";
import { ack, flag, id, list, person, text } from "../core/fields.ts";

const promotion = z.object({
    id: z.number(),
    code: text,
    name: text,
    path: text,
    expires_at: text,
    is_live: flag,
    created_at: text,
    user: person.nullish(),
    related: z.object({ id: z.number(), name: text, title: text }).loose().nullish(),
});
const fields = {
    name: z.string().max(64).optional(),
    related_type: z.string().max(60).optional(),
    related_id: id.optional(),
    expires_at: z.iso.datetime({ offset: true }).optional(),
};
const promotionId = { promotionId: id };

export default feature({ execution: "client" }, {
    list: get("/promotions", list, many(promotion)),
    view: get("/promotions/{promotionId}", promotionId, promotion),
    create: post("/promotions", fields, promotion),
    update: put("/promotions/{promotionId}", { ...promotionId, ...fields }, promotion),
    delete: del("/promotions/{promotionId}", promotionId, ack),
});
