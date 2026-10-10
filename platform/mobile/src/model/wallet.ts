import { media } from "@/api/client";
import { bare, baseCurrency, cashOr, type MoneyShape, numeric } from "@/api/contracts";
import type { LedgerRow, PurseRow, RailRow, RecipientRow, SlotRow, TransactionRow } from "@/api/endpoints/wallet";
import { isolateLtr } from "@/std/bidi";
import { stampOf } from "@/std/number";

export type Balance = {
    currency: string;
    baseCurrency: string;
    availableBase: number;
    total: number;
    available: number;
    pending: number;
    spendable: number;
    withdrawable: number;
    withdrawableBase: number;
    fees: number;
    points: number;
    deposits: number;
    withdraws: number;
    transfers: number;
    pays: number;
    refunds: number;
    cashback: number;
    referrals: number;
    earnedPoints: number;
};

export type StatKey = "deposits" | "withdraws" | "transfers" | "pays" | "refunds" | "cashback" | "referrals" | "fees";

export const statOf = ( balance: Balance, key: StatKey ): number => balance[key];

export const livelyStats = ( balance: Balance | undefined, keys: readonly StatKey[] ): readonly StatKey[] =>
    balance ? keys.filter(( key ) => statOf(balance, key) > 0 ) : [];

export type Recipient = {
    id: number;
    name: string;
};

type TransactionKind = "deposit" | "withdraw" | "pay" | "refund" | "transfer";
export type TransactionState = "pending" | "successful" | "failed" | "refunded" | "cancelled";

export type Transaction = {
    id: number;
    reference: string;
    kind: TransactionKind;
    state: TransactionState;
    gateway: string;
    amount: number;
    currency: string;
    note: string;
    at: string | null;
    canCancel: boolean;
    penaltyRate: number;
    penaltyFixed: number;
    freeBefore: string | null;
};

export type LedgerEntry = {
    id: number;
    reason: string;
    inbound: boolean;
    points: boolean;
    pot: string;
    amount: number;
    currency: string;
    referenceType: string;
    referenceId: number;
    at: string | null;
};

const incoming: readonly TransactionKind[] = [ "deposit", "refund" ];

export const credits = ( kind: TransactionKind ): boolean => incoming.includes(kind);

type RailPurpose = "pay" | "deposit" | "withdraw" | "refund";

type RailTerms = {
    purpose: RailPurpose;
    currency: string;
    min: number;
    max: number;
    fixedFee: number;
    feeRate: number;
};

type RecipientField = {
    name: string;
    label: string;
    placeholder: string;
    type: string;
    required: boolean;
};

export type Rail = {
    id: number;
    key: string;
    name: string;
    kind: string;
    image: string | null;
    note: string;
    linked: boolean;
    abilities: readonly RailPurpose[];
    terms: readonly RailTerms[];
    fields: Readonly<Partial<Record<RailPurpose, readonly RecipientField[]>>>;
};

export const railsFor = ( rails: readonly Rail[], purpose: RailPurpose ): readonly Rail[] =>
    rails.filter(( rail ) => rail.abilities.includes(purpose) );

export const railGlyph = ( rail: Rail ): "wallet" | "card" => rail.kind === "wallet" ? "wallet" : "card";

export const railInitial = ( rail: Rail ): string => rail.name.trim().slice(0, 1).toUpperCase();

export const termsOf = ( rail: Rail | undefined, purpose: RailPurpose, currency: string ): RailTerms | undefined =>
    rail?.terms.find(( terms ) => terms.purpose === purpose && terms.currency === currency )
    ?? rail?.terms.find(( terms ) => terms.purpose === purpose );

export const fieldsOf = ( rail: Rail | undefined, purpose: RailPurpose ): readonly RecipientField[] =>
    rail?.fields[purpose] ?? [];

export const feeOf = ( terms: RailTerms | undefined, amount: number ): number =>
    terms ? terms.fixedFee + amount * ( terms.feeRate / 100 ) : 0;

export const withinRange = ( terms: RailTerms | undefined, amount: number ): boolean => {

    if ( !terms || amount <= 0 ) return false;
    if ( terms.min > 0 && amount < terms.min ) return false;
    if ( terms.max > 0 && amount > terms.max ) return false;

    return true;

};

