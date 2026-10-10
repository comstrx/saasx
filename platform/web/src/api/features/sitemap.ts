import { z } from "../../lib/providers/schema.ts";
import { feature, get, many } from "../core/dsl.ts";
import { id, text } from "../core/fields.ts";

export const sitemapKinds = ["catalogs", "blogs", "categories", "geos", "vendors"] as const;

const row = z.object({
    id,
    slug: text,
    type: text,
    updated_at: text,
    image: text,
    locales: z.array(z.string().max(10)).max(30).nullish(),
});

export default feature({ execution: "server", cache: 600 }, {
    list: get("/content/sitemap", { kind: z.enum(sitemapKinds), page: z.number().int().positive().optional() }, many(row)),
});
