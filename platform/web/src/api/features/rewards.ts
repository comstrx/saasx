import { z } from "../../lib/providers/schema.ts";
import { feature, get, many } from "../core/dsl.ts";
import { count, decimal, id, list, money, text } from "../core/fields.ts";
import { coupon, history } from "./coupons.ts";

const reward = z.object({
    id: z.number(),
    key: text,
    type: text,
    image: text,
    value_type: text,
    balance_target: text,
    cadence_limit: count,
    cadence_days: count,
    targets: z.array(z.record(z.string(), z.unknown())).nullish(),
    value: money,
    rate: decimal,
    cap: money,
    points: decimal,
    cadence: text,
    starts_at: text,
    expires_at: text,
    coupon: coupon.partial().nullish(),
});
const event = z.object({
    id: z.number(),
    reward_id: z.number().nullish(),
    occurrence: text,
    status: text,
    at: text,
    clawed_at: text,
    snapshot: z.object({ type: text, amount: money, points: decimal, coupon: text }).nullish(),
    source: z.object({ type: text, id: z.number().nullish() }).nullish(),
});

export default feature({ execution: "client", permissions: ["user"], touches: ["wallet", "transactions"] }, {
    list: get("/rewards", list, many(reward)),
    view: get("/rewards/{rewardId}", { rewardId: id }, reward),
    history: get("/rewards/history", list, many(event), history),
});
