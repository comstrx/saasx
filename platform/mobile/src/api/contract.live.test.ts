import { configure } from "@/api/client";
import { account } from "@/api/endpoints/account";
import { auth } from "@/api/endpoints/auth";
import { cart } from "@/api/endpoints/cart";
import { catalogs, detail, favorites } from "@/api/endpoints/catalogs";
import { categories } from "@/api/endpoints/categories";
import { chat } from "@/api/endpoints/chat";
import { content } from "@/api/endpoints/content";
import { contract } from "@/api/endpoints/contract";
import { coupons } from "@/api/endpoints/coupons";
import { notifications } from "@/api/endpoints/notifications";
import { offers } from "@/api/endpoints/offers";
import { orders } from "@/api/endpoints/orders";
import { referrals } from "@/api/endpoints/referrals";
import { search } from "@/api/endpoints/search";
import { sessions } from "@/api/endpoints/sessions";
import { tickets } from "@/api/endpoints/tickets";
import { vendors } from "@/api/endpoints/vendors";
import { vocabulary } from "@/api/endpoints/vocabulary";
import { wallet } from "@/api/endpoints/wallet";
import { identity as brand } from "@/brand/identity";
import { accountOf, settingsOf } from "@/model/account";
import { challenged } from "@/model/auth";
import { availabilityFrom } from "@/model/availability";
import { cartOf } from "@/model/cart";
import { listingsOf, savedOf } from "@/model/catalog";
import { categoryOf } from "@/model/category";
import { roomOf, threadOf } from "@/model/chat";
import { orderBody } from "@/model/checkout";
import { blocksOf, siteOf } from "@/model/content";
import { contractOf } from "@/model/contract";
import { couponEventOf, couponOf } from "@/model/coupon";
import { detailOf, reviewFeedOf, vendorOf } from "@/model/detail";
import { levelOf, rewardOf, tiersOf } from "@/model/level";
import { alertsOf, boardOf } from "@/model/notification";
import { offerOf } from "@/model/offer";
import { orderOf, quoteOf } from "@/model/order";
import { grantOf, invitedOf } from "@/model/referral";
import { hintOf, initialSearchQuery, searchPageOf, searchTerms } from "@/model/search";
import { deviceOf } from "@/model/session";
import { ticketOf } from "@/model/ticket";
import { currenciesOf, localeOf } from "@/model/vocabulary";
import { balanceOf, ledgerOf, railOf, transactionOf } from "@/model/wallet";
import { addIsoDays, todayIso } from "@/std/date-range";

const baseUrl = process.env.LIVE_API_URL ?? "http://localhost:8000/v1";
const tenant = process.env.LIVE_TENANT ?? "dev.localhost";
const identity = { kind: "email" as const, value: process.env.LIVE_EMAIL ?? `mobile@${ brand.site }` };
const password = process.env.LIVE_PASSWORD ?? "";
const otp = process.env.LIVE_OTP ?? "11111";

const blocker = async (): Promise<string> => {

    if ( !password ) return "LIVE_PASSWORD is not set";

    try {

        const response = await fetch(`${ baseUrl }/contract`);

        return response.ok ? "" : `${ baseUrl }/contract answered ${ response.status }`;

    }
    catch {

        return `no server at ${ baseUrl }`;

    }

};

let live = false;
let anyCatalog = 0;
let anyDated = false;
let anyOrder = 0;
let anyRoom = 0;
let anyCategory = 0;

const attempt = ( name: string ) => `live-${ name }-${ process.pid }`;