const ladder = [ 1, 2, 5 ] as const;

export const presetsOf = ( ceiling: number, floor = 0, count = 4 ): readonly number[] => {

    if ( ceiling <= 0 ) return [];

    const start = Math.max(floor, ceiling / 200);
    const steps: number[] = [];

    for ( let power = Math.floor(Math.log10(Math.max(start, 1))); steps.length < count && power < 15; power++ ) {

        for ( const step of ladder ) {

            const value = step * 10 ** power;

            if ( value >= start && value <= ceiling && steps.length < count ) steps.push(value);

        }

    }

    return steps;

};

export const ceilingOf = ( rails: readonly Rail[], purpose: RailPurpose, currency: string ): number =>
    rails.reduce(( top, rail ) => Math.max(top, termsOf(rail, purpose, currency)?.max ?? 0 ), 0 );

export const recipientReady = ( fields: readonly RecipientField[], recipient: Readonly<Record<string, string>> ): boolean =>
    fields.every(( field ) => !field.required || Boolean(recipient[field.name]?.trim()) );

export const covers = ( balance: Balance | undefined, due: { amount: number; currency: string } | null ): boolean => {

    if ( !balance || !due ) return true;
    if ( due.currency === balance.currency ) return balance.spendable >= due.amount;
    if ( due.currency === balance.baseCurrency ) return balance.availableBase >= due.amount;

    return true;

};

export const balanceOf = ( data: PurseRow ): Balance => {

    const held = data.currency ?? baseCurrency;
    const shown = cashOr(data.available_balance, held);
    const owned = bare(data.available_balance, held);
    const worth = ( value: MoneyShape ) => cashOr(value, shown.currency).amount;

    return {
        currency: shown.currency,
        baseCurrency: owned.currency,
        availableBase: owned.amount,
        total: worth(data.total_balance),
        available: shown.amount,
        pending: worth(data.pending_balance),
        spendable: worth(data.buy_balance),
        withdrawable: worth(data.withdraw_balance),
        withdrawableBase: bare(data.withdraw_balance, held).amount,
        fees: worth(data.fee_balance),
        points: numeric(data.points),
        deposits: worth(data.total_deposits),
        withdraws: worth(data.total_withdraws),
        transfers: worth(data.total_transfers),
        pays: worth(data.total_pays),
        refunds: worth(data.total_refunds),
        cashback: worth(data.total_cashback),
        referrals: worth(data.referral_earnings),
        earnedPoints: numeric(data.earned_points),
    };

};

const kinds: readonly TransactionKind[] = [ "deposit", "withdraw", "pay", "refund", "transfer" ];

const states: readonly TransactionState[] = [ "pending", "successful", "failed", "refunded", "cancelled" ];

const kindOf = ( value: string | null | undefined ): TransactionKind => kinds.find(( kind ) => kind === value ) ?? "pay";

const stateOf = ( value: string | null | undefined ): TransactionState => states.find(( state ) => state === value ) ?? "pending";

export const transactionOf = ( row: TransactionRow ): Transaction => ({
    id: row.id,
    reference: row.reference ?? "",
    kind: kindOf(row.type),
    state: stateOf(row.status),
    gateway: row.payment ?? "",
    ...cashOr(row.amount, row.currency ?? baseCurrency),
    note: row.description ?? "",
    at: row.created_at ?? null,
    canCancel: Boolean(row.can_cancel),
    penaltyRate: Math.max(0, numeric(row.penalty_rate) || 0),
    penaltyFixed: cashOr(row.penalty, row.currency ?? baseCurrency).amount,
    freeBefore: row.free_before ?? null,
});

export const cancelFee = ( entry: Transaction, now: number ): number => {

    const opens = stampOf(entry.freeBefore)?.getTime();

    if ( !entry.canCancel || opens === undefined || now <= opens ) return 0;

    return Math.min(entry.amount, entry.penaltyFixed + entry.amount * entry.penaltyRate / 100);

};

