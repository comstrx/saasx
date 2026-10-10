import { ApiError, configure, credentials } from "@/api/client";
import { account } from "@/api/endpoints/account";
import { auth } from "@/api/endpoints/auth";
import { catalogs } from "@/api/endpoints/catalogs";
import { content } from "@/api/endpoints/content";
import { coupons } from "@/api/endpoints/coupons";
import { notifications } from "@/api/endpoints/notifications";
import { orders } from "@/api/endpoints/orders";
import { sessions } from "@/api/endpoints/sessions";
import { tickets } from "@/api/endpoints/tickets";
import { vocabulary } from "@/api/endpoints/vocabulary";
import { wallet } from "@/api/endpoints/wallet";
import { pick } from "@/api/picks.live";
import { identity as brand } from "@/brand/identity";
import { accountOf, settingsOf } from "@/model/account";
import { challenged } from "@/model/auth";
import { listingsOf } from "@/model/catalog";
import { orderBody } from "@/model/checkout";
import { blocksOf } from "@/model/content";
import { couponOf } from "@/model/coupon";
import { wireAmount } from "@/model/currency";
import { personal } from "@/model/detail";
import { boardOf } from "@/model/notification";
import { quoteOf } from "@/model/order";
import { deviceOf } from "@/model/session";
import { ticketOf } from "@/model/ticket";
import { currenciesOf } from "@/model/vocabulary";
import { balanceOf } from "@/model/wallet";
import type { Identified } from "@/std/identity";

const baseUrl = process.env.LIVE_API_URL ?? "http://localhost:8000/v1";
const tenant = process.env.LIVE_TENANT ?? "dev.localhost";
const password = process.env.LIVE_PASSWORD ?? "";
const otp = process.env.LIVE_OTP ?? "11111";
const qa: Identified = { kind: "email", value: process.env.LIVE_EMAIL ?? "" };

const stamp = Date.now().toString(36);
const peer: Identified = { kind: "email", value: `member-${ stamp }@${ brand.site }` };
const peerPhone = `+9665${ String(Date.now() + 104729).slice(-8) }`;
const peerSecret = `Member-${ stamp }-Dd4!`;

const minute = 61000;
const long = 300000;

const attempt = ( name: string ) => `account-${ name }-${ stamp }`;

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

