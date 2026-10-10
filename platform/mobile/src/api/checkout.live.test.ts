import { ApiError, configure } from "@/api/client";
import { auth } from "@/api/endpoints/auth";
import { catalogs, detail } from "@/api/endpoints/catalogs";
import { contract } from "@/api/endpoints/contract";
import { coupons } from "@/api/endpoints/coupons";
import { orders } from "@/api/endpoints/orders";
import { wallet } from "@/api/endpoints/wallet";
import { pick } from "@/api/picks.live";
import { challenged } from "@/model/auth";
import { availabilityFrom, availabilityHorizon, comingDays, spanOpen } from "@/model/availability";
import { listingsOf } from "@/model/catalog";
import { type Applicant, type CheckoutBasket, checkoutPayment, orderBody } from "@/model/checkout";
import { contractOf } from "@/model/contract";
import { couponCheckOf, couponOf } from "@/model/coupon";
import { wireAmount } from "@/model/currency";
import { detailOf, type Extra, personal, staying } from "@/model/detail";
import { facing, orderOf, quoteOf } from "@/model/order";
import { intentOf } from "@/model/payment";
import { needsFrom, rangedFrom } from "@/model/requirement";
import { railOf, railsFor } from "@/model/wallet";
import { addIsoDays, todayIso } from "@/std/date-range";
import type { Identified } from "@/std/identity";

const baseUrl = process.env.LIVE_API_URL ?? "http://localhost:8000/v1";
const tenant = process.env.LIVE_TENANT ?? "dev.localhost";
const password = process.env.LIVE_PASSWORD ?? "";
const otp = process.env.LIVE_OTP ?? "11111";
const qa: Identified = { kind: "email", value: process.env.LIVE_EMAIL ?? "" };

let stay = 0;

const stamp = Date.now().toString(36);
const minute = 61000;
const long = 300000;

const attempt = ( name: string ) => `checkout-${ name }-${ stamp }`;

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

const confirmed = async <T>( name: string, task: ( key: string, code: string | null ) => Promise<T> ): Promise<T> => {

    try {

        return await patient(() => task(attempt(name), null));

    }
    catch ( failure ) {

        if ( !( failure instanceof ApiError ) || !failure.confirmable ) throw failure;

        return patient(() => task(attempt(`${ name }-code`), otp));

    }

};

const reachable = async (): Promise<boolean> => {

    if ( !password || !qa.value ) return false;

    try {

        return ( await fetch(`${ baseUrl }/contract`) ).ok;

    }
    catch {

        return false;

    }

};

const quote = ( basket: CheckoutBasket, name: string ) =>
    patient(() => orders.preview(orderBody(basket), attempt(name))).then(quoteOf);

let live = false;
let basket: CheckoutBasket = { catalog: 0, quantity: 1, startsAt: "", endsAt: "", adults: 1, children: 0, infants: 0, pets: 0 };
let extras: readonly Extra[] = [];

