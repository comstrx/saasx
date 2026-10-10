import { z } from "../../lib/providers/schema.ts";
import { browse, engage, get, many } from "../core/dsl.ts";
import { count, decimal, flag, list, picture, ref, seoFields, tallies, text } from "../core/fields.ts";
import { coupon } from "./coupons.ts";
import { location, product } from "./products.ts";
import { review } from "./reviews.ts";

export const category = z.object({
    ...seoFields,
    id: z.number(),
    name: z.string(),
    description: text,
    icon: text,
    phone: text,
    ...picture,
    parent: z.object({ id: z.number(), name: text }).nullish(),
    geo: location,
    in_favorites: flag,
    ...tallies,
    childrens: count,
    catalogs: count,
    rating: decimal,
    orders: count,
    reviews: count,
});

const categoryId = { categoryId: ref };

export default {
    ...browse("/categories", categoryId, category, { cache: 60 }),
    ...engage("/categories/{categoryId}", categoryId, ["like", "dislike", "visit", "favorite", "unfavorite", "report"]),
    reviews: get("/categories/{categoryId}/reviews", { ...list, ...categoryId }, many(review)),
    coupons: get("/categories/{categoryId}/coupons", { ...list, ...categoryId }, many(coupon)),
    products: get("/categories/{categoryId}/catalogs", { ...list, categoryId: ref }, many(product)),
};
