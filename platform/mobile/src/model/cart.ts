import { type Cash, cash } from "@/api/contracts";
import type { CartFactsBody, CartHeldRow, CartLineRow, CartPage, CartSettledRow } from "@/api/endpoints/cart";
import { type Listing, listingOf } from "@/model/catalog";
import { type Applicant, applicantsReady, type CheckoutBasket } from "@/model/checkout";
import { intentOf, type PaymentIntent } from "@/model/payment";
import type { Need } from "@/model/requirement";
import { addIsoDays, todayIso, validDateSpan } from "@/std/date-range";
import { calendarDay } from "@/std/number";

export type LineFacts = {
    startsAt: string | null;
    endsAt: string | null;
    adults: number;
    children: number;
    infants: number;
    pets: boolean;
    applicants: readonly Applicant[];
};

export type CartLine = {
    id: number;
    quantity: number;
    listing: Listing;
    minimum: number;
    maximum: number | null;
    unit: Cash | null;
    total: Cash | null;
    was: Cash | null;
    payLater: boolean;
    shipped: boolean;
    facts: LineFacts;
};

export type Basket = {
    lines: readonly CartLine[];
    subtotal: Cash | null;
    quantity: number;
};

export type LineNeed = Need;

export const emptyBasket: Basket = { lines: [], subtotal: null, quantity: 0 };

export const cartable = ( capabilities: readonly string[] ): boolean =>
    capabilities.includes("bookable") || capabilities.includes("purchasable");

export const datesLive = ( facts: LineFacts, ranged = true ): boolean =>
    validDateSpan({ start: facts.startsAt, end: facts.endsAt }, ranged, addIsoDays(todayIso(), 1));

const factsReady = ( needs: readonly LineNeed[], facts: LineFacts, ranged: boolean ): boolean => {

    if ( needs.includes("dates") && !datesLive(facts, ranged) ) return false;
    if ( needs.includes("guests") && facts.adults < 1 ) return false;
    if ( needs.includes("applicants") && !applicantsReady(facts.applicants) ) return false;

    return true;

};

export const lineReady = ( needs: readonly LineNeed[], line: CartLine, ranged: boolean ): boolean =>
    factsReady(needs, line.facts, ranged);

export const seedFacts = ( needs: readonly LineNeed[], ranged: boolean ): Partial<LineFacts> => {

    if ( !needs.length ) return {};

    const start = addIsoDays(todayIso(), 1);

    return {
        ...( needs.includes("dates") ? { startsAt: start, ...( ranged ? { endsAt: addIsoDays(start, 1) } : {} ) } : {} ),
        ...( needs.includes("guests") ? { adults: 1, children: 0 } : {} ),
    };

};

const unpriced = ( line: CartLine ): boolean => line.total === null;

export const indicative = ( line: CartLine ): boolean =>
    line.total?.binding === false || line.listing.capabilities.includes("underwritten");

export const sumOf = ( lines: readonly CartLine[] ): Cash | null => {

    if ( !lines.length ) return null;
    if ( lines.some(unpriced) ) return null;

    const currency = lines[0]?.total?.currency ?? "";

    if ( lines.some(( line ) => line.total?.currency !== currency ) ) return null;

    return {
        amount: lines.reduce(( sum, line ) => sum + ( line.total?.amount ?? 0 ), 0),
        currency,
    };

};

export const countOf = ( lines: readonly CartLine[] ): number =>
    lines.reduce(( sum, line ) => sum + line.quantity, 0);

export const capped = ( line: CartLine ): boolean =>
    line.maximum !== null && line.quantity >= line.maximum;

export const basketOf = ( line: CartLine ): CheckoutBasket => ({
    catalog: line.listing.id,
    quantity: line.quantity,
    startsAt: line.facts.startsAt ?? "",
    endsAt: line.facts.endsAt ?? "",
    adults: line.facts.adults,
    children: line.facts.children,
    infants: line.facts.infants,
    pets: line.facts.pets ? 1 : 0,
    applicants: line.facts.applicants,
});

const bound = ( value: string | number | null | undefined ): number | null =>
    value === null || value === undefined || value === "" ? null : Number(value);

const ceiling = ( entry: CartHeldRow ): number | null => {

    const stock = entry.stock ?? null;
    const most = bound(entry.max_quantity);

    if ( stock === null ) return most;
    if ( most === null ) return stock;

    return Math.min(stock, most);

};

const reduced = ( live: Cash | null, base: Cash | null ): Cash | null =>
    live && base && live.currency === base.currency && live.amount < base.amount ? base : null;

export const lineOf = ( entry: CartLineRow ): CartLine => {

    const listing = listingOf(entry.catalog);

    return {
        id: entry.id,
        quantity: Number(entry.quantity ?? 1),
        listing,
        minimum: bound(entry.catalog.min_quantity) ?? 1,
        maximum: ceiling(entry.catalog),
        unit: cash(entry.unit),
        total: cash(entry.live_total) ?? cash(entry.total),
        was: reduced(cash(entry.live_total), cash(entry.total)),
        payLater: Boolean(entry.catalog.allow_pay_later),
        shipped: listing.capabilities.includes("deliverable") && entry.catalog.delivery === "shipping",
        facts: {
            startsAt: calendarDay(entry.starts_at),
            endsAt: calendarDay(entry.ends_at),
            adults: entry.adults ?? 0,
            children: entry.children ?? 0,
            infants: entry.infants ?? 0,
            pets: Boolean(entry.pets),
            applicants: ( entry.applicants ?? [] ).map(( row, index ) => ({
                key: `applicant-${ index + 1 }`,
                name: row.name ?? "",
                birth: calendarDay(row.birth_date) ?? "",
            })),
        },
    };

};

export const cartOf = ( page: CartPage ): Basket => ({
    lines: page.rows.map(lineOf),
    subtotal: cash(page.summary?.live_subtotal) ?? cash(page.summary?.subtotal),
    quantity: page.summary?.quantity ?? 0,
});

export const factsBody = ( facts: Partial<LineFacts> ): CartFactsBody => ({
    ...( facts.startsAt ? { starts_at: facts.startsAt } : {} ),
    ...( facts.endsAt ? { ends_at: facts.endsAt } : {} ),
    ...( facts.adults !== undefined ? { adults: facts.adults } : {} ),
    ...( facts.children !== undefined ? { children: facts.children } : {} ),
    ...( facts.infants !== undefined ? { infants: facts.infants } : {} ),
    ...( facts.pets !== undefined ? { pets: facts.pets } : {} ),
    ...( facts.applicants
        ? { applicants: facts.applicants.map(( row ) => ({ name: row.name.trim(), birth_date: row.birth }) ) }
        : {} ),
});

export type CartSettlement = {
    orders: readonly { id: number; intent: PaymentIntent }[];
    failed: readonly number[];
};

export const settlementOf = ( data: CartSettledRow ): CartSettlement => ({
    orders: ( data.items ?? [] ).map(( row ) => ({ id: row.id ?? 0, intent: intentOf(row.transaction ?? null, row.id ?? null) }) ),
    failed: ( data.failed ?? [] ).map(( row ) => row.id ?? 0 ),
});