describe("live contract", () => {

    beforeAll(async () => {

        const blocked = await blocker();

        live = !blocked;

        if ( !live ) {

            process.stdout.write(`\nlive contract skipped: ${ blocked }\n`);

            return;

        }

        configure({ baseUrl, tenant, locale: "en", currency: "USD", token: null });

        const first = await auth.login(identity, password, attempt("login"));

        if ( !challenged(first) ) { configure({ token: first.token }); return; }

        const session = await auth.verifyOtp({ challenge_token: first.challenge_token, otp }, attempt("otp"));

        configure({ token: session.token });

    }, 60000);

    const probe = ( name: string, run: () => Promise<unknown> ) => {

        test(name, async () => {

            if ( !live ) return;

            await expect(run()).resolves.toBeDefined();

        }, 40000);

    };

    probe("contract.read", async () => contractOf(await contract.read()));
    probe("account.profile", async () => accountOf(await account.profile()));
    probe("account.settings", async () => settingsOf(await account.settings()));
    probe("account.level", async () => levelOf(await account.level()) ?? null);
    probe("account.tiers", async () => tiersOf(await account.tiers()));
    probe("account.rewards", async () => ( await account.rewards() ).map(rewardOf));
    probe("wallet.balance", async () => balanceOf(await wallet.balance()));
    probe("wallet.rails", async () => ( await wallet.rails() ).map(railOf));
    probe("wallet.transactions", async () => ( await wallet.transactions(1, 5) ).rows.map(transactionOf));
    probe("wallet.statement", async () => ( await wallet.statement(1, 5) ).rows.map(ledgerOf));
    probe("coupons.available", async () => ( await coupons.available() ).rows.map(( row ) => couponOf(row, false) ));
    probe("coupons.mine", async () => ( await coupons.mine() ).rows.map(( row ) => couponOf(row, true) ));
    probe("coupons.history", async () => ( await coupons.history() ).map(couponEventOf));
    probe("notifications.board", async () => boardOf(await notifications.board([], 1, 5)));
    probe("notifications.stats", async () => alertsOf(await notifications.stats()));
    probe("offers.feed", async () => ( await offers.feed(5) ).map(offerOf));
    probe("referrals.list", async () => ( await referrals.list(1, 5) ).rows.map(invitedOf));
    probe("referrals.programme", async () => ( await referrals.programme() ).map(grantOf));
    probe("vocabulary.locales", async () => ( await vocabulary.locales() ).map(localeOf));
    probe("vocabulary.currencies", async () => currenciesOf(await vocabulary.currencies()));
    probe("sessions.list", async () => ( await sessions.list() ).map(deviceOf));
    probe("tickets.list", async () => ( await tickets.list() ).rows.map(ticketOf));
    probe("content.site", async () => siteOf(await content.site()));
    probe("content.page", async () => blocksOf(await content.page("about")));
    probe("cart.list", async () => cartOf(await cart.list()));
    probe("auth.socialProviders", () => auth.socialProviders());

    test("categories.list", async () => {

        if ( !live ) return;

        const rows = ( await categories.list(20) ).map(categoryOf);

        anyCategory = rows.find(( row ) => row.catalogs > 0 )?.id ?? rows[0]?.id ?? 0;

        expect(Array.isArray(rows)).toBe(true);

    }, 40000);

    test("categories.show", async () => {

        if ( !live || !anyCategory ) return;

        await expect(categories.show(anyCategory).then(categoryOf)).resolves.toBeDefined();

    }, 40000);

    test("categories.catalogs", async () => {

        if ( !live || !anyCategory ) return;

        await expect(categories.catalogs(anyCategory, 5).then(listingsOf)).resolves.toBeDefined();

    }, 40000);

    test("orders.list", async () => {

        if ( !live ) return;

        const rows = ( await orders.page(1, 5) ).rows.map(orderOf);

        anyOrder = rows[0]?.id ?? 0;

        expect(Array.isArray(rows)).toBe(true);

    }, 40000);

    test("orders.show", async () => {

        if ( !live || !anyOrder ) return;

        const found = orderOf(await orders.show(anyOrder));

        expect(found.id).toBe(anyOrder);

    }, 40000);

    probe("favorites.list", async () => savedOf(( await favorites.list() ).rows));
    probe("search.suggest", async () => ( await search.suggest("er") ).map(hintOf));
    probe("search.results", async () => searchPageOf(await search.results(searchTerms(initialSearchQuery(), 1))));

    test("chat.rooms", async () => {

        if ( !live ) return;

        const rows = ( await chat.rooms() ).map(( row ) => roomOf(row) );

        anyRoom = rows[0]?.id ?? 0;

        expect(Array.isArray(rows)).toBe(true);

    }, 40000);

    test("chat.room + messages", async () => {

        if ( !live || !anyRoom ) return;

        await expect(chat.room(anyRoom).then(( row ) => roomOf(row) )).resolves.toBeDefined();
        await expect(chat.messages(anyRoom, 1, 20).then(( answer ) => threadOf(answer.rows, 0) )).resolves.toBeDefined();

    }, 40000);

    test("catalogs.list", async () => {

        if ( !live ) return;

        const rows = listingsOf(await catalogs.list({ limit: 40 }));

        expect(Array.isArray(rows)).toBe(true);

        const quotable = rows.find(( row ) => !row.capabilities.includes("underwritten") && row.price !== null && row.price.amount > 0 ) ?? rows[0];

        anyCatalog = quotable?.id ?? 0;
        anyDated = quotable?.capabilities.includes("has_availability") ?? false;

    }, 40000);

    test("detail.show", async () => {

        if ( !live || !anyCatalog ) return;

        const found = detailOf(await detail.show(anyCatalog, { adults: 1, children: 0 }));

        expect(found.id).toBe(anyCatalog);

        if ( !found.host ) return;

        const host = vendorOf(await vendors.show(found.host.id));

        expect(host.id).toBe(found.host.id);

    }, 40000);

    test("detail.availability", async () => {

        if ( !live || !anyCatalog ) return;

        const open = availabilityFrom(await detail.availability(anyCatalog, todayIso(), addIsoDays(todayIso(), 10)));

        expect(open.days.size).toBeGreaterThan(0);

    }, 40000);

    test("detail.reviews", async () => {

        if ( !live || !anyCatalog ) return;

        await expect(detail.reviews(anyCatalog).then(reviewFeedOf)).resolves.toBeDefined();

    }, 40000);

    test("orders.preview", async () => {

        if ( !live || !anyCatalog ) return;

        const span = anyDated ? { startsAt: addIsoDays(todayIso(), 14), endsAt: addIsoDays(todayIso(), 19) } : { startsAt: "", endsAt: "" };

        const quote = quoteOf(await orders.preview(orderBody({
            catalog: anyCatalog,
            quantity: 1,
            ...span,
            adults: 1,
            children: 0,
            infants: 0,
            pets: 0,
            coupon: "",
        }), attempt("preview")));

        expect(quote.token.length).toBeGreaterThan(0);
        expect(quote.total).toBeGreaterThan(0);

    }, 40000);

});
