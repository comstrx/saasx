import { media, picture } from "@/api/client";
import { cash, numeric, oneOf, type Supports } from "@/api/contracts";
import type { DetailRow, ReviewPage, ReviewRow } from "@/api/endpoints/catalogs";
import type { VendorRow } from "@/api/endpoints/vendors";
import { clockOf, type Money, type Picture, pictured, pinned, placeOf, stays } from "@/model/catalog";
import { stampOf } from "@/std/number";
import { acclaimed } from "@/std/rating";

type Capability =
    | "bookable" | "purchasable" | "schedulable" | "stockable" | "deliverable" | "digital_deliverable"
    | "perishable" | "processable" | "underwritten" | "transport" | "has_children" | "has_parent"
    | "has_availability" | "has_location" | "provider_backed" | "lodging";

export type Shot = {
    id: string;
    picture: Picture;
};

export type Trait = {
    key: string;
    label: string;
    value: string;
    text: string;
    group?: string | undefined;
    icon?: string | undefined;
    sort?: number | undefined;
    included?: boolean | undefined;
};

export type Sellable = {
    id: number;
    name: string;
    sku: string;
    price: Money | null;
    stock: number | null;
    adults: number;
    children: number;
    fits: boolean;
    soldOut: boolean;
    facts: readonly { key: string; value: string }[];
};

export type Extra = {
    id: number;
    name: string;
    price: Money | null;
};

type Leg = {
    name: string;
    coordinates: { latitude: number; longitude: number } | null;
};

export type Spot = {
    id: number;
    name: string;
    note: string;
    kind: string;
    at: { latitude: number; longitude: number } | null;
};

export type Faq = {
    key: string;
    question: string;
    answer: string;
    sort: number;
};

export type Policy = {
    id: number;
    key: string;
    type: string;
    group: string;
    title: string;
    description: string;
    refundable: boolean;
    freeBeforeHours: number;
    penaltyPercent: number;
};

export type Host = {
    id: number;
    name: string;
    image: string | null;
    verified: boolean;
    rating: number;
    reviews: number;
    catalogs: number;
    memberSince: string | null;
    responseRate: number;
    responseTime: string;
};

export type Promotion = {
    rate: number;
    discount: Money | null;
    endsAt: string | null;
};

export type ReviewSort = "newest" | "highest_rated" | "lowest_rated" | "oldest";

const reviewSorts: readonly ReviewSort[] = [ "newest", "highest_rated", "lowest_rated", "oldest" ];

export const marked = ( price: Money | null, offer: Promotion | null ): Money | null => {

    if ( !price || !offer || offer.rate <= 0 || offer.rate >= 100 ) return null;

    return { ...price, amount: price.amount * ( 1 - offer.rate / 100 ) };

};

export const sortsIn = ( supports: Supports | undefined ): readonly ReviewSort[] => {

    const served = supports?.sorts ?? [];

    return served.length === 0 ? reviewSorts : reviewSorts.filter(( sort ) => served.includes(sort) );

};

export type Review = {
    id: number;
    title: string;
    content: string;
    rating: number;
    date: string | null;
    author: {
        id: number;
        name: string;
        image: string | null;
    };
};

export type Detail = {
    id: number;
    name: string;
    slug: string;
    type: string;
    subtype: string;
    category: { id: number; name: string } | null;
    capabilities: readonly Capability[];
    description: string;
    instructions: string;
    place: string;
    address: string;
    coordinates: { latitude: number; longitude: number } | null;
    shots: readonly Shot[];
    price: Money | null;
    unit: string | null;
    total: Money | null;
    rating: number;
    reviews: number;
    orders: number;
    views: number;
    sku: string;
    favorite: boolean;
    carted: boolean;
    closed: boolean;
    stock: number | null;
    delivery: string;
    digital: boolean;
    capacity: number;
    minQuantity: number;
    maxQuantity: number;
    duration: number;
    durationUnit: string;
    checkin: string;
    checkout: string;
    adults: number;
    children: number;
    minStay: number;
    maxStay: number;
    startsAt: string | null;
    endsAt: string | null;
    offer: Promotion | null;
    payLater: boolean;
    transportMode: string;
    features: readonly Trait[];
    facts: readonly Trait[];
    rules: readonly Trait[];
    policies: readonly Policy[];
    origin: Leg | null;
    destination: Leg | null;
    host: Host | null;
    sellables: readonly Sellable[];
    extras: readonly Extra[];
    spots: readonly Spot[];
    faqs: readonly Faq[];
};

