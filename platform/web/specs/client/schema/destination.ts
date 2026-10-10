import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "destination",
        path: "/destinations/:geoId",
        title: t("screens.destination.title"),
        description: t("screens.destination.description"),
        icon: "pin",
        entity: "geo",
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [
                { name: "geos", heading: true, options: { view: "detail" } },
                {
                    name: "products",
                    options: { view: "faceted", scope: "geo", limit: 12, groups: ["price", "category", "format", "rating"] },
                },
            ],
        },
    ],
} satisfies SiteScreen;
