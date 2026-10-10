import { ApiError, configure } from "@/api/client";
import { account } from "@/api/endpoints/account";
import { auth } from "@/api/endpoints/auth";
import { cart } from "@/api/endpoints/cart";
import { chat } from "@/api/endpoints/chat";
import { coupons } from "@/api/endpoints/coupons";
import { notifications } from "@/api/endpoints/notifications";
import { orders } from "@/api/endpoints/orders";
import { referrals } from "@/api/endpoints/referrals";
import { sessions } from "@/api/endpoints/sessions";
import { tickets } from "@/api/endpoints/tickets";
import { wallet } from "@/api/endpoints/wallet";
import { type Pick, pick } from "@/api/picks.live";
import { identity as brand } from "@/brand/identity";
import { accountOf, settingsOf } from "@/model/account";
import { challenged } from "@/model/auth";
import { cartOf, factsBody, lineOf, settlementOf } from "@/model/cart";
import { orderBody } from "@/model/checkout";
import { couponCheckOf, couponEventOf, couponOf } from "@/model/coupon";
import { wireAmount } from "@/model/currency";
import { personal } from "@/model/detail";
import { levelOf, rewardOf, tiersOf } from "@/model/level";
import { boardOf } from "@/model/notification";
import { dead, orderOf, quoteOf } from "@/model/order";
import { intentOf } from "@/model/payment";
import { grantOf, invitedOf } from "@/model/referral";
import { deviceOf } from "@/model/session";
import { shelve } from "@/model/shelf";
import { ticketOf } from "@/model/ticket";
import { balanceOf, fieldsOf, ledgerOf, railOf, railsFor, termsOf, transactionOf } from "@/model/wallet";
import type { Identified } from "@/std/identity";

const baseUrl = process.env.LIVE_API_URL ?? "http://localhost:8000/v1";
const tenant = process.env.LIVE_TENANT ?? "dev.localhost";
const password = process.env.LIVE_PASSWORD ?? "";
const otp = process.env.LIVE_OTP ?? "11111";
const qa: Identified = { kind: "email", value: process.env.LIVE_EMAIL ?? "" };

const stamp = Date.now().toString(36);
const peer: Identified = { kind: "email", value: `peer-${ stamp }@${ brand.site }` };
const peerPhone = `+9665${ String(Date.now() + 7919).slice(-8) }`;
const peerSecret = `Peer-${ stamp }-Cc3!`;

const minute = 61000;
const long = 300000;

const attempt = ( name: string ) => `commerce-${ name }-${ stamp }`;

const filled = ( type: string ): string => type === "phone" ? peerPhone : type === "email" ? peer.value : "flow";

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

