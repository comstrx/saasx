import { z } from "../../lib/providers/schema.ts";
import { engage, feature, get, many } from "../core/dsl.ts";
import { count, decimal, id, list, money, picture, text } from "../core/fields.ts";
import { trait } from "./products.ts";

export const perk = z.object({
    key: z.string(),
    value_type: text,
    value: money,
    rate_ppm: decimal,
    cap: money,
});

const level = z.object({
    id: z.number(),
    rank: count,
    name: text,
    description: text,
    color: text,
    ...picture,
    perks: z.array(perk).nullish(),
    benefits: z.array(trait).nullish(),
    conditions: z.array(z.object({ key: z.string(), threshold: decimal, window_days: count })).nullish(),
});

const levelId = { levelId: id };

export default feature({ execution: "client", permissions: ["user"] }, {
    list: get("/levels", list, many(level)),
    view: get("/levels/{levelId}", levelId, level),
    benefits: get("/levels/{levelId}/benefits", { ...levelId, ...list }, many(trait)),
    ...engage("/levels/{levelId}", levelId, ["like", "dislike", "unreact", "reaction", "report"]),
});
