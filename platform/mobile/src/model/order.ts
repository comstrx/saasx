import { picture } from "@/api/client";
import { baseCurrency, cash, numeric, oneOf } from "@/api/contracts";
import type { LegRow, MomentRow, OrderPay, OrderRow, PricedRow, QuoteRow } from "@/api/endpoints/orders";
import type { Money, Picture } from "@/model/catalog";
import { calendarDay } from "@/std/number";

export type PayType = OrderPay;

type LineTone = "charge" | "discount";

export type Line = {
    key: string;
    amount: Money;
    tone: LineTone;
};

type PayPlanKind = "full" | "deposit";

type PayOption = {
    kind: PayPlanKind;
    allowed: boolean;
    currency: string;
    dueNow: number;
    dueLater: number;
    dueAt: string | null;
};

type QuoteExtra = {
    id: number;
    name: string;
    quantity: number;
    total: Money;
};

export type QuoteFace = {
    currency: string;
    total: number;
    deposit: number;
    lines: readonly Line[];
    extras: readonly QuoteExtra[];
    options: readonly PayOption[];
    premiums: readonly number[];
};

type Quote = QuoteFace & {
    token: string;
    depositPercent: number;
    face: QuoteFace | null;
};

export const facing = ( quote: Quote ): QuoteFace => quote.face ?? quote;

export type Pool = {
    total: Money;
    lines: readonly Line[];
};

export const pooled = ( faces: readonly ( QuoteFace | null )[] ): Pool | null => {

    const currency = faces[0]?.currency;

    if ( !currency || faces.some(( face ) => face?.currency !== currency ) ) return null;

    const lines = new Map<string, Line>();

    for ( const line of faces.flatMap(( face ) => face?.lines ?? [] ) ) {

        const slot = `${ line.tone }:${ line.key }`;
        const held = lines.get(slot);

        lines.set(slot, held ? { ...held, amount: { currency, amount: held.amount.amount + line.amount.amount } } : line);

    }

    return { total: { currency, amount: faces.reduce(( sum, face ) => sum + ( face?.total ?? 0 ), 0) }, lines: [ ...lines.values() ] };

};

export const lineTotal = ( lines: readonly Line[], tone: LineTone, keys?: readonly string[] ): number =>
    lines
        .filter(( line ) => line.tone === tone && ( !keys || keys.includes(line.key) ) )
        .reduce(( sum, line ) => sum + line.amount.amount, 0 );

export type OrderLeg = {
    id: number;
    reference: string;
    kind: string;
    payment: string;
    status: string;
    amount: Money | null;
    canRefund: boolean;
    at: string | null;
};

type OrderState = string;

export type Stage = {
    key: string;
    done: boolean;
    live: boolean;
};

type Moment = {
    key: string;
    event: string;
    to: string;
    at: string | null;
};

export type Order = {
    id: number;
    catalogId: number;
    vendorId: number;
    reference: string;
    state: OrderState;
    stage: string;
    paid: boolean;
    title: string;
    image: Picture | null;
    type: string;
    quantity: number;
    adults: number;
    children: number;
    infants: number;
    pets: number;
    nights: number;
    unitPrice: Money | null;
    tax: Money | null;
    total: Money | null;
    paidAmount: Money | null;
    due: Money | null;
    refundable: Money | null;
    transactionId: number;
    gateway: string;
    legs: readonly OrderLeg[];
    paidAt: string | null;
    couponCode: string;
    canCancel: boolean;
    canRefund: boolean;
    canPay: boolean;
    canReview: boolean;
    startsAt: string | null;
    endsAt: string | null;
    scheduledAt: string | null;
    delivery: string;
    travellers: number;
    cancelBefore: string | null;
    at: string | null;
    stages: readonly Stage[];
    moments: readonly Moment[];
};

type OrderShape = "stay" | "papers" | "goods" | "dated" | "plain";

export const orderShape = ( order: Order ): OrderShape => {

    if ( order.nights > 0 ) return "stay";
    if ( order.travellers > 0 ) return "papers";
    if ( order.delivery ) return "goods";
    if ( order.startsAt || order.scheduledAt ) return "dated";

    return "plain";

};

export type CancelOutcome = "unpaid" | "refund" | "kept";

export const cancelOutcomeOf = ( order: Pick<Order, "paid" | "canRefund" | "refundable"> ): CancelOutcome => {

    if ( !order.paid ) return "unpaid";

    return order.canRefund && ( order.refundable?.amount ?? 0 ) > 0 ? "refund" : "kept";

};

export const refundableLegs = ( legs: readonly OrderLeg[] ): readonly OrderLeg[] =>
    legs.filter(( leg ) => leg.canRefund );

export const settled = ( state: OrderState ): boolean => state === "completed" || state === "confirmed";

export const journeyLive = ( stages: readonly Stage[] ): boolean =>
    stages.some(( stage ) => stage.live || stage.done );

export const dead = ( state: OrderState ): boolean =>
    state === "cancelled" || state === "failed" || state === "expired" || state === "refunded";

const dayOf = ( order: Pick<Order, "startsAt" | "scheduledAt"> ): string => calendarDay(order.startsAt ?? order.scheduledAt) ?? "";

export const upcomingOf = <T extends Pick<Order, "state" | "startsAt" | "scheduledAt">>( orders: readonly T[], today: string ): T | null =>
    orders
        .filter(( order ) => !dead(order.state) && order.state !== "completed" && dayOf(order) >= today )
        .sort(( a, b ) => dayOf(a).localeCompare(dayOf(b)) )[0] ?? null;

