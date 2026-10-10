import { ApiError } from "@/api/client";
import { catalogs, detail } from "@/api/endpoints/catalogs";
import { contract } from "@/api/endpoints/contract";
import { orders } from "@/api/endpoints/orders";
import { availabilityFrom, availabilityHorizon, comingDays, spanOpen } from "@/model/availability";
import { cartable } from "@/model/cart";
import { type Listing, listingsOf } from "@/model/catalog";
import { type CheckoutBasket, orderBody } from "@/model/checkout";
import { contractOf, type Requirements } from "@/model/contract";
import { type Detail, detailOf, sellable } from "@/model/detail";
import { quoteOf } from "@/model/order";
import { needsFrom, rangedFrom } from "@/model/requirement";
import { addIsoDays, todayIso } from "@/std/date-range";

type Quote = ReturnType<typeof quoteOf>;

type Fit = ( found: Detail, ranged: boolean, dated: boolean ) => boolean;

export type Pick = {
    detail: Detail;
    basket: CheckoutBasket;
    days: readonly string[];
};

const stamp = Date.now().toString(36);
const minute = 61000;
const budget = 12;

let pool: readonly Listing[] = [];
let rules: Requirements = {};

const seen = new Map<number, Detail>();

const pause = ( ms: number ) => new Promise<void>(( done ) => { setTimeout(done, ms); });

const patient = async <T>( task: () => Promise<T>, left = 3 ): Promise<T> => {

    try {

        return await task();

    }
    catch ( failure ) {

        if ( !( failure instanceof ApiError ) || !failure.throttled || left <= 0 ) throw failure;

        await pause(minute);

        return patient(task, left - 1);

    }

};

const shelf = async (): Promise<readonly Listing[]> => {

    if ( pool.length > 0 ) return pool;

    const deal = contractOf(await patient(() => contract.read()));
    const found: Listing[] = [];

    rules = deal.requirements;

    for ( const entry of deal.types ) found.push(...listingsOf(await patient(() => catalogs.list({ type: entry.key, limit: 40 }))));

    pool = found.sort(( first, second ) => first.id - second.id );

    return found;

};

const detailed = async ( id: number ): Promise<Detail> => {

    const held = seen.get(id);

    if ( held ) return held;

    const found = detailOf(await patient(() => detail.show(id, { adults: 1, children: 0 })));

    seen.set(id, found);

    return found;

};

const openDays = async ( found: Detail, nights: number ): Promise<readonly string[]> => {

    const open = availabilityFrom(await patient(() => detail.availability(found.id, todayIso(), addIsoDays(todayIso(), availabilityHorizon))));

    if ( !open.known ) return [ addIsoDays(todayIso(), 12), addIsoDays(todayIso(), 13) ];

    return comingDays(open).map(( day ) => day.iso ).filter(( iso ) => iso > todayIso() && spanOpen(open, iso, nights ? addIsoDays(iso, nights) : null) );

};

export const pick = async ( name: string, fits: Fit, accept: ( quote: Quote ) => boolean = ( quote ) => quote.total > 0 ): Promise<Pick> => {

    let quoted = 0;

    for ( const listing of await shelf() ) {

        if ( quoted >= budget ) break;
        if ( !cartable(listing.capabilities) ) continue;

        const found = await detailed(listing.id);
        const ranged = rangedFrom(rules, found.capabilities);
        const dated = needsFrom(rules, found.capabilities).includes("dates");

        if ( !sellable(found) || !fits(found, ranged, dated) ) continue;

        const nights = ranged ? Math.max(2, found.minStay) : 0;
        const days = dated ? await openDays(found, nights) : [];
        const start = days[0] ?? "";

        if ( dated && days.length < 2 ) continue;

        const basket: CheckoutBasket = {
            catalog: found.id,
            sellable: found.sellables.find(( seat ) => seat.fits && !seat.soldOut )?.id,
            quantity: Math.max(1, found.minQuantity),
            startsAt: start,
            endsAt: nights && start ? addIsoDays(start, nights) : "",
            adults: 1,
            children: 0,
            infants: 0,
            pets: 0,
        };

        quoted += 1;

        const priced = await patient(() => orders.preview(orderBody(basket), `pick-${ name }-${ found.id }-${ stamp }`), 1).then(quoteOf, ( failure: unknown ) => {

            if ( failure instanceof ApiError ) return null;

            throw failure;

        });

        if ( priced && accept(priced) ) return { detail: found, basket, days };

    }

    throw new Error(`no catalog fits "${ name }" within ${ quoted } quotes`);

};
