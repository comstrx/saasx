import { z } from "../../lib/providers/schema.ts";
import { del, feature, get, many } from "../core/dsl.ts";
import { ack, bulk, id, list, text } from "../core/fields.ts";
import { product } from "./products.ts";

const related = z.object({ id: z.number(), name: text, title: text, image: text, slug: text, type: text }).nullish();
const favorite = z.object({
    id: z.number(),
    related_type: text,
    related_id: z.number().nullish(),
    created_at: text,
    catalog: product.nullish(),
    category: related,
    blog: related,
    geo: related,
    poi: related,
});
const favoriteId = { favoriteId: id };

export default feature({ execution: "client", permissions: ["user"], touches: ["products", "articles", "categories", "geos", "pois"] }, {
    list: get("/favorites", list, many(favorite)),
    view: get("/favorites/{favoriteId}", favoriteId, favorite),
    delete: del("/favorites/{favoriteId}", favoriteId, ack),
    deleteMany: del("/favorites", { ids: z.array(id).min(1).max(100) }, bulk),
});
