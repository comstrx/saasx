import { z } from "../../lib/providers/schema.ts";
import { engage, feature, get, many, post, trash } from "../core/dsl.ts";
import { confirmCode, count, decimal, flag, id, list, maybeObject, money, person, text } from "../core/fields.ts";
import { intent } from "./orders.ts";

const transaction = z.object({
    id: z.number(),
    reference: text,
    type: text,
    status: text,
    payment: text,
    amount: money,
    currency: text,
    description: text,
    created_at: text,
    can_cancel: flag,
    can_refund: flag,
    charged: money,
    settled: money,
    refunded_amount: money,
    free_before: text,
    penalty: money,
    penalty_rate: decimal,
    paid_amount: money,
    paid_currency: text,
    released_amount: money,
    tax_amount: money,
    exchange_amount: money,
    exchange_rate: decimal,
    refund_days: count,
    allow_refund: flag,
    recipient: z.record(z.string(), z.unknown()).nullish(),
    resume: z.object({ action: text, intent: intent.nullish() }).nullish(),
    related_type: text,
    related_id: z.number().nullish(),
    related: maybeObject(z.object({ id: z.number(), name: text }).loose()),
    user: maybeObject(person),
    deleted: flag,
    dispatched_at: text,
    updated_at: text,
});
const transactionId = { transactionId: id };

export default feature({ execution: "client", permissions: ["user"] }, {
    list: get("/transactions", list, many(transaction)),
    view: get("/transactions/{transactionId}", transactionId, transaction),
    cancel: post("/transactions/{transactionId}/cancel", transactionId, transaction),
    refund: post("/transactions/{transactionId}/refund", { ...transactionId, confirm_code: confirmCode.optional() }, intent),
    ...engage("/transactions/{transactionId}", transactionId, ["report"]),
    ...trash("/transactions", transactionId),
});