const legOf = ( entry: LegRow, fallback: string ): OrderLeg => ({
    id: entry.id ?? 0,
    reference: entry.reference ?? "",
    kind: entry.type ?? "",
    payment: entry.payment ?? "",
    status: entry.status ?? "",
    amount: cash(entry.amount, entry.currency ?? fallback),
    canRefund: Boolean(entry.can_refund),
    at: entry.created_at ?? null,
});

const stateOf = ( value: string | null | undefined ): OrderState => value || "pending";

const plans: readonly PayPlanKind[] = [ "full", "deposit" ];

const planOf = ( value: string ): PayPlanKind | null => plans.find(( plan ) => plan === value ) ?? null;

const faced = ( data: PricedRow, fallback: string ): QuoteFace => {

    const currency = data.currency ?? fallback;

    const lines: readonly Line[] = ( data.breakdown ?? [] ).map(( entry ) => ({
        key: entry.key,
        amount: { amount: numeric(entry.amount), currency },
        tone: entry.tone === "discount" ? "discount" : "charge",
    }));

    const options: readonly PayOption[] = ( data.payment_options ?? [] ).flatMap(( entry ) => {

        const kind = planOf(entry.kind);

        return kind ? [ {
            kind,
            allowed: entry.allowed !== false,
            currency: entry.currency ?? currency,
            dueNow: numeric(entry.due_now),
            dueLater: numeric(entry.due_later),
            dueAt: entry.due_at ?? null,
        } ] : [];

    });

    const partial = options.find(( option ) => option.kind === "deposit" && option.allowed );

    return {
        currency,
        total: numeric(data.family_total ?? data.total_price),
        deposit: partial?.dueNow ?? numeric(data.min_first_payment),
        lines,
        extras: ( data.lines ?? [] ).map(( entry ) => ({
            id: entry.catalog_id ?? 0,
            name: entry.name ?? "",
            quantity: entry.quantity ?? 1,
            total: { amount: numeric(entry.total_price), currency },
        })),
        options,
        premiums: ( data.applicants ?? [] ).map(( person ) => numeric(person.premium) ),
    };

};

export const quoteOf = ( data: QuoteRow ): Quote => {

    const binding = faced(data, baseCurrency);

    return {
        ...binding,
        token: data.quote_token,
        depositPercent: numeric(data.deposit_percent),
        face: data.display ? faced(data.display, binding.currency) : null,
    };

};

const walked = ( current: string, ahead: readonly string[] | null | undefined, past: readonly MomentRow[] | null | undefined ): readonly Stage[] => {

    const done = ( past ?? [] ).flatMap(( entry ) => entry.event?.startsWith("stage:") && entry.to ? [ entry.to ] : [] );
    const walk = [ ...new Set([ ...done, current, ...( ahead ?? [] ) ].filter(Boolean)) ];

    return walk.map(( key ) => ({ key, done: done.includes(key) && key !== current, live: key === current }));

};

const momented = ( past: readonly MomentRow[] | null | undefined ): readonly Moment[] =>
    ( past ?? [] ).map(( entry, slot ) => ({
        key: `${ entry.event ?? "event" }-${ slot }`,
        event: entry.event ?? "",
        to: entry.to ?? "",
        at: entry.at ?? null,
    }));

export const orderOf = ( entry: OrderRow ): Order => {

    const currency = entry.currency ?? baseCurrency;
    const stage = entry.stage ?? "";

    return {
        id: entry.id,
        catalogId: entry.catalog?.id ?? 0,
        vendorId: entry.vendor?.id ?? 0,
        reference: entry.ref_id ?? `#${ entry.id }`,
        state: stateOf(entry.status),
        stage,
        paid: Boolean(entry.paid),
        title: entry.catalog?.name ?? "",
        image: picture(entry.catalog?.image, oneOf(entry.catalog?.image_variants)),
        type: entry.catalog?.type ?? "",
        quantity: entry.quantity ?? 1,
        adults: entry.adults ?? 0,
        children: entry.children ?? 0,
        infants: entry.infants ?? 0,
        pets: Number(entry.pets ?? 0),
        nights: entry.nights ?? 0,
        unitPrice: cash(entry.unit_price, currency),
        tax: cash(entry.tax_amount, currency),
        total: cash(entry.total_amount ?? entry.amount, currency),
        paidAmount: cash(entry.paid_amount, currency),
        due: cash(entry.remaining_amount, currency),
        refundable: cash(entry.refundable_amount, currency),
        transactionId: entry.transaction?.id ?? 0,
        gateway: entry.transaction?.payment ?? "",
        legs: ( entry.transactions ?? ( entry.transaction ? [ entry.transaction ] : [] ) ).map(( held ) => legOf(held, currency) ),
        paidAt: entry.paid_at ?? null,
        couponCode: entry.coupon_code ?? "",
        canCancel: Boolean(entry.can_cancel ?? entry.allow_cancel),
        canRefund: Boolean(entry.can_refund ?? entry.allow_refund),
        canPay: Boolean(entry.can_pay ?? entry.allow_pay_later),
        canReview: Boolean(entry.can_review),
        startsAt: entry.starts_at ?? null,
        endsAt: entry.ends_at ?? null,
        scheduledAt: entry.scheduled_at ?? null,
        delivery: entry.delivery ?? "",
        travellers: ( entry.applicants ?? [] ).length,
        cancelBefore: entry.cancel_before ?? null,
        at: entry.created_at ?? null,
        stages: walked(stage, entry.next_stages, entry.timeline),
        moments: momented(entry.timeline),
    };

};
