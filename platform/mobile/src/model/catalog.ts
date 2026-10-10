import { picture } from "@/api/client";
import { cash, oneOf } from "@/api/contracts";
import type { AttachmentRow, ListingRow, LocationRow, SavedRow } from "@/api/endpoints/catalogs";
import type { CatalogType } from "@/model/contract";
import { stampOf } from "@/std/number";
import type { Picture } from "@/std/picture";
import { str } from "@/std/str";

export type { Picture, Rung } from "@/std/picture";

export type Money = {
    amount: number;
    currency: string;
};

export type Listing = {
    id: number;
    name: string;
    slug: string;
    type: string;
    capabilities: readonly string[];
    image: Picture | null;
    images: readonly Picture[];
    place: string;
    price: Money | null;
    sale: Money | null;
    unit: string | null;
    latitude: number | null;
    longitude: number | null;
    rating: number;
    reviews: number;
    favorite: boolean;
    carted: boolean;
    closed: boolean;
    stock: number | null;
    fresh: boolean;
    summary: string;
    duration: number;
    durationUnit: string;
    capacity: number;
    digital: boolean;
    orders: number;
    checkin: string;
    minStay: number;
};

export const stays = ( capabilities: readonly string[], unit: string | null | undefined, minStay: number, clocked: boolean ): boolean =>
    capabilities.includes("lodging") || ( capabilities.includes("has_availability") && ( unit === "night" || minStay > 0 || clocked ) );

type Badge = "fresh" | "loved" | "rated" | null;

const month = 30 * 24 * 60 * 60 * 1000;

const freshly = ( created: string | null | undefined, now: number ): boolean => {

    const stamp = stampOf(created)?.getTime();

    return stamp !== undefined && now - stamp < month;

};

export const unitOf = ( unit?: string | null ): string | null =>
    unit && unit !== "item" ? unit : null;

export const placeOf = ( city?: string | null, country?: string | null ): string =>
    str.listed(city === country ? [ country ] : [ city, country ]);

export const reviewed = ( listing: Listing ): boolean => listing.reviews > 0 || listing.rating > 0;

export const badgeOf = ( listing: Listing ): Badge => {

    if ( listing.rating >= 4.5 && reviewed(listing) ) return "rated";
    if ( listing.fresh ) return "fresh";
    if ( reviewed(listing) ) return "loved";

    return null;

};

export const priced = ( price: Money | null ): price is Money => price !== null && price.amount > 0;

export const isRootCatalogType = ( capabilities: readonly string[] ): boolean => !capabilities.includes("has_parent");

export type Deal = "booking" | "purchase";

export const dealOf = ( capabilities: readonly string[] ): Deal =>
    capabilities.includes("purchasable") && !capabilities.includes("bookable") ? "purchase" : "booking";

const point = ( value: string | number | null | undefined ): number | null =>
    value === null || value === undefined || value === "" ? null : Number(value);

export const pinned = ( geo: LocationRow ): { latitude: number; longitude: number } | null => {

    for ( const source of [ geo, geo?.city, geo?.geo ] ) {

        const latitude = point(source?.latitude);
        const longitude = point(source?.longitude);

        if ( latitude !== null && longitude !== null ) return { latitude, longitude };

    }

    return null;

};

export const pictured = ( file: AttachmentRow ): Picture | null =>
    picture(file.url ?? file.path, oneOf(file.variants));

const shot = ( entry: ListingRow ): Picture | null => {

    const file = ( entry.attachments ?? [] ).find(( held ) => held.type === "image" && Boolean(pictured(held)) );

    return ( file ? pictured(file) : null ) ?? picture(entry.image, oneOf(entry.image_variants));

};

const shots = ( entry: ListingRow, lead: Picture | null ): readonly Picture[] => {

    const served = ( entry.images ?? [] ).map(pictured).filter(( held ): held is Picture => held !== null );

    return served.length > 0 ? served : lead ? [ lead ] : [];

};

export const clockOf = ( value: string | null | undefined ): string => ( value ?? "" ).slice(0, 5);

const listed = ( entry: ListingRow, now: number ): Listing => {

    const spot = pinned(entry.geo);
    const image = shot(entry);

    return {
        id: entry.id,
        name: entry.name,
        slug: entry.slug ?? "",
        type: entry.type,
        capabilities: entry.capabilities ?? [],
        image,
        images: shots(entry, image),
        place: placeOf(entry.geo?.city?.name ?? entry.geo?.geo?.name, entry.geo?.country?.name),
        price: cash(entry.min_price),
        sale: entry.offer ? cash(entry.sale_price) : null,
        unit: entry.price_context?.unit ?? null,
        latitude: spot?.latitude ?? null,
        longitude: spot?.longitude ?? null,
        rating: Number(entry.rating ?? 0),
        reviews: entry.reviews ?? 0,
        favorite: Boolean(entry.in_favorites),
        carted: Boolean(entry.in_cart),
        closed: Boolean(entry.sale_closed),
        stock: entry.stock ?? null,
        fresh: freshly(entry.created_at, now),
        summary: ( entry.description ?? "" ).trim(),
        duration: Number(entry.duration ?? 0),
        durationUnit: entry.duration_unit ?? "",
        capacity: Number(entry.capacity ?? 0),
        digital: Boolean(entry.digital),
        orders: entry.orders ?? 0,
        checkin: clockOf(entry.checkin_time),
        minStay: Number(entry.min_stay ?? 0),
    };

};

export const listingOf = ( entry: ListingRow ): Listing => listed(entry, Date.now());

export const listingsOf = ( entries: readonly ListingRow[] ): readonly Listing[] => {

    const now = Date.now();

    return entries.map(( entry ) => listed(entry, now) );

};

export const savedOf = ( rows: readonly SavedRow[] ): readonly Listing[] => {

    const now = Date.now();

    return rows.flatMap(( entry ) => entry.catalog ? [ { ...listed(entry.catalog, now), favorite: true } ] : [] );

};

export const discoveryTypes = ( available: readonly CatalogType[], counts: Readonly<Record<string, number>> ): string[] => {

    const roots = available.filter(( entry ) => isRootCatalogType(entry.capabilities) );
    const stocked = roots.filter(( entry ) => ( counts[entry.key] ?? 0 ) > 0 );

    return ( stocked.length > 0
        ? [ ...stocked ].sort(( first, second ) => ( counts[second.key] ?? 0 ) - ( counts[first.key] ?? 0 ) )
        : roots ).map(( entry ) => entry.key );

};