export const vendorOf = ( row: VendorRow ): Host => {

    const response = oneOf(row.response);

    return {
        id: row.id,
        name: row.name ?? "",
        image: media(row.image),
        verified: Boolean(row.verified),
        rating: numeric(row.rating),
        reviews: row.reviews ?? 0,
        catalogs: row.catalogs ?? 0,
        memberSince: row.member_since ?? null,
        responseRate: numeric(response?.rate),
        responseTime: "",
    };

};

export const can = ( detail: Detail | undefined, capability: Capability ): boolean =>
    Boolean(detail?.capabilities.includes(capability));

const paperGroup = "documents";
const noticeGroup = "before";
const partGroup = "included";

type FactParts = {
    specs: readonly Trait[];
    papers: readonly Trait[];
    notices: readonly Trait[];
    included: readonly Trait[];
};

const aside = new Set([ paperGroup, noticeGroup, partGroup ]);

export const factsOf = ( detail: Detail | undefined ): FactParts => {

    const rows = detail?.facts ?? [];

    return {
        specs: rows.filter(( row ) => !aside.has(row.group ?? "") ),
        papers: rows.filter(( row ) => row.group === paperGroup ),
        notices: rows.filter(( row ) => row.group === noticeGroup ),
        included: rows.filter(( row ) => row.group === partGroup ),
    };

};

export type TraitGroup = {
    group: string;
    items: readonly Trait[];
};

const gathered = ( rows: readonly Trait[] ): readonly TraitGroup[] => {

    const order: string[] = [];
    const book = new Map<string, Trait[]>();

    for ( const row of rows ) {

        const group = row.group || "other";

        if ( !book.has(group) ) { order.push(group); book.set(group, []); }

        book.get(group)?.push(row);

    }

    return order.map(( group ) => ({ group, items: book.get(group) ?? [] }) );

};

export const featureGroupsOf = ( detail: Detail | undefined, skip: readonly string[] = [] ): readonly TraitGroup[] =>
    gathered(( detail?.features ?? [] ).filter(( row ) => !skip.includes(row.key) ));

export const stockOf = ( detail: Detail, picked: number | null ): number | null => {

    const seat = detail.sellables.find(( row ) => row.id === picked );

    return seat?.stock && seat.stock > 0 ? seat.stock : detail.stock;

};

export const soldOut = ( detail: Detail, picked: number | null ): boolean => {

    const left = stockOf(detail, picked);

    return can(detail, "stockable") && left !== null && left <= 0;

};

export const staying = ( detail: Detail | undefined ): boolean =>
    Boolean(detail) && stays(detail?.capabilities ?? [], detail?.unit, detail?.minStay ?? 0, Boolean(detail?.checkin || detail?.checkout));

export const seating = ( detail: Detail | undefined ): boolean =>
    staying(detail) || ( detail?.adults ?? 0 ) > 0 || ( detail?.children ?? 0 ) > 0;

export type Voice = "stay" | "item";

export const voiceOf = ( detail: Detail | undefined ): Voice =>
    staying(detail) ? "stay" : "item";

export type DetailFace = "hotel" | "place" | "route" | "goods" | "visa" | "cover" | "stage" | "outing" | "service";

export const faceOf = ( detail: Detail | undefined ): DetailFace => {

    if ( can(detail, "transport") ) return "route";
    if ( can(detail, "underwritten") ) return "cover";
    if ( can(detail, "processable") ) return "visa";
    if ( can(detail, "purchasable") || can(detail, "stockable") ) return "goods";

    if ( staying(detail) ) return can(detail, "has_children") || ( detail?.sellables.length ?? 0 ) > 0 ? "hotel" : "place";

    if ( can(detail, "perishable") || ( can(detail, "has_availability") && can(detail, "has_location") ) ) return "stage";
    if ( can(detail, "schedulable") && can(detail, "has_location") ) return "outing";

    return "service";

};

export type DetailShape = "route" | "document" | "goods" | "stage" | "outing" | "session" | "stay";