const fresh = async <T>( name: string, task: ( key: string ) => Promise<T>, left = 3 ): Promise<T> => {

    try {

        return await task(attempt(`${ name }-${ left }`));

    }
    catch ( failure ) {

        if ( !( failure instanceof ApiError ) || !failure.throttled || left <= 0 ) throw failure;

        await pause(minute);

        return fresh(name, task, left - 1);

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
let peerToken = "";

const as = async <T>( token: string, task: () => Promise<T> ): Promise<T> => {

    configure({ token });

    try {

        return await task();

    }
    finally {

        configure({ token: qaToken });

    }

};

describe("live flows · account", () => {

    beforeAll(async () => {

        live = await reachable();

        if ( live ) await pause(minute);

        configure({ baseUrl, tenant, locale: "en", currency: "USD", token: null, onExpire: null });

        if ( !live ) return;

        const outcome = await patient(() => auth.register({ name: "Flow Member", email: peer.value, phone: peerPhone, password: peerSecret, password_confirmation: peerSecret }, attempt("peer")));

        peerToken = challenged(outcome)
            ? ( await patient(() => auth.verifyOtp({ challenge_token: outcome.challenge_token, otp }, attempt("peer-otp"))) ).token
            : outcome.token;

        qaToken = await enter(qa, password, "qa");
        configure({ token: qaToken });

    }, long);

    test("coupons: an affordable offered coupon redeems into mine", async () => {

        if ( !live ) return;

        const owned = new Set(( await coupons.mine() ).rows.map(( row ) => couponOf(row, true).code ));
        const points = balanceOf(await wallet.balance()).points;
        const placed = accountOf(await account.profile()).stats.orders;
        const offered = ( await coupons.available() ).rows.map(( row ) => couponOf(row, false) )
            .find(( coupon ) => coupon.valid && !owned.has(coupon.code) && coupon.points <= points && coupon.minOrders <= placed );

        if ( !offered ) throw new Error(`no claimable coupon is on offer (${ points } points, ${ placed } orders)`);

        await fresh("redeem", ( key ) => coupons.redeem(offered.id, key));

        expect(( await coupons.mine() ).rows.map(( row ) => couponOf(row, true) ).some(( coupon ) => coupon.code === offered.code )).toBe(true);

    }, long);

    test("tickets: a plain ticket opens without an order and closes", async () => {

        if ( !live ) return;

        const ticket = ticketOf(await patient(() => tickets.open({ title: "Flow plain ticket", content: "Opened with no order by the live suite." }, attempt("plain-ticket"))));

        expect(( await tickets.list() ).rows.map(ticketOf).some(( entry ) => entry.id === ticket.id )).toBe(true);

        await patient(() => tickets.move(ticket.id, "close", attempt("plain-close")));

        expect(ticketOf(await tickets.show(ticket.id)).status).not.toBe(ticket.status);

    }, long);

    test("legal pages the app links carry content", async () => {

        if ( !live ) return;

        for ( const page of [ "about", "privacy", "terms" ] ) expect(blocksOf(await content.page(page)).length).toBeGreaterThan(0);

    }, long);

    test("a transfer lands on the peer's board, which filters by kind, reads all, drops one and clears", async () => {

        if ( !live ) return;

        const currency = balanceOf(await wallet.balance()).currency;

        await confirmed("transfer", ( key, code ) => wallet.transfer(peer.value, wireAmount(1, currency), key, code));

        await as(peerToken, async () => {

            const board = boardOf(await notifications.board([], 1, 50));
            const kind = Object.keys(board.kinds)[0];
            const first = board.items[0];

            if ( !kind || !first ) throw new Error("the peer's board is empty");

            expect(boardOf(await notifications.board([ kind ], 1, 50)).items.every(( alert ) => alert.kind === kind )).toBe(true);

            await patient(() => notifications.markAll([], "read", attempt("read-all")));

            expect(boardOf(await notifications.board([], 1, 50)).items.every(( alert ) => alert.read )).toBe(true);

            await patient(() => notifications.drop(first.id, attempt("drop")));

            expect(boardOf(await notifications.board([], 1, 50)).items.some(( alert ) => alert.id === first.id )).toBe(false);

            await patient(() => notifications.dropAll([], attempt("clear")));

            expect(boardOf(await notifications.board([], 1, 50)).items.length).toBe(0);

        });

    }, long);

    test("the peer's language and currency save and restore", async () => {

        if ( !live ) return;

        await as(peerToken, async () => {

            const before = settingsOf(await account.settings());
            const language = before.language === "ar" ? "en" : "ar";

            await patient(() => account.saveSettings({ language }, attempt("language")));

            expect(settingsOf(await account.settings()).language).toBe(language);

            await patient(() => account.saveSettings({ language: before.language || "en" }, attempt("language-back")));

            const currency = currenciesOf(await vocabulary.currencies()).find(( entry ) => entry.code !== before.currency )?.code;

            if ( !currency ) return;

            await patient(() => account.saveSettings({ currency }, attempt("currency")));

            expect(settingsOf(await account.settings()).currency).toBe(currency);

            if ( before.currency ) await patient(() => account.saveSettings({ currency: before.currency }, attempt("currency-back")));

        });

    }, long);

    test("one of the peer's sessions is revoked by id", async () => {

        if ( !live ) return;

        const spare = await enter(peer, peerSecret, "spare");

        await as(peerToken, async () => {

            const other = ( await sessions.list() ).map(deviceOf).find(( device ) => !device.mine );

            if ( !other ) throw new Error("no second session to revoke");

            await patient(() => sessions.revoke(other.id, attempt("revoke-one")));

            expect(( await sessions.list() ).map(deviceOf).some(( device ) => device.id === other.id )).toBe(false);

        });

        expect(spare.length).toBeGreaterThan(0);

    }, long);

    test("the server takes the app's avatar multipart and the image drops", async () => {

        if ( !live ) return;

        const art = listingsOf(await catalogs.list({ limit: 10 })).find(( listing ) => listing.image )?.image?.uri;

        if ( !art ) throw new Error("no catalog image to upload");

        const picture = await ( await fetch(art) ).blob();

        await as(peerToken, async () => {

            const body = new FormData();

            body.append("file", picture, "avatar.jpg");

            const response = await fetch(`${ baseUrl }/account/image`, {
                method: "POST",
                headers: { ...credentials(), "Idempotency-Key": attempt("avatar") },
                body,
            });
            const answer = await response.json() as { status?: boolean; data?: { image?: string | null } };

            expect(answer.status).toBe(true);
            expect(answer.data?.image).toBeTruthy();

            await patient(() => account.dropImage(attempt("avatar-drop")));

            expect(accountOf(await account.profile()).image).toBeNull();

        });

    }, long);

    test("a wallet short of the total is refused by name, and no order is left behind", async () => {

        if ( !live ) return;

        await as(peerToken, async () => {

            const before = ( await orders.page(1, 50) ).rows.length;
            const { basket } = await pick("short", ( found, ranged ) => !ranged && !personal(found) );
            const quote = quoteOf(await patient(() => orders.preview(orderBody(basket), attempt("short-quote"))));
            const refused = await confirmed("short-checkout", ( key, code ) =>
                orders.checkout(orderBody(basket), "wallet", quote.token, null, wireAmount(quote.total, quote.currency), key, code)).then(() => null, ( failure: unknown ) => failure );

            expect(refused).toBeInstanceOf(ApiError);
            expect(refused instanceof ApiError ? refused.reason || refused.code : "").not.toBe("");
            expect(( await orders.page(1, 50) ).rows.length).toBe(before);

        });

    }, long);

    test("the peer changes password, email and phone through their gates, then signs in anew", async () => {

        if ( !live ) return;

        const secret = `${ peerSecret }x`;
        const email = `renamed-${ stamp }@${ brand.site }`;
        const phone = `+9665${ String(Date.now() + 15485863).slice(-8) }`;

        await as(peerToken, async () => {

            await fresh("password", ( key ) => account.savePassword(peerSecret, secret, key));

            const mailed = await fresh("email", ( key ) => account.saveEmail(email, secret, key));

            if ( mailed?.pending ) await fresh("email-code", ( key ) => account.confirmContact("email", otp, key));

            expect(accountOf(await account.profile()).email).toBe(email);

            const dialled = await fresh("phone", ( key ) => account.savePhone(phone, secret, key));

            if ( dialled?.pending ) await fresh("phone-code", ( key ) => account.confirmContact("phone", otp, key));

            expect(accountOf(await account.profile()).phone?.replace(/\D/g, "")).toBe(phone.replace(/\D/g, ""));

        });

        expect(( await enter({ kind: "email", value: email }, secret, "renamed") ).length).toBeGreaterThan(0);

    }, long);

    test("a throwaway member deactivates and a correct sign-in readmits them; another erases and never signs in again", async () => {

        if ( !live ) return;

        for ( const [ closure, readmitted ] of [ [ "deactivate", true ], [ "erase", false ] ] as const ) {

            const leaver: Identified = { kind: "email", value: `${ closure }-${ stamp }@${ brand.site }` };
            const secret = `Leaver-${ stamp }-Dd4!`;
            const phone = `+9665${ String(Date.now() + ( closure === "erase" ? 7919 : 6007 )).slice(-8) }`;
            const outcome = await patient(() => auth.register({ name: "Flow Leaver", email: leaver.value, phone, password: secret, password_confirmation: secret }, attempt(`${ closure }-member`)));
            const token = challenged(outcome)
                ? ( await patient(() => auth.verifyOtp({ challenge_token: outcome.challenge_token, otp }, attempt(`${ closure }-otp`))) ).token
                : outcome.token;

            await as(token, () => confirmed(`${ closure }-close`, ( key, code ) => {

                const proof = code ? { password: secret, confirm_code: code } : { password: secret };

                return closure === "erase" ? account.requestDeletion(proof, key) : account.deactivate(proof, key);

            }));

            const again = await enter(leaver, secret, `${ closure }-again`).then(
                () => "admitted",
                ( failure: unknown ) => failure instanceof ApiError ? `${ failure.status } ${ failure.code } ${ failure.reason }` : String(failure),
            );

            expect({ closure, admitted: again === "admitted", again }).toMatchObject({ closure, admitted: readmitted });

        }

    }, long);

});
