import { oneOf } from "@/api/contracts";
import type { HintRow, SearchPage } from "@/api/endpoints/search";
import { type Listing, listingsOf } from "@/model/catalog";

export type SearchSort =
    | "relevance"
    | "recommended"
    | "newest"
    | "lowest_price"
    | "highest_price"
    | "highest_rated"
    | "highest_reviewed"
    | "highest_ordered"
    | "nearest";

export const searchSorts: readonly SearchSort[] = [
    "relevance",
    "recommended",
    "newest",
    "lowest_price",
    "highest_price",
    "highest_rated",
    "highest_reviewed",
    "highest_ordered",
    "nearest",
];

export type SearchBounds = {
    north: number;
    south: number;
    east: number;
    west: number;
};

export type SearchHint = {
    id: number;
    kind: string;
    label: string;
};

export type SearchFilters = {
    geo: number | null;
    category: number | null;
    minPrice: number;
    maxPrice: number | null;
    types: readonly string[];
    subtypes: readonly string[];
    rating: number | null;
    stars: number | null;
    nights: number | null;
    duration: number | null;
    inStock: boolean;
    featured: boolean;
};

export type SearchSupports = {
    filters: readonly string[];
    sorts: readonly string[];
    facets: readonly string[];
};

export const emptySupports: SearchSupports = { filters: [], sorts: [], facets: [] };

const supported = ( supports: SearchSupports, name: string ): boolean =>
    supports.filters.length === 0 || supports.filters.includes(name);

const needs: Readonly<Record<string, string>> = {
    min_stars: "lodging",
    min_nights: "lodging",
    max_duration: "has_availability",
    in_stock: "stockable",
};

export const supportedFor = ( supports: SearchSupports, capabilities: readonly string[], name: string ): boolean => {

    if ( !supported(supports, name) ) return false;

    const wanted = needs[name];

    return !wanted || capabilities.length === 0 || capabilities.includes(wanted);

};

export const lodges = ( capabilities: readonly string[] ): boolean => capabilities.includes("lodging");

export type SearchQuery = {
    term: string;
    destination: string;
    checkin: string;
    checkout: string;
    adults: number;
    children: number;
    rooms: number;
    sort: SearchSort | null;
    filters: SearchFilters;
    bounds: SearchBounds | null;
};

export type SearchParty = Pick<SearchQuery, "adults" | "children" | "rooms">;

type SearchFacetOption = {
    key: string;
    count: number;
};

export type SearchFacets = {
    price: {
        min: number;
        max: number;
    };
    types: readonly SearchFacetOption[];
    subtypes: readonly SearchFacetOption[];
};

type SearchResponse = {
    items: readonly Listing[];
    total: number;
    page: number;
    pages: number;
    facets: SearchFacets;
    bounds: SearchBounds | null;
    supports: SearchSupports;
};

const searchPageSize = 20;

export const initialSearchFilters = (): SearchFilters => ({
    geo: null,
    category: null,
    minPrice: 0,
    maxPrice: null,
    types: [],
    subtypes: [],
    rating: null,
    stars: null,
    nights: null,
    duration: null,
    inStock: false,
    featured: false,
});

export const initialSearchQuery = (): SearchQuery => ({
    term: "",
    destination: "",
    checkin: "",
    checkout: "",
    adults: 2,
    children: 0,
    rooms: 1,
    sort: null,
    filters: initialSearchFilters(),
    bounds: null,
});

export type SearchSeed = {
    type?: string | undefined;
    geo?: string | undefined;
    category?: string | undefined;
    place?: string | undefined;
    term?: string | undefined;
    checkin?: string | undefined;
    checkout?: string | undefined;
    adults?: string | undefined;
    children?: string | undefined;
    rooms?: string | undefined;
};

const countOf = ( value: string | undefined, floor: number, fallback: number ): number => {

    const parsed = Number(value);

    return value && Number.isInteger(parsed) && parsed >= floor ? parsed : fallback;

};

const idOf = ( value: string | undefined ): number | null => {

    const parsed = Number(value);

    return value && Number.isInteger(parsed) && parsed > 0 ? parsed : null;

};

export const searchOf = ( seed: SearchSeed ): SearchQuery => {

    const base = initialSearchQuery();
    const geo = idOf(seed.geo);
    const category = idOf(seed.category);
    const ranged = Boolean(seed.checkin && seed.checkout);

    return {
        ...base,
        term: seed.term ?? "",
        destination: geo || category ? seed.place ?? "" : "",
        checkin: ranged ? seed.checkin ?? "" : "",
        checkout: ranged ? seed.checkout ?? "" : "",
        adults: countOf(seed.adults, 1, base.adults),
        children: countOf(seed.children, 0, base.children),
        rooms: countOf(seed.rooms, 1, base.rooms),
        filters: { ...base.filters, geo, category, types: seed.type ? [ seed.type ] : [] },
    };

};

type SeedInput = {
    type: string | null;
    place: SearchHint | null;
    term: string;
    checkin: string | null;
    checkout: string | null;
    party: SearchParty;
};

export const seedOf = ({ type, place, term, checkin, checkout, party }: SeedInput ): Record<string, string> => ({
    ...( type ? { type } : {} ),
    ...( place?.kind === "geo" ? { geo: String(place.id), place: place.label } : {} ),
    ...( place?.kind === "category" ? { category: String(place.id), place: place.label } : {} ),
    ...( !place && term.trim() ? { term: term.trim() } : {} ),
    ...( checkin && checkout ? { checkin, checkout } : {} ),
    adults: String(party.adults),
    children: String(party.children),
    rooms: String(party.rooms),
});

