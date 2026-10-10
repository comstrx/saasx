import { z } from "../../lib/providers/schema.ts";
import { feature, get, many, post } from "../core/dsl.ts";
import { confirmCode, decimal, list, money, positiveAmount, text } from "../core/fields.ts";

const handle = z.string().min(3).max(200);
const wallet = z.object({
    currency: text,
    total_balance: money,
    available_balance: money,
    pending_balance: money,
    buy_balance: money,
    withdraw_balance: money,
    fee_balance: money,
    points: decimal,
    total_deposits: money,
    total_withdraws: money,
    total_transfers: money,
    total_pays: money,
    total_refunds: money,
    total_cashback: money,
    referral_earnings: money,
    earned_points: decimal,
});
const statement = z.object({
    id: z.number(),
    unit: text,
    reason: text,
    direction: text,
    balance: text,
    amount: money,
    reference: z.object({ type: text, id: z.number().nullish() }).nullish(),
    at: text,
});

export default feature({ execution: "client", permissions: ["user"], touches: ["transactions", "notifications"] }, {
    read: get("/wallet", {}, wallet, { response: { data: "data.wallet" } }),
    statement: get("/wallet/statement", list, many(statement)),
    recipient: get("/wallet/transfer/resolve", { recipient: handle }, z.object({ id: z.number(), name: text })),
    transfer: post("/wallet/transfer", { recipient: handle, amount: positiveAmount, confirm_code: confirmCode.optional() }, wallet, { response: { data: "data.wallet" } }),
});
