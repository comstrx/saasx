import { z } from "../../lib/providers/schema.ts";
import { browse, engage, get, many, suggestion } from "../core/dsl.ts";
import { count, decimal, dict, flag, id, list, picture, seoFields, suggest, text } from "../core/fields.ts";
import { category } from "./categories.ts";
import { attachment } from "./documents.ts";
import { product } from "./products.ts";
import { review } from "./reviews.ts";

const crumb = z.object({ id: z.number(), type: text, name: text, slug: text });

export const place = z.object({
    id: z.number(),
    name: text,
    slug: text,
    type: text,
    code: text,
    phone: text,
    destination: flag,
    latitude: decimal,
    longitude: decimal,
    ...picture,
});

export const geo = place.extend({
    ...seoFields,
    attachments: z.array(attachment).nullish(),
    parent_id: z.number().nullish(),
    description: text,
    overview: text,
    about: text,
    sort: count,
    parent: place.nullish(),
    breadcrumb: z.array(crumb).nullish(),
    childrens: count,
    catalogs: count,
});

const facets = z.object({
    types: dict(z.number()),
    categories: z.array(z.unknown()).nullish(),
    price_from: decimal,
    as_of: text,
    fresh: flag,
});
const atlas = z.object({
    node: geo.nullish(),
    breadcrumb: z.array(crumb).nullish(),
    children: z.array(place.extend({ catalogs_count: count })).nullish(),
    destinations: z.array(place).nullish(),
    attractions: z.array(z.unknown()).nullish(),
    facets: facets.nullish(),
});
const match = z.object({
    kind: text,
    id: z.number(),
    geo_id: z.number().nullish(),
    name: text,
    trail: z.array(z.string()).nullish(),
});
const typed = { request: { fields: { query: "search" } }, response: { data: "data.items" } };
const verbs = ["like", "dislike", "unreact", "reaction", "visit", "unvisit", "favorite", "unfavorite", "report"] as const;

type Key<K extends string> = { [P in K]: typeof id };
type Related<K extends string, R extends string> = { [P in R]: ReturnType<typeof relation<K>> };

function relation<const K extends string> ( base: string, input: Key<K>, name: string ) {

    return get(`${base}/${name}`, { ...input, ...list }, many(geo));

}
function region<const K extends string, const R extends string = never> ( route: string, key: K, relations: readonly R[] = [] ) {

    const input = { [key]: id } as Key<K>;
    const base = `${route}/{${key}}`;
    const related = Object.fromEntries(relations.map(( name ) => [name, relation(base, input, name)])) as Related<K, R>;

    return {
        ...browse(route, input, geo),
        suggest: get(`${route}/suggest`, suggest, many(suggestion), typed),
        ...engage(base, input, verbs),
        stats: get(`${base}/stats`, input, z.object({ stats: facets })),
        products: get(`${base}/catalogs`, { ...input, ...list }, many(product)),
        reviews: get(`${base}/reviews`, { ...input, ...list }, many(review)),
        ...related,
    };

}

export const countries = region("/countries", "countryId", ["regions", "cities"]);
export const regions = region("/regions", "regionId", ["cities"]);
export const cities = region("/cities", "cityId", ["districts"]);
export const districts = region("/districts", "districtId");

export default {
    ...browse("/geos", { geoId: id }, geo, { cache: 60 }),
    ...engage("/geos/{geoId}", { geoId: id }, ["like", "dislike", "visit", "unvisit", "favorite", "unfavorite", "report"]),
    atlas: get("/geos/browse", {}, atlas),
    explore: get("/geos/{geoId}/browse", { geoId: id }, atlas),
    complete: get("/geos/complete", suggest, z.object({ items: z.array(match) })),
    stats: get("/geos/{geoId}/stats", { geoId: id }, z.object({ stats: facets })),
    children: get("/geos/{geoId}/childrens", { geoId: id, ...list }, many(geo)),
    products: get("/geos/{geoId}/catalogs", { geoId: id, ...list }, many(product)),
    categories: get("/geos/{geoId}/categories", { geoId: id, ...list }, many(category)),
};