export const shapeOf = ( detail: Detail | undefined ): DetailShape => {

    if ( can(detail, "transport") ) return "route";
    if ( can(detail, "underwritten") || can(detail, "processable") ) return "document";
    if ( can(detail, "purchasable") || can(detail, "stockable") ) return "goods";
    if ( staying(detail) ) return "stay";
    if ( can(detail, "perishable") || ( can(detail, "has_availability") && can(detail, "has_location") ) ) return "stage";
    if ( can(detail, "schedulable") && can(detail, "has_location") ) return "outing";

    return "session";

};

export const policyOf = ( detail: Detail | undefined, type: string ): Policy | undefined =>
    detail?.policies.find(( policy ) => policy.type === type || policy.key === type );

export const refundable = ( detail: Detail | undefined ): boolean => {

    const policy = policyOf(detail, "cancellation");

    return Boolean(policy?.refundable) || ( policy?.freeBeforeHours ?? 0 ) > 0;

};

export type Terms = {
    refundable: boolean;
    hours: number;
    penalty: number;
};

export const termsOf = ( detail: Detail | undefined ): Terms | null => {

    const policy = policyOf(detail, "cancellation");

    if ( !policy ) return null;

    return {
        refundable: policy.refundable && policy.penaltyPercent < 100,
        hours: policy.freeBeforeHours,
        penalty: policy.penaltyPercent,
    };

};

const epochDay = ( stamp: number ): number => Math.floor(stamp / 86_400_000);

export const daysAway = ( iso: string | null | undefined, now = Date.now() ): number => {

    if ( !iso ) return 0;

    const at = stampOf(iso);

    return at ? epochDay(at.getTime()) - epochDay(now) : 0;

};

export const expired = ( detail: Detail | undefined ): boolean => {

    if ( detail?.closed ) return true;

    const opening = detail?.startsAt ?? detail?.endsAt;

    return Boolean(opening) && daysAway(opening) < 0;

};

export const personal = ( detail: Detail | undefined ): boolean =>
    can(detail, "underwritten") || can(detail, "processable");

export const sellable = ( detail: Detail | undefined ): boolean =>
    can(detail, "bookable") || can(detail, "purchasable");

export const favoured = ( detail: Detail | undefined ): boolean =>
    acclaimed(detail?.rating ?? 0, detail?.reviews ?? 0);

export type DetailPart =
    | "deck"
    | "availability"
    | "about"
    | "included"
    | "specs"
    | "amenities"
    | "options"
    | "documents"
    | "notices"
    | "location"
    | "nearby"
    | "host"
    | "reviews"
    | "faqs"
    | "policies";

const orders: Record<DetailFace, readonly DetailPart[]> = {
    hotel: [ "deck", "availability", "about", "reviews", "location", "nearby", "included", "notices", "documents", "host", "faqs", "policies" ],
    place: [ "deck", "availability", "about", "amenities", "options", "included", "reviews", "location", "nearby", "host", "notices", "documents", "faqs", "policies" ],
    visa: [ "deck", "documents", "notices", "about", "included", "faqs", "reviews", "host", "policies" ],
    cover: [ "deck", "included", "notices", "documents", "about", "faqs", "reviews", "policies" ],
    goods: [ "deck", "about", "amenities", "included", "documents", "notices", "reviews", "faqs", "policies" ],
    stage: [ "deck", "availability", "about", "amenities", "included", "location", "specs", "notices", "documents", "reviews", "faqs", "policies" ],
    route: [ "deck", "availability", "included", "about", "specs", "location", "notices", "documents", "reviews", "faqs", "policies" ],
    outing: [ "deck", "availability", "about", "included", "amenities", "options", "specs", "location", "host", "notices", "documents", "reviews", "faqs", "policies" ],
    service: [ "deck", "availability", "about", "included", "amenities", "specs", "options", "host", "notices", "documents", "reviews", "faqs", "policies" ],
};

export const sectionsOf = ( detail: Detail | undefined ): readonly DetailPart[] => orders[faceOf(detail)];

