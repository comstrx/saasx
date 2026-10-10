import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "stays",
        path: "/stays",
        title: t("screens.stays.title"),
        description: t("screens.stays.description"),
        icon: "bed",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "stay",
                        verticals: true,
                        headline: t("screens.stays.headline"),
                        perks: [t("screens.stays.perks.cancel"), t("screens.stays.perks.arrival"), t("screens.stays.perks.support")],
                        actions: [
                            { label: t("screens.stays.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.stays.actions.map"), path: "/destinations", icon: "map" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/stays", dates: "stay", guests: true } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted",
                        type: "hotel",
                        dates: "stay",
                        limit: 24,
                        noun: t("screens.stays.results"),
                        groups: ["place", "price", "stars", "rating", "category"],
                        tabs: false,
                        layout: "list",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
