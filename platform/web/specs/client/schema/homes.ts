import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "homes",
        path: "/homes",
        title: t("screens.homes.title"),
        description: t("screens.homes.description"),
        icon: "house-line",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "domain-property",
                        verticals: true,
                        headline: t("screens.homes.headline"),
                        perks: [
                            t("screens.homes.perks.one"), t("screens.homes.perks.two"), t("screens.homes.perks.three"),
                        ],
                        actions: [
                            { label: t("screens.homes.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.homes.actions.more"), path: "/categories", icon: "grid" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/homes", dates: "stay", guests: true } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted", type: "property", dates: "stay", limit: 24,
                        noun: t("screens.homes.results"),
                        groups: ["place", "price", "rating", "category"],
                        tabs: false,
                        layout: "list",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
