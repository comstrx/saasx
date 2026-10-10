import { ApiError, configure } from "@/api/client";
import { auth } from "@/api/endpoints/auth";
import { catalogs, detail, favorites } from "@/api/endpoints/catalogs";
import { categories } from "@/api/endpoints/categories";
import { contract } from "@/api/endpoints/contract";
import { orders } from "@/api/endpoints/orders";
import { search } from "@/api/endpoints/search";
import { challenged } from "@/model/auth";
import { availabilityFrom, availabilityHorizon, comingDays, spanOpen } from "@/model/availability";
import { isRootCatalogType, type Listing, listingsOf, savedOf } from "@/model/catalog";
import { categoryOf } from "@/model/category";
import { type Applicant, orderBody } from "@/model/checkout";
import { type Contract, contractOf } from "@/model/contract";
import { type DetailFace, detailOf, faceOf } from "@/model/detail";
import { quoteOf } from "@/model/order";
import { needsFrom, rangedFrom } from "@/model/requirement";
import { hintOf, initialSearchQuery, type SearchQuery, searchPageOf, searchSorts, searchTerms, supportedFor } from "@/model/search";
import { addIsoDays, todayIso } from "@/std/date-range";
import type { Identified } from "@/std/identity";

const baseUrl = process.env.LIVE_API_URL ?? "http://localhost:8000/v1";
const tenant = process.env.LIVE_TENANT ?? "dev.localhost";
const password = process.env.LIVE_PASSWORD ?? "";
const otp = process.env.LIVE_OTP ?? "11111";
const qa: Identified = { kind: "email", value: process.env.LIVE_EMAIL ?? "" };

const stamp = Date.now().toString(36);
const minute = 61000;
const long = 300000;

const attempt = ( name: string ) => `browse-${ name }-${ stamp }`;

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

const reachable = async (): Promise<boolean> => {

    if ( !password || !qa.value ) return false;

    try {

        return ( await fetch(`${ baseUrl }/contract`) ).ok;

    }
    catch {

        return false;

    }

};

const results = async ( query: SearchQuery, page = 1 ) => searchPageOf(await search.results(searchTerms(query, page)));

const traveller: Applicant = { key: "applicant-1", name: "Flow Traveller", birth: "1990-01-01" };

const quoteFace = async ( deal: Contract, id: number, name: string ): Promise<{ face: DetailFace; refusal: string | null }> => {

    const found = detailOf(await detail.show(id, { adults: 1, children: 0 }));
    const needs = needsFrom(deal.requirements, found.capabilities);
    const nights = rangedFrom(deal.requirements, found.capabilities) ? Math.max(2, found.minStay ?? 0) : 0;
    const open = needs.includes("dates") ? availabilityFrom(await detail.availability(found.id, todayIso(), addIsoDays(todayIso(), availabilityHorizon))) : null;
    const start = ( open ? comingDays(open).map(( day ) => day.iso ).find(( iso ) => iso > todayIso() && spanOpen(open, iso, nights ? addIsoDays(iso, nights) : null) ) : null ) ?? addIsoDays(todayIso(), 20);

    const basket = {
        catalog: found.id,
        sellable: found.sellables[0]?.id,
        quantity: Math.max(1, found.minQuantity ?? 1),
        startsAt: needs.includes("dates") ? start : "",
        endsAt: needs.includes("dates") && nights ? addIsoDays(start, nights) : "",
        adults: needs.includes("guests") ? 1 : 0,
        children: 0,
        infants: 0,
        pets: 0,
        applicants: needs.includes("applicants") ? [ traveller ] : undefined,
    };

    const answer = await patient(() => orders.preview(orderBody(basket), attempt(`quote-${ name }-${ id }`))).then(quoteOf, ( failure: unknown ) => {

        if ( failure instanceof ApiError ) return failure;

        throw failure;

    });

    if ( answer instanceof ApiError ) return { face: faceOf(found), refusal: `${ name }#${ id }: ${ answer.reason || answer.code } ${ JSON.stringify(answer.fields) }` };

    expect(answer.token.length).toBeGreaterThan(0);

    return { face: faceOf(found), refusal: null };

};

let live = false;

