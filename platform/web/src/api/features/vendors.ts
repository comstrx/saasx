import { z } from "../../lib/providers/schema.ts";
import { browse, feature, get, many } from "../core/dsl.ts";
import { count, decimal, flag, id, list, picture, seoFields, text } from "../core/fields.ts";
import { place } from "./geos.ts";
import { review } from "./reviews.ts";

const vendor = z.object({
    ...seoFields,
    id: z.number(),
    name: text,
    ...picture,
    verified: flag,
    member_since: text,
    catalogs: count,
    reviews: count,
    rating: decimal,
    response: z.object({ rate: decimal, minutes: count }).nullish(),
    city: place.nullish(),
});
const vendorId = { vendorId: id };

export default feature({ touches: ["favorites"] }, {
    ...browse("/vendors", vendorId, vendor),
    reviews: get("/vendors/{vendorId}/reviews", { ...vendorId, ...list }, many(review)),
});
