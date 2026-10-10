import { z } from "../../lib/providers/schema.ts";
import { safeKey } from "../../lib/std/object.ts";
import { feature, get, many, post } from "../core/dsl.ts";
import { confirmCode, count, currency, decimal, dict, flag, httpUrl, id, money, positiveAmount, text } from "../core/fields.ts";
import { intent } from "./orders.ts";

const term = z.object({
    currency: text,
    purpose: text,
    min_amount: money,
    max_amount: money,
    customer_fixed_fee: money,
    customer_fee_rate: decimal,
    active: flag,
});
const slot = z.object({
    name: z.string(),
    label: text,
    placeholder: text,
    type: text,
    required: flag,
});
export const gateway = z.object({
    id: z.number(),
    name: text,
    label: text,
    type: text,
    image: text,
    description: text,
    linked: flag,
    sandbox: flag,
    capabilities: dict(z.boolean()),
    fields: dict(z.array(slot)),
    currencies: z.array(term).nullish(),
    currency: text,
    language: text,
    refund_days: count,
    credentials: dict(z.union([z.string(), z.number(), z.boolean()]).nullable()),
});
const action = {
    gatewayId: id,
    amount: positiveAmount,
    currency,
    payment_currency: currency.optional(),
    recipient: z.record(z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_-]*$/).refine(safeKey), z.string().max(2000)).optional(),
    confirm_code: confirmCode.optional(),
    redirect_url: httpUrl.optional(),
    failed_url: httpUrl.optional(),
};

export default feature({ execution: "client" }, {
    list: get("/gateways", {}, many(gateway)),
    view: get("/gateways/{gatewayId}", { gatewayId: id }, gateway),
    deposit: post("/gateways/{gatewayId}/deposit", action, intent),
    withdraw: post("/gateways/{gatewayId}/withdraw", action, intent),
});