describe("live flows · browse", () => {

    beforeAll(async () => {

        live = await reachable();

        configure({ baseUrl, tenant, locale: "en", currency: "USD", token: null, onExpire: null });

        if ( !live ) return;

        const outcome = await patient(() => auth.login(qa, password, attempt("login")));
        const token = challenged(outcome)
            ? ( await patient(() => auth.verifyOtp({ challenge_token: outcome.challenge_token, otp }, attempt("otp"))) ).token
            : outcome.token;

        configure({ token });

    }, long);

    test("search walks every supported sort, pages, narrows by type and price, and answers hints", async () => {

        if ( !live ) return;

        const first = await results(initialSearchQuery());

        expect(first.items.length).toBeGreaterThan(0);

        const sorts = searchSorts.filter(( sort ) => sort !== "nearest" && first.supports.sorts.includes(sort) );

        for ( const sort of sorts ) {

            const sorted = await results({ ...initialSearchQuery(), sort });

            expect(sorted.items.length).toBeGreaterThan(0);

        }

        if ( first.pages > 1 ) {

            const second = await results(initialSearchQuery(), 2);
            const seen = new Set(first.items.map(( item ) => item.id ));

            expect(second.items.some(( item ) => !seen.has(item.id) )).toBe(true);

        }

        const type = first.facets.types[0]?.key;

        if ( type ) {

            const narrowed = await results({ ...initialSearchQuery(), filters: { ...initialSearchQuery().filters, types: [ type ] } });

            expect(narrowed.items.every(( item ) => item.type === type )).toBe(true);

        }

        const ceiling = Math.max(1, Math.round(( first.facets.price.min + first.facets.price.max ) / 2));
        const cheap = await results({ ...initialSearchQuery(), filters: { ...initialSearchQuery().filters, maxPrice: ceiling } });

        expect(cheap.items.every(( item ) => !item.price || item.price.amount <= ceiling * 1.01 )).toBe(true);

        const needle = first.items[0]?.name.slice(0, 3) ?? "";

        if ( needle.length > 1 ) ( await search.suggest(needle) ).map(hintOf);

    }, long);

    test("every filter the server supports answers, and the checkable ones hold", async () => {

        if ( !live ) return;

        const base = initialSearchQuery();
        const first = await results(base);
        const stocked = ( await categories.list(20) ).map(categoryOf).find(( row ) => row.catalogs > 0 );
        const lodging = { ...base, filters: { ...base.filters, types: [ "hotel" ] } };
        const narrowed = ( query: SearchQuery, patch: Partial<SearchQuery["filters"]> ): SearchQuery => ({ ...query, filters: { ...query.filters, ...patch } });
        const always = () => true;

        const cases: readonly ( readonly [ string, SearchQuery, ( item: Listing ) => boolean ] )[] = [
            [ "min_rating", narrowed(base, { rating: 3 }), ( item ) => item.rating >= 3 ],
            [ "min_stars", narrowed(lodging, { stars: 3 }), always ],
            [ "min_nights", narrowed(lodging, { nights: 1 }), always ],
            [ "max_duration", narrowed(base, { duration: 5 }), always ],
            [ "in_stock", narrowed(base, { inStock: true }), ( item ) => item.stock === null || item.stock > 0 ],
            [ "featured", narrowed(base, { featured: true }), always ],
            [ "subtype", narrowed(base, { subtypes: first.facets.subtypes.slice(0, 1).map(( option ) => option.key ) }), always ],
            [ "category", narrowed(base, { category: stocked?.id ?? null }), always ],
        ];

        for ( const [ name, query, holds ] of cases ) {

            if ( !supportedFor(first.supports, [], name) ) continue;

            expect(( await results(query) ).items.every(holds)).toBe(true);

        }

        const stay = { ...lodging, checkin: addIsoDays(todayIso(), 20), checkout: addIsoDays(todayIso(), 22), adults: 2, rooms: 1 };

        const stayed = ( await results(stay) ).items;

        expect(stayed.length).toBeGreaterThan(0);
        expect(stayed.every(( item ) => item.type === "hotel" )).toBe(true);

    }, long);

    test("the map searches inside the results' own box", async () => {

        if ( !live ) return;

        const first = await results(initialSearchQuery());

        expect(first.bounds).not.toBeNull();

        const boxed = await results({ ...initialSearchQuery(), bounds: first.bounds });

        expect(boxed.items.length).toBeGreaterThan(0);

    }, long);

    test("categories open and list their catalogs", async () => {

        if ( !live ) return;

        const rows = ( await categories.list(20) ).map(categoryOf);
        const stocked = rows.find(( row ) => row.catalogs > 0 );

        if ( !stocked ) throw new Error("no category holds a catalog");

        expect(categoryOf(await categories.show(stocked.id)).id).toBe(stocked.id);
        expect(listingsOf(await categories.catalogs(stocked.id, 5)).length).toBeGreaterThan(0);

    }, long);

    test("every root type opens on its own face and quotes from its own deck", async () => {

        if ( !live ) return;

        const deal = contractOf(await contract.read());
        const faces = new Set<DetailFace>();
        const refused: string[] = [];

        for ( const entry of deal.types.filter(( item ) => isRootCatalogType(item.capabilities) ) ) {

            const tries = listingsOf(await catalogs.list({ type: entry.key, limit: 5 }));
            const misses: string[] = [];

            for ( const listing of tries ) {

                const tried = await quoteFace(deal, listing.id, entry.key);

                faces.add(tried.face);

                if ( !tried.refusal ) break;

                misses.push(tried.refusal);

            }

            if ( misses.length > 0 ) process.stdout.write(`\n${ entry.key } passed over: ${ misses.join(" · ") }`);
            if ( tries.length > 0 && misses.length === tries.length ) refused.push(...misses);

        }

        process.stdout.write(`\nfaces opened: ${ [ ...faces ].join(", ") }${ refused.length ? `\nrefused: ${ refused.join(" · ") }` : "" }\n`);

        expect(refused).toEqual([]);
        expect(faces.size).toBeGreaterThanOrEqual(6);

    }, long);

    test("a favorite toggles on and off and the list follows", async () => {

        if ( !live ) return;

        const listing = listingsOf(await catalogs.list({ limit: 5 }))[0];

        if ( !listing ) throw new Error("no catalog to favor");

        await patient(() => detail.favorite(listing.id, true, attempt("favor")));

        expect(savedOf(( await favorites.list() ).rows).some(( saved ) => saved.id === listing.id )).toBe(true);

        await patient(() => detail.favorite(listing.id, false, attempt("unfavor")));

        expect(savedOf(( await favorites.list() ).rows).some(( saved ) => saved.id === listing.id )).toBe(false);

    }, long);

});
