import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "category",
        path: "/categories/:categoryId",
        title: t("screens.category.title"),
        description: t("screens.category.description"),
        icon: "grid",
        entity: "category",
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [
                { name: "categories", heading: true, options: { view: "detail" } },
                {
                    name: "products",
                    options: { view: "faceted", scope: "category", limit: 12, groups: ["place", "price", "format", "rating"] },
                },
                { name: "categories", options: { view: "reviews" } },
            ],
        },
    ],
} satisfies SiteScreen;
