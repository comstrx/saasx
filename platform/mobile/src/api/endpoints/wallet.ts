import { z } from "zod";
import { call, page } from "@/api/client";
import { decimal, dict, homing, type IntentRow, intent, money } from "@/api/contracts";

const purse = z.object({
    currency: z.string().nullable().optional(),
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

const pursePayload = z.object({ wallet: purse });

const entry = z.object({
    id: z.number(),
    reference: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    payment: z.string().nullable().optional(),
    amount: money,
    currency: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    can_cancel: z.boolean().nullable().optional(),
    free_before: z.string().nullable().optional(),
    penalty: money,
    penalty_rate: decimal,
});

const entries = z.array(entry);

const ledgerRow = z.object({
    id: z.number(),
    unit: z.string().nullable().optional(),
    reason: z.string().nullable().optional(),
    direction: z.string().nullable().optional(),
    balance: z.string().nullable().optional(),
    amount: money,
    reference: z.object({
        type: z.string().nullable().optional(),
        id: z.number().nullable().optional(),
    }).nullable().optional(),
    at: z.string().nullable().optional(),
});

const ledgerRows = z.array(ledgerRow);

const term = z.object({
    currency: z.string().nullable().optional(),
    purpose: z.string().nullable().optional(),
    min_amount: money,
    max_amount: money,
    customer_fixed_fee: money,
    customer_fee_rate: decimal,
    active: z.boolean().nullable().optional(),
});

const slot = z.object({
    name: z.string(),
    label: z.string().nullable().optional(),
    placeholder: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    required: z.boolean().nullable().optional(),
});

const rail = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    linked: z.boolean().nullable().optional(),
    sandbox: z.boolean().nullable().optional(),
    capabilities: dict(z.boolean()),
    fields: dict(z.array(slot)),
    currencies: z.array(term).nullable().optional(),
});

const rails = z.array(rail);

const resolved = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
});

export type PurseRow = z.infer<typeof purse>;

export type TransactionRow = z.infer<typeof entry>;

export type LedgerRow = z.infer<typeof ledgerRow>;

export type SlotRow = z.infer<typeof slot>;

export type RailRow = z.infer<typeof rail>;

export type RecipientRow = z.infer<typeof resolved>;

export const wallet = {

    balance: async (): Promise<PurseRow> => ( await call({ path: "wallet", schema: pursePayload }) ).wallet,

    rails: (): Promise<readonly RailRow[]> => call({ path: "gateways", schema: rails }),

    deposit: (
        gateway: number,
        amount: string,
        currency: string,
        details: Readonly<Record<string, string>>,
        attempt: string,
    ): Promise<IntentRow> =>
        call({
            path: `gateways/${ gateway }/deposit`,
            method: "POST",
            body: { amount, currency, recipient: details, ...homing },
            schema: intent,
            idempotencyKey: attempt,
        }),

    withdraw: (
        gateway: number,
        amount: string,
        currency: string,
        recipient: Readonly<Record<string, string>>,
        confirmCode: string | null,
        attempt: string,
    ): Promise<IntentRow> =>
        call({
            path: `gateways/${ gateway }/withdraw`,
            method: "POST",
            body: { amount, currency, recipient, ...( confirmCode ? { confirm_code: confirmCode } : {} ), ...homing },
            schema: intent,
            idempotencyKey: attempt,
        }),

    resolve: ( recipient: string ): Promise<RecipientRow> =>
        call({ path: `wallet/transfer/resolve?recipient=${ encodeURIComponent(recipient) }`, schema: resolved }),

    transfer: ( recipient: string, amount: string, attempt: string, confirmCode: string | null ) =>
        call({
            path: "wallet/transfer",
            method: "POST",
            body: confirmCode ? { recipient, amount, confirm_code: confirmCode } : { recipient, amount },
            idempotencyKey: attempt,
        }),

    cancel: ( transaction: number, attempt: string ) =>
        call({ path: `transactions/${ transaction }/cancel`, method: "POST", idempotencyKey: attempt }),

    refund: ( transaction: number, attempt: string, confirmCode: string | null = null ) =>
        call({
            path: `transactions/${ transaction }/refund`,
            method: "POST",
            body: confirmCode ? { confirm_code: confirmCode } : {},
            idempotencyKey: attempt,
        }),

    statement: ( at = 1, limit = 25 ) => page({ path: `wallet/statement?limit=${ limit }`, schema: ledgerRows }, at),

    transactions: ( at = 1, limit = 20 ) => page({ path: `transactions?limit=${ limit }`, schema: entries }, at),

};