export const ledgerOf = ( row: LedgerRow ): LedgerEntry => ({
    id: row.id,
    reason: row.reason ?? "",
    inbound: row.direction === "credit",
    points: row.unit === "points",
    pot: row.balance ?? "",
    ...cashOr(row.amount),
    referenceType: row.reference?.type ?? "",
    referenceId: row.reference?.id ?? 0,
    at: row.at ?? null,
});

export type FlowDay = {
    key: string;
    at: string;
    deposit: number;
    withdraw: number;
    transfer: number;
};

const transfers: ReadonlySet<string> = new Set([ "transfer_in", "transfer_out" ]);

const dayKey = ( moment: Date ): string =>
    `${ moment.getFullYear() }-${ String(moment.getMonth() + 1).padStart(2, "0") }-${ String(moment.getDate()).padStart(2, "0") }`;

export const flowOf = ( entries: readonly LedgerEntry[], span: number, now: Date = new Date() ): readonly FlowDay[] => {

    const days = new Map<string, FlowDay>();

    for ( let step = span - 1; step >= 0; step -= 1 ) {

        const moment = new Date(now.getFullYear(), now.getMonth(), now.getDate() - step);
        const key = dayKey(moment);

        days.set(key, { key, at: moment.toISOString(), deposit: 0, withdraw: 0, transfer: 0 });

    }

    for ( const entry of entries ) {

        const moment = stampOf(entry.at);
        const seat = moment ? days.get(dayKey(moment)) : undefined;

        if ( !seat ) continue;

        if ( transfers.has(entry.reason) ) seat.transfer += entry.amount;
        else if ( entry.inbound ) seat.deposit += entry.amount;
        else seat.withdraw += entry.amount;

    }

    return [ ...days.values() ];

};

const purposes: readonly RailPurpose[] = [ "pay", "deposit", "withdraw", "refund" ];

const purposeOf = ( value: string | null | undefined ): RailPurpose | null =>
    purposes.find(( purpose ) => purpose === value ) ?? null;

const slotted = ( entry: SlotRow ): RecipientField => ({
    name: entry.name,
    label: entry.label ?? entry.name,
    placeholder: entry.placeholder ?? "",
    type: entry.type ?? "text",
    required: Boolean(entry.required),
});

const drivable = ( held: Readonly<Record<string, boolean>>, purpose: RailPurpose, sandbox: boolean ): boolean => {

    if ( held[purpose] !== true ) return false;

    const hosted = held.hosted !== false || sandbox;

    if ( purpose === "pay" ) return hosted;
    if ( purpose === "deposit" ) return held.auto_deposit !== true || hosted;
    if ( purpose === "withdraw" ) return held.auto_withdraw !== true || hosted;

    return true;

};

const termed = ( rows: RailRow["currencies"] ): readonly RailTerms[] =>
    ( rows ?? [] ).flatMap(( row ) => {

        const purpose = purposeOf(row.purpose);
        const held = row.currency ?? baseCurrency;

        return row.active !== false && purpose ? [ {
            purpose,
            currency: held,
            min: bare(row.min_amount, held).amount,
            max: bare(row.max_amount, held).amount,
            fixedFee: bare(row.customer_fixed_fee, held).amount,
            feeRate: numeric(row.customer_fee_rate),
        } ] : [];

    });

export const signed = ( text: string, inbound: boolean ): string => isolateLtr(`${ inbound ? "+" : "\u2212" }${ text }`);

export const railOf = ( entry: RailRow ): Rail => ({
    id: entry.id,
    key: entry.name ?? "",
    name: entry.label || entry.name || "",
    kind: entry.type ?? "",
    image: media(entry.image),
    note: entry.description ?? "",
    linked: entry.linked !== false,
    abilities: purposes.filter(( purpose ) => drivable(entry.capabilities, purpose, entry.sandbox === true) ),
    terms: termed(entry.currencies),
    fields: Object.fromEntries(
        Object.entries(entry.fields)
            .filter(([ key ]) => purposeOf(key) !== null )
            .map(([ key, slots ]) => [ key, slots.map(slotted) ] ),
    ),
});

export const recipientOf = ( data: RecipientRow ): Recipient => ({ id: data.id, name: data.name ?? "" });