describe("live flows · checkout", () => {

    beforeAll(async () => {

        live = await reachable();

        configure({ baseUrl, tenant, locale: "en", currency: "USD", token: null, onExpire: null });

        if ( !live ) return;

        const outcome = await patient(() => auth.login(qa, password, attempt("login")));
        const token = challenged(outcome)
            ? ( await patient(() => auth.verifyOtp({ challenge_token: outcome.challenge_token, otp }, attempt("otp"))) ).token
            : outcome.token;

        configure({ token });

        const held = await pick("stay", ( found ) => staying(found) && found.extras.length > 0 );

        stay = held.detail.id;
        basket = held.basket;
        extras = held.detail.extras;

    }, long);

    test("an add-on raises the quote and rides in its extras", async () => {

        if ( !live ) return;

        const extra = extras[0];

        if ( !extra ) throw new Error(`catalog ${ stay } carries no add-on`);

        const plain = await quote(basket, "plain");
        const topped = await quote({ ...basket, addons: [ { id: extra.id, quantity: 1 } ] }, "topped");

        expect(topped.total).toBeGreaterThan(plain.total);
        expect(facing(topped).extras.some(( line ) => line.id === extra.id )).toBe(true);

    }, long);

    test("a coupon that validates on the stay lowers its quote", async () => {

        if ( !live ) return;

        const held = [
            ...( await coupons.mine() ).rows.map(( row ) => couponOf(row, true) ),
            ...( await coupons.available() ).rows.map(( row ) => couponOf(row, false) ),
        ];
        const codes = [ ...new Set(held.filter(( coupon ) => coupon.valid && coupon.code ).map(( coupon ) => coupon.code )) ];

        let applied = "";

        for ( const code of codes ) {

            const check = await patient(() => coupons.validate(code, stay, 1, attempt(`validate-${ code }`))).then(( row ) => couponCheckOf(row, code), ( failure: unknown ) => {

                if ( failure instanceof ApiError ) return null;

                throw failure;

            });

            if ( check ) { applied = code; break; }

        }

        if ( !applied ) throw new Error(`no coupon applies to catalog ${ stay } (${ codes.join(", ") || "none held or offered" })`);

        const plain = await quote(basket, "before-coupon");
        const cut = await quote({ ...basket, coupon: applied }, "coupon");

        expect(cut.total).toBeLessThan(plain.total);

    }, long);

    test("a deposit plan pays part now from the wallet and the rest later", async () => {

        if ( !live ) return;

        const planned = await pick("deposit", () => true, ( offered ) => offered.deposit > 0 && offered.deposit < offered.total );
        const priced = await quote(planned.basket, "deposit-quote");
        const placed = ( await confirmed("deposit-checkout", ( key, code ) =>
            orders.checkout(orderBody(planned.basket), "wallet", priced.token, null, wireAmount(checkoutPayment(priced, "deposit"), priced.currency), key, code)) ).order.id;

        expect(placed).toBeGreaterThan(0);

        const part = orderOf(await orders.show(placed));

        expect(part.paidAmount?.amount ?? 0).toBeLessThan(part.total?.amount ?? 0);
        expect(part.canPay).toBe(true);

        const rest = await patient(() => orders.quote(placed, attempt("rest-quote")));

        intentOf(await confirmed("rest-pay", ( key, code ) => orders.pay(placed, rest, null, key, code)), placed);

        const whole = orderOf(await orders.show(placed));

        expect(whole.paidAmount?.amount ?? 0).toBeGreaterThanOrEqual(whole.total?.amount ?? 1);

        if ( whole.canCancel ) await patient(() => orders.cancel(placed, attempt("deposit-release")));

    }, long);

    test("the mock rail takes an order through its webhook, and a declined leg leaves it payable", async () => {

        if ( !live ) return;

        const rail = railsFor(( await wallet.rails() ).map(railOf), "pay")[0];

        if ( !rail ) throw new Error("no rail pays an order");

        const single = await pick("mock", ( found, ranged ) => !ranged && !personal(found) );

        const settle = async ( approve: boolean ) => {

            const ticket: CheckoutBasket = { ...single.basket, pay: "directly", gateway: rail.id };
            const priced = await quote(ticket, `mock-quote-${ approve }`);
            const placed = await confirmed(`mock-${ approve }`, ( key, code ) =>
                orders.checkout(orderBody(ticket), "directly", priced.token, rail.id, wireAmount(priced.total, priced.currency), key, code));
            const intent = intentOf(placed.payment, placed.order.id);

            if ( !intent.reference ) throw new Error("the rail answered no reference");

            expect(intent.order).toBe(placed.order.id);
            expect(intent.url).toBeTruthy();

            const hook = await fetch(`${ baseUrl }/webhook/payment/mock/pay`, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json", "X-Tenant-Domain": tenant },
                body: JSON.stringify({ reference: intent.reference, status: approve, paid_amount: wireAmount(priced.total, priced.currency), paid_currency: priced.currency }),
            });

            expect(hook.ok).toBe(true);

            return orderOf(await orders.show(placed.order.id));

        };

        const paid = await settle(true);

        expect(paid.paid).toBe(true);

        const declined = await settle(false);

        expect(declined.paid).toBe(false);
        expect(declined.canPay).toBe(true);

        for ( const order of [ paid, declined ] ) if ( order.canCancel ) await patient(() => orders.cancel(order.id, attempt(`mock-release-${ order.id }`)));

    }, long);

    test("an applicant booking places one order that carries every traveller", async () => {

        if ( !live ) return;

        const deal = contractOf(await contract.read());
        const travellers: readonly Applicant[] = [
            { key: "applicant-1", name: "Flow Traveller", birth: "1990-01-01" },
            { key: "applicant-2", name: "Flow Companion", birth: "1992-06-15" },
        ];
        const passed: string[] = [];

        for ( const entry of deal.types ) {

            for ( const listing of listingsOf(await catalogs.list({ type: entry.key, limit: 5 })) ) {

                const found = detailOf(await detail.show(listing.id, { adults: 1, children: 0 }));
                const needs = needsFrom(deal.requirements, found.capabilities);

                if ( !needs.includes("applicants") ) break;

                const nights = rangedFrom(deal.requirements, found.capabilities) ? Math.max(2, found.minStay ?? 0) : 0;
                const open = needs.includes("dates") ? availabilityFrom(await detail.availability(found.id, todayIso(), addIsoDays(todayIso(), availabilityHorizon))) : null;
                const start = ( open ? comingDays(open).map(( day ) => day.iso ).find(( iso ) => iso > todayIso() && spanOpen(open, iso, nights ? addIsoDays(iso, nights) : null) ) : null ) ?? addIsoDays(todayIso(), 20);
                const booking: CheckoutBasket = {
                    catalog: found.id,
                    sellable: found.sellables[0]?.id,
                    quantity: travellers.length,
                    startsAt: needs.includes("dates") ? start : "",
                    endsAt: needs.includes("dates") && nights ? addIsoDays(start, nights) : "",
                    adults: needs.includes("guests") ? 1 : 0,
                    children: 0,
                    infants: 0,
                    pets: 0,
                    applicants: travellers,
                };
                const priced = await quote(booking, `applicants-quote-${ found.id }`).catch(( failure: unknown ) => {

                    if ( failure instanceof ApiError ) return null;

                    throw failure;

                });

                if ( !priced ) {

                    passed.push(`${ entry.key }#${ found.id }`);
                    continue;

                }

                const booked = await confirmed(`applicants-${ found.id }`, ( key, code ) =>
                    orders.checkout(orderBody(booking), "wallet", priced.token, null, wireAmount(checkoutPayment(priced, "full"), priced.currency), key, code));
                const placed = orderOf(await orders.show(booked.order.id));

                expect(placed.travellers).toBe(travellers.length);

                if ( placed.canCancel ) await patient(() => orders.cancel(placed.id, attempt(`applicants-release-${ placed.id }`)));

                return;

            }

        }

        throw new Error(`no applicant listing places an order${ passed.length ? ` (passed over ${ passed.join(", ") })` : "" }`);

    }, long);

});