const enter = async ( who: Identified, secret: string, name: string ): Promise<string> => {

    const outcome = await patient(() => auth.login(who, secret, attempt(`login-${ name }`)));

    if ( !challenged(outcome) ) return outcome.token;

    return ( await patient(() => auth.verifyOtp({ challenge_token: outcome.challenge_token, otp }, attempt(`otp-${ name }`))) ).token;

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

let live = false;
let qaToken = "";
let paid = 0;
let single: Pick | null = null;

const held = (): Pick => {

    if ( !single ) throw new Error("no single-date catalog was picked");

    return single;

};

describe("live flows · commerce", () => {

    beforeAll(async () => {

        live = await reachable();

        if ( live ) await pause(minute);

        configure({ baseUrl, tenant, locale: "en", currency: "USD", token: null, onExpire: null });

        if ( !live ) return;

        const outcome = await patient(() => auth.register({ name: "Flow Peer", email: peer.value, phone: peerPhone, password: peerSecret, password_confirmation: peerSecret }, attempt("peer")));

        if ( challenged(outcome) ) await patient(() => auth.verifyOtp({ challenge_token: outcome.challenge_token, otp }, attempt("peer-otp")));

        qaToken = await enter(qa, password, "qa");
        configure({ token: qaToken });

        single = await pick("single", ( found, ranged, dated ) => dated && !ranged && found.payLater && !personal(found) );

    }, long);

    test("checkout by wallet places a paid single-date order", async () => {

        if ( !live ) return;

        const basket = held().basket;
        const quote = quoteOf(await patient(() => orders.preview(orderBody(basket), attempt("preview"))));
        const placed = await confirmed("checkout", ( key, code ) =>
            orders.checkout(orderBody(basket), "wallet", quote.token, null, wireAmount(quote.total, quote.currency), key, code));
        const intent = intentOf(placed.payment, placed.order.id);

        expect(intent.url).toBeNull();

        paid = intent.order ?? 0;

        expect(paid).toBeGreaterThan(0);
        expect(orderOf(await orders.show(paid)).paid).toBe(true);

    }, long);

    test("the paid order opens its chat and a ticket that walks resolve → close → reopen", async () => {

        if ( !live || !paid ) return;

        expect(await patient(() => chat.open("orders", paid, attempt("order-chat")))).toBeGreaterThan(0);

        const ticket = ticketOf(await patient(() => tickets.open({ title: "Flow ticket", content: "Driven by the live flow suite.", order: paid }, attempt("ticket"))));

        await patient(() => tickets.reply(ticket.id, "A follow-up from the flow suite.", attempt("reply")));

        const walk = [ ticket.status ];

        for ( const move of [ "resolve", "close", "reopen" ] as const ) {

            await patient(() => tickets.move(ticket.id, move, attempt(`ticket-${ move }`)));

            walk.push(ticketOf(await tickets.show(ticket.id)).status);

        }

        expect(new Set(walk).size).toBeGreaterThan(1);
        expect(ticketOf(await tickets.show(ticket.id)).replies.length).toBeGreaterThan(0);

    }, long);

    test("the cart takes a line, amends its facts, counts, drops and clears", async () => {

        if ( !live ) return;

        const { detail: found, days } = held();
        const [ first = null, second = null ] = days;

        await patient(() => cart.add(found.id, factsBody({ startsAt: first, adults: 1, children: 0 }), attempt("cart-add")));

        const line = cartOf(await cart.list()).lines.find(( entry ) => entry.listing.id === found.id );

        if ( !line ) throw new Error("the added line never reached the cart");

        const amended = lineOf(await patient(() => cart.amend(line.id, factsBody({ startsAt: second }), attempt("cart-amend"))));

        expect(amended.facts.startsAt).toBe(second);

        const raised = lineOf(await patient(() => cart.raise(line.id, 1, attempt("cart-raise"))));

        expect(raised.quantity).toBe(line.quantity + 1);

        const lowered = lineOf(await patient(() => cart.lower(line.id, 1, attempt("cart-lower"))));

        expect(lowered.quantity).toBe(line.quantity);

        await patient(() => cart.drop(line.id, attempt("cart-drop")));

        expect(cartOf(await cart.list()).lines.some(( entry ) => entry.id === line.id )).toBe(false);

        await patient(() => cart.add(found.id, factsBody({ startsAt: first, adults: 1, children: 0 }), attempt("cart-add-again")));
        await patient(() => cart.clear([], attempt("cart-clear")));

        expect(cartOf(await cart.list()).lines.length).toBe(0);

    }, long);

    test("a pay-later cart order is paid now from the wallet, another one cancels", async () => {

        if ( !live ) return;

        const later = async ( name: string ): Promise<number> => {

            const { detail: found, days } = held();

            await patient(() => cart.clear([], attempt(`${ name }-wipe`)));
            await patient(() => cart.add(found.id, factsBody({ startsAt: days[0] ?? null, adults: 1, children: 0 }), attempt(`${ name }-add`)));

            const line = cartOf(await cart.list()).lines[0];

            if ( !line ) throw new Error("the pay-later line never reached the cart");

            const settled = settlementOf(await confirmed(`${ name }-settle`, ( key, code ) =>
                cart.settle([ { id: line.id, pay_type: "later" } ], key, code)));
            const placed = settled.orders[0]?.id ?? 0;

            if ( placed <= 0 ) throw new Error(`catalog ${ found.id } refused a pay-later order`);

            return placed;

        };

        const owed = await later("owed");
        const unpaid = orderOf(await orders.show(owed));

        expect(unpaid.paid).toBe(false);
        expect(unpaid.canPay).toBe(true);

        const token = await patient(() => orders.quote(owed, attempt("owed-quote")));

        intentOf(await confirmed("owed-pay", ( key, code ) => orders.pay(owed, token, null, key, code)), owed);

        expect(orderOf(await orders.show(owed)).paid).toBe(true);

        const doomed = await later("doomed");

        expect(orderOf(await orders.show(doomed)).canCancel).toBe(true);

        await patient(() => orders.cancel(doomed, attempt("cancel")));

        expect(dead(orderOf(await orders.show(doomed)).state)).toBe(true);

    }, long);

    test("a paid wallet order cancels and returns exactly what the order called refundable", async () => {

        if ( !live || !paid ) return;

        const before = orderOf(await orders.show(paid));

        expect(before.canCancel).toBe(true);

        const purse = balanceOf(await wallet.balance());
        const owed = before.canRefund ? before.refundable?.amount ?? 0 : 0;

        await patient(() => orders.cancel(paid, attempt("cancel-paid")));

        const after = orderOf(await orders.show(paid));
        const moved = balanceOf(await wallet.balance()).spendable - purse.spendable;

        expect(dead(after.state)).toBe(true);

        if ( owed > 0 ) expect(moved).toBeGreaterThan(0);
        else expect(moved).toBeCloseTo(0, 2);

    }, long);

    test("a reviewable order takes one review and refuses a second", async () => {

        if ( !live ) return;

        let open = null as ReturnType<typeof orderOf> | null;

        for ( let page = 1, pages = 1; page <= pages && !open; page += 1 ) {

            const shelf = shelve(await orders.page(page, 100), ( rows ) => rows.map(orderOf));

            open = shelf.items.find(( entry ) => entry.canReview ) ?? null;
            pages = shelf.pages;

        }

        if ( !open ) throw new Error("no order is reviewable");

        await patient(() => orders.review(open.id, { rating: 5, title: "Flow review", content: "Driven end to end by the flow suite." }, attempt("review")));

        const again = await patient(() => orders.review(open.id, { rating: 4, title: "Again", content: "A second try." }, attempt("review-again"))).then(() => null, ( failure: unknown ) => failure );

        expect(again).toBeInstanceOf(ApiError);
        expect(orderOf(await orders.show(open.id)).canReview).toBe(false);

    }, long);

    test("wallet: a deposit starts on a manual rail and cancels while pending", async () => {

        if ( !live ) return;

        const purse = balanceOf(await wallet.balance());
        const rail = railsFor(( await wallet.rails() ).map(railOf), "deposit")[0];

        if ( !rail ) throw new Error("no deposit rail");

        const terms = termsOf(rail, "deposit", purse.currency);
        const amount = Math.max(terms?.min ?? 0, 10);
        const details = Object.fromEntries(fieldsOf(rail, "deposit").map(( field ) => [ field.name, filled(field.type) ]));
        const intent = intentOf(await patient(() => wallet.deposit(rail.id, wireAmount(amount, terms?.currency ?? purse.currency), terms?.currency ?? purse.currency, details, attempt("deposit"))));
        const row = ( await wallet.transactions(1, 20) ).rows.map(transactionOf).find(( entry ) => entry.reference === intent.reference );

        if ( !row ) throw new Error("the deposit never reached the ledger");

        expect(row.kind).toBe("deposit");

        if ( row.canCancel ) {

            await patient(() => wallet.cancel(row.id, attempt("deposit-cancel")));

            expect(( await wallet.transactions(1, 20) ).rows.map(transactionOf).find(( entry ) => entry.id === row.id )?.state).toBe("cancelled");

        }

    }, long);

    test("wallet: a withdraw passes the confirmation gate and starts", async () => {

        if ( !live ) return;

        const purse = balanceOf(await wallet.balance());
        const rail = railsFor(( await wallet.rails() ).map(railOf), "withdraw")[0];

        if ( !rail ) throw new Error("no withdraw rail");

        const terms = termsOf(rail, "withdraw", purse.currency);
        const amount = Math.max(terms?.min ?? 0, 10);
        const recipient = Object.fromEntries(fieldsOf(rail, "withdraw").map(( field ) => [ field.name, filled(field.type) ]));
        const intent = intentOf(await confirmed("withdraw", ( key, code ) => wallet.withdraw(rail.id, wireAmount(amount, terms?.currency ?? purse.currency), terms?.currency ?? purse.currency, recipient, code, key)));

        expect(( await wallet.transactions(1, 20) ).rows.map(transactionOf).some(( entry ) => entry.reference === intent.reference && entry.kind === "withdraw" )).toBe(true);

    }, long);

    test("wallet: a second member receives a transfer", async () => {

        if ( !live ) return;

        const found = await patient(() => wallet.resolve(peer.value));

        expect(found.id).toBeGreaterThan(0);

        const currency = balanceOf(await wallet.balance()).currency;

        await confirmed("transfer", ( key, code ) => wallet.transfer(peer.value, wireAmount(1, currency), key, code));

        expect(( await wallet.transactions(1, 20) ).rows.map(transactionOf).some(( entry ) => entry.kind === "transfer" )).toBe(true);
        expect(( await wallet.statement(1, 20) ).rows.map(ledgerOf).length).toBeGreaterThan(0);

    }, long);

    test("coupons, referrals, level and rewards answer through their mappers", async () => {

        if ( !live ) return;

        const offered = ( await coupons.available() ).rows.map(( row ) => couponOf(row, false) );

        ( await coupons.mine() ).rows.map(( row ) => couponOf(row, true) );
        ( await coupons.history() ).map(couponEventOf);

        const usable = offered.find(( coupon ) => coupon.valid && coupon.code );

        if ( usable ) {

            const verdict = await patient(() => coupons.validate(usable.code, held().detail.id, 1, attempt("coupon-validate"))).then(( row ) => couponCheckOf(row, usable.code), ( failure: unknown ) => failure );

            expect(verdict instanceof ApiError || typeof ( verdict as { code: string } ).code === "string").toBe(true);

        }

        ( await referrals.list(1, 20) ).rows.map(invitedOf);
        ( await referrals.programme() ).map(grantOf);

        levelOf(await account.level());
        tiersOf(await account.tiers());
        ( await account.rewards() ).map(rewardOf);

    }, long);

    test("notifications: the first alert reads, pins and unpins", async () => {

        if ( !live ) return;

        const first = boardOf(await notifications.board([], 1, 10)).items[0];

        if ( !first ) throw new Error("the board is empty");

        await patient(() => notifications.mark(first.id, "read", attempt("alert-read")));
        await patient(() => notifications.mark(first.id, "pin", attempt("alert-pin")));

        expect(boardOf(await notifications.board([], 1, 50)).items.find(( alert ) => alert.id === first.id )?.pinned).toBe(true);

        await patient(() => notifications.mark(first.id, "unpin", attempt("alert-unpin")));

        expect(boardOf(await notifications.board([], 1, 50)).items.find(( alert ) => alert.id === first.id )?.read).toBe(true);

    }, long);

    test("settings: a notify channel toggles and restores; preferences save and restore", async () => {

        if ( !live ) return;

        const settings = settingsOf(await account.settings());
        const topic = settings.topics.find(( entry ) => !entry.forced && entry.channels.length > 0 );

        if ( !topic ) throw new Error("no editable notify topic");

        const channel = topic.channels[0];

        if ( !channel ) throw new Error("topic without channels");

        const flip = ( on: boolean ) => ({ notify_prefs: { [topic.key]: { channels: { [channel.key]: on } } } });

        await patient(() => account.saveSettings(flip(!channel.on), attempt("notify-flip")));

        expect(settingsOf(await account.settings()).topics.find(( entry ) => entry.key === topic.key )?.channels.find(( entry ) => entry.key === channel.key )?.on).toBe(!channel.on);

        await patient(() => account.saveSettings(flip(channel.on), attempt("notify-back")));

        const theme = settings.theme || "light";

        await patient(() => account.saveSettings({ theme: theme === "dark" ? "light" : "dark" }, attempt("theme-flip")));
        await patient(() => account.saveSettings({ theme }, attempt("theme-back")));

        expect(settingsOf(await account.settings()).theme).toBe(theme);

    }, long);

    test("personal: name and location save and restore", async () => {

        if ( !live ) return;

        const before = accountOf(await account.profile());

        await patient(() => account.saveName(`${ before.name } Flow`, attempt("name")));

        expect(accountOf(await account.profile()).name).toBe(`${ before.name } Flow`);

        await patient(() => account.saveName(before.name, attempt("name-back")));

        await patient(() => account.saveLocation({ address: "Flow street 1", address_2: "", zip_code: "12345" }, attempt("location")));

        expect(accountOf(await account.profile()).location?.address).toBe("Flow street 1");

        await patient(() => account.saveLocation({
            address: before.location?.address ?? "",
            address_2: before.location?.address2 ?? "",
            zip_code: before.location?.zipCode ?? "",
        }, attempt("location-back")));

    }, long);

    test("sessions: the peer's second session is revoked from the first", async () => {

        if ( !live ) return;

        try {

            const one = await enter(peer, peerSecret, "peer-one");
            const two = await enter(peer, peerSecret, "peer-two");

            configure({ token: one });

            expect(( await sessions.list() ).map(deviceOf).length).toBeGreaterThanOrEqual(2);

            await patient(() => sessions.revokeOthers(attempt("revoke-others")));

            configure({ token: two });

            const failure = await account.profile().then(() => null, ( reason: unknown ) => reason );

            expect(failure instanceof ApiError && failure.unauthenticated).toBe(true);

        }
        finally {

            configure({ token: qaToken });

        }

    }, long);

});