const paddedBounds = ( bounds: SearchBounds, margin = 0.18 ): SearchBounds => {

    const height = Math.max(0.01, bounds.north - bounds.south);
    const width = Math.max(0.01, bounds.east - bounds.west);

    return {
        north: bounds.north + height * margin,
        south: bounds.south - height * margin,
        east: bounds.east + width * margin,
        west: bounds.west - width * margin,
    };

};

export const emptySearchFacets: SearchFacets = {
    price: { min: 0, max: 0 },
    types: [],
    subtypes: [],
};

export const activeFilterCount = ( filters: SearchFilters ): number =>
    Number(filters.geo !== null)
    + Number(filters.category !== null)
    + filters.types.length
    + filters.subtypes.length
    + Number(filters.rating !== null)
    + Number(filters.stars !== null)
    + Number(filters.nights !== null)
    + Number(filters.duration !== null)
    + Number(filters.inStock)
    + Number(filters.featured)
    + Number(filters.minPrice > 0 || filters.maxPrice !== null);

const needleOf = ( query: SearchQuery ): string => query.term.trim() || query.destination.trim();

export const sortsFor = ( query: SearchQuery, supports: SearchSupports ): readonly SearchSort[] =>
    searchSorts.filter(( sort ) => ( sort !== "relevance" || needleOf(query) !== "" ) && ( supports.sorts.length === 0 || supports.sorts.includes(sort) ) );

export const sortOf = ( query: SearchQuery ): SearchSort =>
    query.sort && sortsFor(query, emptySupports).includes(query.sort) ? query.sort : needleOf(query) ? "relevance" : "recommended";

export const searchTerms = ( query: SearchQuery, page: number, size = searchPageSize ): string => {

    const terms: string[] = [
        `limit=${ size }`,
        `page=${ page }`,
        `sort=${ sortOf(query) }`,
        "facets=type,subtype",
        "stats=min_price",
    ];

    const needle = needleOf(query);

    if ( needle ) terms.push(`query=${ encodeURIComponent(needle) }`);

    const filters: Record<string, string | number> = {};

    if ( query.filters.geo !== null ) filters.geo = query.filters.geo;
    if ( query.filters.category !== null ) filters.category = query.filters.category;
    if ( query.filters.types.length > 0 ) filters.type = query.filters.types.join(",");
    if ( query.filters.subtypes.length > 0 ) filters.subtype = query.filters.subtypes.join(",");
    if ( query.filters.minPrice > 0 ) filters.min_price = query.filters.minPrice;
    if ( query.filters.maxPrice !== null ) filters.max_price = query.filters.maxPrice;
    if ( query.filters.rating !== null ) filters.min_rating = query.filters.rating;
    if ( query.filters.stars !== null ) filters.min_stars = query.filters.stars;
    if ( query.filters.nights !== null ) filters.min_nights = query.filters.nights;
    if ( query.filters.duration !== null ) filters.max_duration = query.filters.duration;
    if ( query.filters.inStock ) filters.in_stock = 1;
    if ( query.filters.featured ) filters.featured = 1;

    if ( query.checkin && query.checkout ) {

        filters.checkin = query.checkin;
        filters.checkout = query.checkout;

        if ( query.rooms > 0 ) filters.rooms = query.rooms;
        if ( query.adults > 0 ) filters.adults = query.adults;
        if ( query.children > 0 ) filters.children = query.children;

    }

    for ( const [ name, value ] of Object.entries(filters) ) terms.push(`filters[${ name }]=${ encodeURIComponent(String(value)) }`);

    if ( query.bounds ) {

        for ( const edge of [ "north", "south", "east", "west" ] as const ) terms.push(`filters[bounds][${ edge }]=${ query.bounds[edge] }`);

    }

    return terms.join("&");

};

const bounding = ( items: readonly Listing[] ): SearchBounds | null => {

    const points = items.filter(( item ) => item.latitude !== null && item.longitude !== null );

    if ( points.length === 0 ) return null;

    const lats = points.map(( item ) => item.latitude as number );
    const lngs = points.map(( item ) => item.longitude as number );

    return paddedBounds({
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
    });

};

const counted = ( source: Record<string, number> | null ): readonly SearchFacetOption[] =>
    Object.entries(source ?? {})
        .map(([ key, count ]) => ({ key, count }) )
        .sort(( first, second ) => second.count - first.count );

export const hintOf = ( item: HintRow ): SearchHint => ({
    id: item.id,
    kind: item.entity ?? item.type ?? "catalog",
    label: item.label ?? item.name ?? "",
});

export const searchPageOf = ( page: SearchPage ): SearchResponse => {

    const items = listingsOf(page.rows);
    const meta = page.meta;
    const reach = meta?.stats?.min_price;
    const able = meta?.supports;

    return {
        items,
        total: meta?.total ?? items.length,
        page: meta?.page ?? 1,
        pages: meta?.pages ?? 1,
        supports: {
            filters: able?.filters ?? [],
            sorts: able?.sorts ?? [],
            facets: able?.facets ?? [],
        },
        facets: meta
            ? {
                price: {
                    min: Math.floor(Number(reach?.min ?? 0)),
                    max: Math.ceil(Number(reach?.max ?? 0)),
                },
                types: counted(oneOf(meta.facets?.type)),
                subtypes: counted(oneOf(meta.facets?.subtype)),
            }
            : emptySearchFacets,
        bounds: bounding(items),
    };

};
