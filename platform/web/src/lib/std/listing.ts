import { calendarDate, dateValue, nearPoint } from "./search.ts";

type Query = Readonly<Record<string, string | string[] | undefined>>;
type Change = Readonly<Record<string, string | null | undefined>>;

const nearby = 30;

export const catalogSorts = ["recommended", "relevance", "lowest_price", "highest_price", "highest_rated", "newest"] as const;

export function queryText ( query: Query, key: string ): string | undefined {

    const raw = query[key];
    const value = Array.isArray(raw) ? raw[0] : raw;

    return value?.trim().slice(0, 200) || undefined;

}
export function queryNumber ( query: Query, key: string, min: number, max: number, step = 1 ): number | undefined {

    const raw = queryText(query, key);
    const value = raw ? Number(raw) : Number.NaN;

    return Number.isInteger(value / step) && value >= min && value <= max ? value : undefined;

}
export function queryList ( query: Query, key: string ): string[] {

    const value = queryText(query, key);

    return value ? [...new Set(value.split(",").map(( part ) => part.trim()).filter(Boolean))].slice(0, 20) : [];

}
export function toggled ( list: readonly string[], value: string ): string | null {

    const next = list.includes(value) ? list.filter(( entry ) => entry !== value) : [...list, value];

    return next.length ? next.join(",") : null;

}
export function queryHref ( path: string, query: Query, changes: Change ): string {

    const params = new URLSearchParams();

    for ( const key of Object.keys(query) ) {

        const value = queryText(query, key);

        if ( value && key !== "page" ) params.set(key, value);

    }
    for ( const [key, value] of Object.entries(changes) ) {

        if ( value === undefined ) continue;

        if ( value === null ) params.delete(key);
        else params.set(key, value);

    }

    return params.size ? `${path}?${params}` : path;

}
export function listingInput ( query: Query, type: string, dates: string, limit: number ) {

    const text = queryText(query, "query");
    const selected = queryText(query, "sort");
    const sort = catalogSorts.find(( key ) => key === selected && (key !== "relevance" || text));
    const from = calendarDate(queryText(query, "from") ?? null);
    const to = calendarDate(queryText(query, "to") ?? null);
    const geo = queryNumber(query, "geo", 1, Number.MAX_SAFE_INTEGER);
    const categoryId = queryNumber(query, "category", 1, Number.MAX_SAFE_INTEGER);
    const adults = queryNumber(query, "adults", 1, 30);
    const children = queryNumber(query, "children", 0, 30);
    const rating = queryNumber(query, "rating", 1, 5, .5);
    const stars = queryNumber(query, "stars", 1, 5);
    const near = nearPoint(queryText(query, "near") ?? "");
    const price = ( key: string ) => {

        const value = queryText(query, key);

        return value && /^\d+(?:\.\d{1,6})?$/.test(value) ? value : undefined;

    };

    return {
        limit: Math.max(1, Math.min(60, limit)),
        page: queryNumber(query, "page", 1, 10000) ?? 1,
        sort: sort ?? (text ? "relevance" : "recommended"),
        ...(text ? { query: text } : {}),
        ...(type ? { type } : {}),
        ...(geo ? { geo } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(rating ? { rating } : {}),
        ...(stars ? { stars } : {}),
        ...(near ? { lat: near.lat, lng: near.lng, distance: nearby } : {}),
        ...(price("minPrice") ? { minPrice: price("minPrice") } : {}),
        ...(price("maxPrice") ? { maxPrice: price("maxPrice") } : {}),
        ...(dates === "stay" ? { adults, children } : {}),
        ...(dates === "stay" && from && to && to > from ? { checkin: dateValue(from), checkout: dateValue(to) } : {}),
        ...(dates === "start" && from ? { startsFrom: dateValue(from), startsTo: dateValue(from) } : {}),
    };

}
export function priceEdges ( low: number, high: number, count = 24 ): number[] {

    const start = Math.max(0, Math.floor(low));
    const step = Math.max(1, Math.ceil((Math.max(Math.ceil(high), start + 1) - start) / count));

    return Array.from({ length: count + 1 }, ( _, index ) => start + index * step);

}
export function priceBuckets ( facets: Readonly<Record<string, number>>, edges: readonly number[] ): number[] {

    const counts = edges.slice(1).map(() => 0);
    const first = edges[0] ?? 0;
    const last = edges[edges.length - 2] ?? first;

    for ( const [key, value] of Object.entries(facets) ) {

        const span = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/.exec(key);
        const lower = key.startsWith("<") ? first : key.startsWith(">") ? last : span ? Number(span[1]) : Number.NaN;
        const index = bucketOf(edges, lower);

        if ( index >= 0 ) counts[index] = (counts[index] ?? 0) + value;

    }

    return counts;

}
export function bucketOf ( edges: readonly number[], value: number ): number {

    return edges.findIndex(( edge, position ) => {

        const next = edges[position + 1];

        return next !== undefined && value >= edge && value < next;

    });

}