const consumed: Record<DetailFace, readonly string[]> = {
    hotel: [],
    place: [ "beds", "bathrooms", "area", "floor" ],
    route: [],
    goods: [ "condition" ],
    visa: [],
    cover: [],
    stage: [ "section" ],
    outing: [ "guided", "pickup_included", "languages" ],
    service: [ "experience_level" ],
};

export const consumedOf = ( detail: Detail | undefined ): readonly string[] => consumed[faceOf(detail)];

const worded = ( rows: DetailRow["rules"], group?: string ): readonly Trait[] => ( rows ?? [] )
    .map(( row, slot ) => ({
        key: row.key ?? String(slot),
        label: row.label || row.name || "",
        value: row.value === null || row.value === undefined ? "" : String(row.value),
        text: row.value_label === null || row.value_label === undefined ? "" : String(row.value_label),
        group: row.group ?? group,
        icon: row.icon ?? "",
        sort: Number(row.sort ?? slot),
        included: row.included ?? true,
    }))
    .filter(( trait ) => trait.label.length > 0 );

const flatten = ( groups: DetailRow["features"] ): readonly Trait[] => {

    if ( !groups ) return [];

    const rows = Array.isArray(groups)
        ? worded(groups)
        : Object.entries(groups).flatMap(([ group, held ]) => worded(held, group) );

    return [ ...rows ].sort(( first, second ) => ( first.sort ?? 0 ) - ( second.sort ?? 0 ) );

};

const framed = ( entry: DetailRow ): readonly Shot[] => {

    const cover = picture(entry.image, oneOf(entry.image_variants));

    const files = ( entry.attachments ?? [] )
        .flatMap(( file, slot ): Shot[] => {

            const held = pictured(file);

            return file.type === "image" && held && held.uri !== cover?.uri ? [ { id: `shot-${ slot }`, picture: held } ] : [];

        });

    return cover ? [ { id: "shot-cover", picture: cover }, ...files ] : files;

};

const escaped = ( text: string ): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const variantName = ( name: string, parent: string ): string =>
    parent ? name.replace(new RegExp(`^${ escaped(parent) }\\s*[—–-]\\s*`), "") || name : name;

const legOf = ( leg: DetailRow["origin"] ): Leg | null => {

    const name = placeOf(leg?.city?.name ?? leg?.geo?.name, leg?.country?.name);

    if ( !name ) return null;

    return { name, coordinates: pinned(leg) };

};

const hosted = ( value: DetailRow["host"] ): Host | null => value ? ({
    id: value.id,
    name: value.name ?? "",
    image: media(value.image),
    verified: Boolean(value.verified),
    rating: Number(value.rating ?? 0),
    reviews: value.reviews ?? 0,
    catalogs: value.catalogs ?? 0,
    memberSince: value.member_since ?? null,
    responseRate: Number(value.response_rate ?? 0),
    responseTime: value.response_time ?? "",
}) : null;

const ruled = ( value: NonNullable<DetailRow["policies"]>[number] ): Policy => ({
    id: value.id,
    key: value.key ?? "",
    type: value.type ?? "",
    group: value.group ?? "",
    title: value.title ?? "",
    description: value.description ?? "",
    refundable: Boolean(value.refundable),
    freeBeforeHours: value.free_before_hours ?? 0,
    penaltyPercent: Number(value.penalty_percent ?? 0),
});

type OfferRow = Exclude<NonNullable<DetailRow["offer"]>, readonly unknown[]>;

const promotionOf = ( value: OfferRow | null ): Promotion | null => {

    const rate = Number(value?.rate ?? 0);

    return value && rate > 0 ? { rate, discount: cash(value.discount), endsAt: value.expires_at ?? null } : null;

};

export const reviewOf = ( row: ReviewRow ): Review => ({
    id: row.id,
    title: row.title ?? "",
    content: row.content ?? "",
    rating: Number(row.rating ?? 0),
    date: row.created_at ?? null,
    author: {
        id: row.user?.id ?? 0,
        name: row.user?.name ?? "",
        image: media(row.user?.image),
    },
});

type ReviewFeed = {
    items: readonly Review[];
    supports: Supports;
    pages: number;
    spread: readonly number[];
};

export const spreadOf = ( counts: Readonly<Record<string, number>> ): readonly number[] => {

    const tally = [ 0, 0, 0, 0, 0 ];

    for ( const [ score, count ] of Object.entries(counts) ) {

        const star = Math.round(Number(score));

        if ( star >= 1 && star <= 5 ) tally[5 - star] = ( tally[5 - star] ?? 0 ) + count;

    }

    return tally;

};

