import { z } from "../../lib/providers/schema.ts";
import { browse, engage, get, many } from "../core/dsl.ts";
import { count, decimal, id, list, picture, text } from "../core/fields.ts";
import { attachment } from "./documents.ts";
import { place } from "./geos.ts";
import { product } from "./products.ts";
import { review } from "./reviews.ts";

const poi = z.object({
    id: z.number(),
    name: text,
    slug: text,
    kind: text,
    latitude: decimal,
    longitude: decimal,
    ...picture,
    attachments: z.array(attachment).nullish(),
    geo_id: z.number().nullish(),
    description: text,
    sort: count,
    geo: place.nullish(),
});
const poiId = { poiId: id };

export default {
    ...browse("/pois", poiId, poi),
    ...engage("/pois/{poiId}", poiId, ["like", "dislike", "visit", "unvisit", "favorite", "unfavorite", "report"]),
    products: get("/pois/{poiId}/catalogs", { ...poiId, ...list }, many(product)),
    reviews: get("/pois/{poiId}/reviews", { ...poiId, ...list }, many(review)),
};
