import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "destinations",
        path: "/destinations",
        title: t("screens.destinations.title"),
        description: t("screens.destinations.description"),
        icon: "map",
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: { art: "travel" },
                    features: [{ name: "search", options: { target: "/browse", source: "places" } }],
                },
                { name: "geos", options: { view: "trending", title: t("destinations.popular"), limit: 5 } },
                { name: "geos", options: { view: "atlas", title: t("destinations.countries") } },
            ],
        },
    ],
} satisfies SiteScreen;