export const reviewFeedOf = ( page: ReviewPage ): ReviewFeed => ({
    items: page.rows.map(reviewOf),
    supports: page.supports,
    pages: page.pages,
    spread: spreadOf(page.spread),
});

export const detailOf = ( entry: DetailRow ): Detail => ({
    id: entry.id,
    name: entry.name,
    slug: entry.slug ?? "",
    type: entry.type ?? "",
    subtype: entry.subtype ?? "",
    category: entry.category ? { id: entry.category.id, name: entry.category.name ?? "" } : null,
    capabilities: ( entry.capabilities ?? [] ) as readonly Capability[],
    description: entry.description ?? "",
    instructions: entry.instructions ?? "",
    place: placeOf(entry.geo?.city?.name ?? entry.geo?.geo?.name, entry.geo?.country?.name),
    address: entry.geo?.address ?? "",
    coordinates: pinned(entry.geo),
    shots: framed(entry),
    price: cash(entry.min_price),
    unit: entry.price_context?.unit ?? null,
    total: cash(entry.total_price),
    rating: Number(entry.rating ?? 0),
    reviews: entry.reviews ?? 0,
    orders: entry.orders ?? 0,
    favorite: Boolean(entry.in_favorites),
    carted: Boolean(entry.in_cart),
    closed: Boolean(entry.sale_closed),
    stock: entry.stock ?? null,
    delivery: entry.delivery ?? "",
    digital: Boolean(entry.digital),
    capacity: entry.capacity ?? 0,
    minQuantity: entry.min_quantity ?? 1,
    maxQuantity: entry.max_quantity ?? 0,
    duration: entry.duration ?? 0,
    durationUnit: entry.duration_unit ?? "",
    checkin: clockOf(entry.checkin_time),
    checkout: clockOf(entry.checkout_time),
    adults: entry.adults ?? 0,
    children: entry.children ?? 0,
    minStay: entry.min_stay ?? 0,
    maxStay: entry.max_stay ?? 0,
    startsAt: entry.starts_at ?? null,
    endsAt: entry.ends_at ?? null,
    offer: promotionOf(oneOf(entry.offer)),
    payLater: Boolean(entry.allow_pay_later),
    transportMode: entry.transport_mode ?? "",
    views: entry.views ?? 0,
    sku: entry.sku ?? "",
    features: flatten(entry.features),
    facts: flatten(entry.details),
    rules: worded(entry.rules),
    policies: ( entry.policies ?? [] ).map(ruled),
    origin: legOf(entry.origin),
    destination: legOf(entry.destination),
    host: hosted(entry.host ?? entry.vendor),
    sellables: ( entry.sellables ?? [] ).map(( row ): Sellable => ({
        id: row.id,
        name: variantName(row.name ?? "", entry.name),
        sku: row.sku ?? "",
        price: cash(row.min_price),
        stock: row.stock ?? null,
        adults: row.adults ?? 0,
        children: row.children ?? 0,
        fits: row.fits !== false,
        soldOut: Boolean(row.sold_out),
        facts: Object.entries(row.features).flatMap(([ key, value ]) => value === null || value === "" ? [] : [ { key, value: String(value) } ] ),
    })),
    extras: ( entry.extras ?? [] ).map(( row ): Extra => ({
        id: row.id,
        name: row.name ?? "",
        price: cash(row.price),
    })),
    spots: ( entry.pois ?? [] ).map(( row ): Spot => ({
        id: row.id,
        name: row.name ?? "",
        note: row.description ?? "",
        kind: row.kind ?? "",
        at: row.latitude && row.longitude ? { latitude: numeric(row.latitude), longitude: numeric(row.longitude) } : null,
    })),
    faqs: ( entry.faqs ?? [] )
        .map(( row, slot ): Faq => ({
            key: row.key || String(slot),
            question: row.question ?? "",
            answer: row.answer ?? "",
            sort: row.sort ?? slot,
        }))
        .filter(( row ) => row.question && row.answer )
        .sort(( a, b ) => a.sort - b.sort ),
});
