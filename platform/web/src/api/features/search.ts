import { z } from "../../lib/providers/schema.ts";
import { get, many, suggestion } from "../core/dsl.ts";
import { list, picture, suggest, text } from "../core/fields.ts";
import { category } from "./categories.ts";
import { geo } from "./geos.ts";
import { product } from "./products.ts";

const other = z.object({
    entity: z.string(),
    id: z.number(),
    name: text,
    title: text,
    slug: text,
    ...picture,
});
const hit = z.union([
    product.extend({ entity: z.literal("catalog") }),
    category.extend({ entity: z.literal("category") }),
    geo.extend({ entity: z.literal("geo") }),
    other,
]);

export default {
    list: get("/search", list, many(hit)),
    suggest: get("/search/suggest", suggest, many(suggestion)),
};
